export function createInlineSvg(svgRaw, options = {}) {
  const {className, size, decorative = true} = options;

  const wrap = document.createElement('span');
  if (className) {
    wrap.className = className;
  }
  wrap.innerHTML = svgRaw;

  const svg = wrap.querySelector('svg');
  if (svg != null && size != null) {
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
  }

  if (svg != null && decorative) {
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
  }

  return wrap;
}
