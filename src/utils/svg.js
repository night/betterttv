export function createInlineSvg(svgRaw, options = {}) {
  const {className, size, decorative = true} = options;

  const container = document.createElement('span');
  if (className) {
    container.className = className;
  }
  container.innerHTML = svgRaw;

  const svg = container.querySelector('svg');
  if (svg != null && size != null) {
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
  }

  if (svg != null && decorative) {
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
  }

  return container;
}
