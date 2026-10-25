// Demiryolu Hat Yönetimi Servisi (Kalıcı Hatlar)
// Yalnızca aktif tanımlı hatlar: Eskişehir-Konya ve Alayunt-Balıkesir

const SAVED_LINES_KEY = 'demiryolu_saved_custom_lines_v2';

export const DEFAULT_LINES_PRESET: string[] = [
  'Eskişehir-Konya',
  'Alayunt-Balıkesir',
];

export function getStoredLines(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_LINES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter((l) => typeof l === 'string' && (l === 'Eskişehir-Konya' || l === 'Alayunt-Balıkesir'));
        if (valid.length > 0) {
          // Ensure both canonical lines exist
          const merged = Array.from(new Set([...valid, ...DEFAULT_LINES_PRESET]));
          return merged;
        }
      }
    }
  } catch {}
  return [...DEFAULT_LINES_PRESET];
}

export function saveStoredLines(lines: string[]) {
  try {
    const cleanLines = Array.from(new Set(lines.map((l) => l.trim()).filter(Boolean)));
    localStorage.setItem(SAVED_LINES_KEY, JSON.stringify(cleanLines));
    try {
      window.dispatchEvent(new CustomEvent('demiryolu_lines_updated', { detail: cleanLines }));
    } catch {}
  } catch {}
}

export function addCustomLine(newLineName: string): string[] {
  const trimmed = newLineName.trim();
  if (!trimmed) return getStoredLines();
  const current = getStoredLines();
  if (!current.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
    current.push(trimmed);
    saveStoredLines(current);
  }
  return current;
}

export function removeCustomLine(lineToRemove: string): string[] {
  const current = getStoredLines().filter((l) => l.toLowerCase() !== lineToRemove.trim().toLowerCase());
  // Ensure we don't end up with empty list
  const finalList = current.length > 0 ? current : [...DEFAULT_LINES_PRESET];
  saveStoredLines(finalList);
  return finalList;
}
