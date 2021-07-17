export function isFrame() {
  try {
    return window.self !== window.top;
  } catch (_) {
    return true;
  }
}

export function isPopout() {
  try {
    return window.opener && window.opener !== window;
  } catch (_) {
    return true;
  }
}
