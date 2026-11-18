// Kalıcı veri katmanı.
// DATABASE_URL tanımlıysa "data" klasöründeki ana JSON dosyaları Postgres (Neon) veritabanında saklanır.
// Tanımlı değilse hiçbir şey değişmez, dosyalar eskisi gibi diske yazılır.
//
// Çalışma şekli: sunucu açılırken veriler veritabanından belleğe yüklenir, okumalar bellekten yapılır,
// yazmalar belleğe anında, veritabanına kısa bir gecikmeyle (birleştirilerek) yazılır.
import realFs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Veritabanında saklanacak dosyalar. Yedek ve geri yükleme dosyaları (büyük kopyalar)
// bilerek bu listede yok, onlar eskisi gibi geçici diske yazılır.
const PERSISTENT_FILES = new Set([
  'railway_points.json',
  'deleted_points.json',
  'deleted_takyidat.json',
  'deleted_users.json',
  'users.json',
  'database_state.json',
  'audit_logs.json',
  'takyidat_restrictions.json',
  'railway_parcels.json',
  'deleted_parcels.json',
  'field_works.json',
  'deleted_field_works.json'
]);

const DATABASE_URL = process.env.DATABASE_URL || '';
const USE_DB = DATABASE_URL.length > 0;
const FLUSH_DELAY_MS = 2500;

type Entry = { content: string; mtimeMs: number };

const cache = new Map<string, Entry>();
const dirty = new Set<string>();
let ready = !USE_DB; // DB yoksa hazır sayılır
let pool: any = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing: Promise<void> | null = null;
let clock = Date.now();

function tick(): number {
  clock = Math.max(clock + 1, Date.now());
  return clock;
}

function keyOf(file: string): string | null {
  if (!USE_DB) return null;
  const resolved = path.resolve(String(file));
  if (path.dirname(resolved) !== path.resolve(DATA_DIR)) return null;
  const base = path.basename(resolved);
  return PERSISTENT_FILES.has(base) ? base : null;
}

function enoent(file: string): Error {
  const err: any = new Error(`ENOENT: no such file or directory, open '${file}'`);
  err.code = 'ENOENT';
  return err;
}

// ---------------- fs ile uyumlu fonksiyonlar ----------------

function existsSync(file: any): boolean {
  const key = keyOf(file);
  if (key) return cache.has(key);
  return realFs.existsSync(file);
}

function readFileSync(file: any, ...rest: any[]): any {
  const key = keyOf(file);
  if (key) {
    const entry = cache.get(key);
    if (!entry) throw enoent(String(file));
    return entry.content;
  }
  return (realFs.readFileSync as any)(file, ...rest);
}

function writeFileSync(file: any, data: any, ...rest: any[]): void {
  const key = keyOf(file);
  if (key) {
    const content = typeof data === 'string' ? data : Buffer.from(data).toString('utf-8');
    cache.set(key, { content, mtimeMs: tick() });
    if (ready) {
      dirty.add(key);
      scheduleFlush();
    }
    return;
  }
  (realFs.writeFileSync as any)(file, data, ...rest);
}

function mkdirSync(file: any, ...rest: any[]): any {
  return (realFs.mkdirSync as any)(file, ...rest);
}

function statSync(file: any, ...rest: any[]): any {
  const key = keyOf(file);
  if (key) {
    const entry = cache.get(key);
    if (!entry) throw enoent(String(file));
    return { size: Buffer.byteLength(entry.content, 'utf-8'), mtimeMs: entry.mtimeMs, isFile: () => true };
  }
  return (realFs.statSync as any)(file, ...rest);
}

// Sunucudaki diğer fs kullanımları için (varsa) gerçek fs'e yönlendir
const fsShim: any = new Proxy(
  { existsSync, readFileSync, writeFileSync, mkdirSync, statSync },
  {
    get(target: any, prop: string) {
      if (prop in target) return target[prop];
      return (realFs as any)[prop];
    }
  }
);

export default fsShim;

// ---------------- veritabanı ----------------

