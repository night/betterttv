// Central icon registry. Re-exports the Hugeicons Pro set by default; webpack replaces
// the underlying module with the Font Awesome fallback at build time when Hugeicons Pro
// is not installed. Import icons from here instead of from a vendor package directly.
export * from './index.hugeicons.js';
