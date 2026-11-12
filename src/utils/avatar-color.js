// picked from the login so a user keeps their colour, each dark enough for the white initial
const AVATAR_COLORS = [
  'var(--mantine-color-red-7)',
  'var(--mantine-color-pink-7)',
  'var(--mantine-color-grape-7)',
  'var(--mantine-color-violet-7)',
  'var(--mantine-color-indigo-7)',
  'var(--mantine-color-blue-7)',
  'var(--mantine-color-cyan-8)',
  'var(--mantine-color-teal-8)',
  'var(--mantine-color-green-8)',
  'var(--mantine-color-orange-8)',
];

// FNV-1a: similar logins (a shared prefix, a trailing number) still spread across the colours
export function getAvatarColor(login) {
  let hash = 0x811c9dc5;
  for (const char of login.toLowerCase()) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
  }
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}
