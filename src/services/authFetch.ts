// Sunucuya giden /api isteklerine oturum anahtarını (token) otomatik ekler.
// api.ts ve authApi.ts içinde "fetch" yerine bu fonksiyon kullanılır.
const AUTH_TOKEN_KEY = 'demiryolu_auth_token';

function readAuthToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  try {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const isApi = url.startsWith('/api/') || url.startsWith(globalThis.location.origin + '/api/');
    const token = readAuthToken();
    if (isApi && token) {
      const baseHeaders = init?.headers || (typeof input === 'object' && !(input instanceof URL) ? (input as Request).headers : undefined);
      const headers = new Headers(baseHeaders);
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
      return nativeFetch(input, { ...init, headers });
    }
  } catch {
    // token eklenemezse istek olduğu gibi gönderilir
  }
  return nativeFetch(input, init);
}
