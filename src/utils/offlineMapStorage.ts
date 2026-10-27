/**
 * TCDD KM TAKİP - Çevrimdışı Harita & Yerel Depolama (Tile Caching) Modülü
 *
 * Harita parçalarını (tiles) CacheStorage ve IndexedDB üzerinde saklar,
 * tamamen internetsiz ortamlarda temel hat haritasını kesintisiz sunar.
 */

export const TILE_CACHE_NAME = 'demiryolu-km-tiles-v1';
export const OFFLINE_MODE_STORAGE_KEY = 'tcdd_force_offline_mode';
export const OFFLINE_VECTOR_ONLY_KEY = 'tcdd_offline_vector_only';

export interface OfflineCacheStats {
  tileCount: number;
  estimatedSizeBytes: number;
  formattedSize: string;
  lastUpdated: string | null;
}

export interface TileDownloadProgress {
  current: number;
  total: number;
  percentage: number;
  statusText: string;
  isCompleted: boolean;
  isError?: boolean;
  errorText?: string;
}

/**
 * Slippy map tile koordinat dönüşümü (WGS84 Lat/Lng -> Tile X, Y, Z)
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return {
    x: Math.max(0, Math.min(n - 1, x)),
    y: Math.max(0, Math.min(n - 1, y)),
    z: zoom,
  };
}

/**
 * Tile URL oluşturucu (Standart OpenStreetMap)
 */