async function getPool(): Promise<any> {
  if (pool) return pool;
  const spec = 'pg';
  const mod: any = await import(spec);
  const Pool = mod.Pool || (mod.default && mod.default.Pool);
  pool = new Pool({ connectionString: DATABASE_URL, max: 3, idleTimeoutMillis: 20000, connectionTimeoutMillis: 15000 });
  pool.on('error', (err: any) => console.error('[DB] Bağlantı havuzu hatası:', err && err.message));
  return pool;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushPersistence();
  }, FLUSH_DELAY_MS);
}

async function upsert(key: string, content: string): Promise<void> {
  const p = await getPool();
  await p.query(
    `INSERT INTO app_kv (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, content]
  );
}

// Bekleyen tüm değişiklikleri veritabanına yazar
export async function flushPersistence(): Promise<void> {
  if (!USE_DB || !ready) return;
  if (flushing) {
    await flushing;
    if (dirty.size === 0) return;
  }
  flushing = (async () => {
    const keys = Array.from(dirty);
    for (const key of keys) {
      const entry = cache.get(key);
      if (!entry) {
        dirty.delete(key);
        continue;
      }
      const snapshot = entry.content;
      try {
        await upsert(key, snapshot);
        // yazma sırasında içerik yeniden değiştiyse işaret kalsın
        const now = cache.get(key);
        if (!now || now.content === snapshot) dirty.delete(key);
      } catch (err: any) {
        console.error(`[DB] ${key} kaydedilemedi, tekrar denenecek:`, err && err.message);
        scheduleFlush();
      }
    }
  })();
  try {
    await flushing;
  } finally {
    flushing = null;
  }
  if (dirty.size > 0) scheduleFlush();
}

// Sunucu açılırken bir kez çağrılır: veritabanından verileri belleğe yükler.
export async function initPersistence(): Promise<void> {
  if (!USE_DB) {
    console.log('[DB] DATABASE_URL tanımlı değil: veriler yerel dosyalara yazılıyor (yeniden yayınlamada silinebilir).');
    return;
  }

  let lastErr: any = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const p = await getPool();
      await p.query(
        `CREATE TABLE IF NOT EXISTS app_kv (
           key text PRIMARY KEY,
           value text NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`
      );
      const res = await p.query('SELECT key, value FROM app_kv');
      const fromDb = new Map<string, string>();
      for (const row of res.rows) fromDb.set(row.key, row.value);

      let imported = 0;
      let loaded = 0;
      for (const key of PERSISTENT_FILES) {
        if (fromDb.has(key)) {
          // Veritabanındaki veri her zaman önceliklidir
          cache.set(key, { content: fromDb.get(key) as string, mtimeMs: tick() });
          loaded++;
          continue;
        }
        // Veritabanında yok: projedeki yerel dosya varsa ilk kez içe aktar
        const localPath = path.join(DATA_DIR, key);
        let content: string | null = null;
        try {
          if (realFs.existsSync(localPath)) content = realFs.readFileSync(localPath, 'utf-8');
        } catch {
          content = null;
        }
        if (content === null && cache.has(key)) content = (cache.get(key) as Entry).content;
        if (content !== null) {
          cache.set(key, { content, mtimeMs: tick() });
          await upsert(key, content);
          imported++;
        }
      }

      ready = true;
      console.log(`[DB] Veritabanına bağlanıldı. ${loaded} kayıt yüklendi, ${imported} dosya ilk kez içe aktarıldı.`);
      return;
    } catch (err: any) {
      lastErr = err;
      console.error(`[DB] Bağlantı denemesi ${attempt}/4 başarısız:`, err && err.message);
      await new Promise((r) => setTimeout(r, 2500 * attempt));
    }
  }
  // Sessizce yerel dosyaya düşmek verinin kaybolmasına yol açar, bu yüzden açıkça durdur.
  throw new Error('Veritabanına bağlanılamadı: ' + (lastErr && lastErr.message));
}

export function storageMode(): 'database' | 'file' {
  return USE_DB && ready ? 'database' : 'file';
}

// Sunucu kapanırken bekleyen kayıtları yaz
function onShutdown() {
  flushPersistence()
    .catch(() => undefined)
    .finally(() => process.exit(0));
  setTimeout(() => process.exit(0), 8000).unref();
}
if (USE_DB) {
  process.on('SIGTERM', onShutdown);
  process.on('SIGINT', onShutdown);
}
