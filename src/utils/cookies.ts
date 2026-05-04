export function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  const expiry = maxAgeSeconds ? `; max-age=${maxAgeSeconds}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${expiry}; SameSite=Strict`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
