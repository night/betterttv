// Minimal cookie helpers. We avoid cookies-js because it probes cookie support
// (and builds Date instances) at import time, which throws on pages that patch Date.
const MAX_EXPIRES = 'Fri, 31 Dec 9999 23:59:59 GMT';

export function getCookie(key) {
  const encodedKey = `${encodeURIComponent(key)}=`;
  for (const part of document.cookie.split(';')) {
    const cookie = part.trimStart();
    if (!cookie.startsWith(encodedKey)) {
      continue;
    }
    try {
      return decodeURIComponent(cookie.slice(encodedKey.length));
    } catch (_) {
      return null;
    }
  }
  return null;
}

export function setCookie(key, value) {
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; expires=${MAX_EXPIRES}`;
}