export function getOsmTileUrl(z: number, x: number, y: number): string {
  // Use tile.openstreetmap.org directly to match service worker cache patterns
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

/**
 * Çevrimdışı Modun Zorla Açık Olup Olmadığını Kontrol Eder
 */
export function isForceOfflineMode(): boolean {
  try {
    return localStorage.getItem(OFFLINE_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Çevrimdışı Modu Açar veya Kapatır
 */
export function setForceOfflineMode(enabled: boolean): void {
  try {
    localStorage.setItem(OFFLINE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('tcdd_offline_mode_changed', { detail: { enabled } }));
  } catch {}
}

/**
 * Önbellekteki harita karolarının sayısını ve tahmini boyutunu hesaplar
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  if (typeof caches === 'undefined') {
    return { tileCount: 0, estimatedSizeBytes: 0, formattedSize: '0 KB', lastUpdated: null };
  }

  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    const keys = await cache.keys();
    const count = keys.length;

    // Her OSM PNG karosu ortalama 15-28 KB arasındadır.
    const averageTileBytes = 22 * 1024;
    const estimatedSizeBytes = count * averageTileBytes;

    let formattedSize = '0 KB';
    if (estimatedSizeBytes > 1024 * 1024 * 1024) {
      formattedSize = `${(estimatedSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (estimatedSizeBytes > 1024 * 1024) {
      formattedSize = `${(estimatedSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (estimatedSizeBytes > 0) {
      formattedSize = `${Math.round(estimatedSizeBytes / 1024)} KB`;
    }

    const lastUpdated = localStorage.getItem('tcdd_offline_tiles_last_updated') || null;

    return {
      tileCount: count,
      estimatedSizeBytes,
      formattedSize,
      lastUpdated,
    };
  } catch (err) {
    console.warn('Önbellek istatistikleri okunamadı:', err);
    return { tileCount: 0, estimatedSizeBytes: 0, formattedSize: '0 KB', lastUpdated: null };
  }
}

/**
 * Tüm harita önbelleğini siler
 */
export async function clearOfflineTileCache(): Promise<boolean> {
  if (typeof caches === 'undefined') return true;
  try {
    const deleted = await caches.delete(TILE_CACHE_NAME);
    localStorage.removeItem('tcdd_offline_tiles_last_updated');
    window.dispatchEvent(new CustomEvent('tcdd_offline_tiles_cleared'));
    return deleted;
  } catch (err) {
    console.error('Önbellek silinemedi:', err);
    return false;
  }
}

/**
 * Verilen koordinatlar boyunca (Demiryolu hattı etrafında) gerekli tile'ları hesaplar
 */
export function calculateTilesAlongPath(
  coords: { lat: number; lng: number }[],
  zoomLevels: number[] = [8, 9, 10, 11, 12],
  bufferSteps = 1
): { z: number; x: number; y: number; url: string }[] {
  if (!coords || coords.length === 0) return [];

  const tileSet = new Set<string>();
  const result: { z: number; x: number; y: number; url: string }[] = [];

  zoomLevels.forEach((zoom) => {
    coords.forEach((coord) => {
      const center = latLngToTile(coord.lat, coord.lng, zoom);
      for (let dx = -bufferSteps; dx <= bufferSteps; dx++) {
        for (let dy = -bufferSteps; dy <= bufferSteps; dy++) {
          const x = center.x + dx;
          const y = center.y + dy;
          const key = `${zoom}/${x}/${y}`;
          if (!tileSet.has(key)) {
            tileSet.add(key);
            result.push({
              z: zoom,
              x,
              y,
              url: getOsmTileUrl(zoom, x, y),
            });
          }
        }
      }
    });
  });

  return result;
}

/**
 * Bounding Box (Sınır Kutusu) içindeki tüm tile'ları hesaplar
 */
export function calculateTilesInBounds(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  zoomLevels: number[] = [8, 9, 10, 11]
): { z: number; x: number; y: number; url: string }[] {
  const result: { z: number; x: number; y: number; url: string }[] = [];
  const tileSet = new Set<string>();

  zoomLevels.forEach((zoom) => {
    const topLeft = latLngToTile(bounds.maxLat, bounds.minLng, zoom);
    const bottomRight = latLngToTile(bounds.minLat, bounds.maxLng, zoom);

    const minX = Math.min(topLeft.x, bottomRight.x);
    const maxX = Math.max(topLeft.x, bottomRight.x);
    const minY = Math.min(topLeft.y, bottomRight.y);
    const maxY = Math.max(topLeft.y, bottomRight.y);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${zoom}/${x}/${y}`;
        if (!tileSet.has(key)) {
          tileSet.add(key);
          result.push({
            z: zoom,
            x,
            y,
            url: getOsmTileUrl(zoom, x, y),
          });
        }
      }
    }
  });

  return result;
}

/**
 * Belirlenen karo listesini arka planda indirip CacheStorage'a kaydeder.
 * Concurrency kontrolü ve AbortSignal desteği içerir.
 */
export async function downloadAndCacheTiles(
  tiles: { z: number; x: number; y: number; url: string }[],
  onProgress?: (progress: TileDownloadProgress) => void,
  signal?: AbortSignal
): Promise<{ downloaded: number; total: number; skipped: number }> {
  if (typeof caches === 'undefined') {
    throw new Error('Tarayıcınız CacheStorage API desteği sunmuyor.');
  }

  const cache = await caches.open(TILE_CACHE_NAME);
  const total = tiles.length;
  let downloaded = 0;
  let skipped = 0;

  if (total === 0) {
    if (onProgress) {
      onProgress({
        current: 0,
        total: 0,
        percentage: 100,
        statusText: 'İndirilecek karo bulunamadı.',
        isCompleted: true,
      });
    }
    return { downloaded: 0, total: 0, skipped: 0 };
  }

  // Eşzamanlı istek limiti (OSM hız sınırlamasını aşmamak için 5 paralel istek)
  const CONCURRENCY = 5;
  const queue = [...tiles];

  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) {
        throw new Error('İndirme kullanıcı tarafından iptal edildi.');
      }

      const item = queue.shift();
      if (!item) break;

      try {
        // Önce önbellekte var mı kontrol et
        const existing = await cache.match(item.url);
        if (existing) {
          skipped++;
        } else {
          // Ağdan çek
          const response = await fetch(item.url, {
            mode: 'cors',
            cache: 'no-cache',
            signal,
          });

          if (response.ok) {
            await cache.put(item.url, response);
            downloaded++;
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') throw err;
        // Sessizce devam et
      }

      const completedCount = downloaded + skipped;
      const pct = Math.round((completedCount / total) * 100);

      if (onProgress) {
        onProgress({
          current: completedCount,
          total,
          percentage: pct,
          statusText: `${completedCount} / ${total} karo işlendi (%${pct})`,
          isCompleted: completedCount >= total,
        });
      }

      // Nazik gecikme (15ms)
      await new Promise((r) => setTimeout(r, 15));
    }
  };

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  localStorage.setItem('tcdd_offline_tiles_last_updated', new Date().toISOString());

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 100,
      statusText: `Tamamlandı! ${downloaded} yeni karo önbelleğe alındı (${skipped} zaten kayıtlıydı).`,
      isCompleted: true,
    });
  }

  return { downloaded, total, skipped };
}

/**
 * Çevrimdışı Modda eksik kalan karolar için şık SVG Canvas Placeholder üretir
 */
export function generateOfflinePlaceholderTileUrl(z: number, x: number, y: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <line x1="0" y1="64" x2="256" y2="64" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="0" y1="128" x2="256" y2="128" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="0" y1="192" x2="256" y2="192" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="64" y1="0" x2="64" y2="256" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="128" y1="0" x2="128" y2="256" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="192" y1="0" x2="192" y2="256" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="128" y="125" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="700" fill="#94a3b8" text-anchor="middle">
        TCDD ÇEVRİMDIŞI
      </text>
      <text x="128" y="140" font-family="monospace" font-size="8" fill="#cbd5e1" text-anchor="middle">
        Z${z} / ${x},${y}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
