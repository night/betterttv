const FILTERS_CONTAINER_ID = 'bttv-username-effect-filters';

// SVG filters referenced by the username effect styles (`filter: url(#stroke-text-svg-filter-<effect>)`).
// Filter refs only resolve within their own tree scope, so the markup is injected into every root that
// renders an effect (page DOM for chat, shadow DOM for settings previews); it's inlined rather than
// linked from an .svg because Chrome doesn't support external/data-uri filter refs from CSS.
//
// Each filter draws a dilated outline behind the (background-clipped) text with a thicker bottom edge
// that reads as a drop shadow. Each color is a near-black tint of its effect's texture (trailing
// comments are the sampled source color) so the shadow hints at its hue.
const STROKE_FILTER_COLORS = {
  'stroke-text-svg-filter-iridescence': '#2f395f', // from #c5d1ef (iridescence.png)
  'stroke-text-svg-filter-supernova': '#702838', // from #fc8f9d (supernova.png)
  'stroke-text-svg-filter-glacier': '#166258', // from #6aecd7 (glacier.png)
  'stroke-text-svg-filter-intergalactic': '#4e316c', // from #cdb0e1 (intergalactic.png)
  'stroke-text-svg-filter-midas': '#674911', // from #f7d276 (midas.png)
};

function strokeFilter(id, color) {
  return `
      <filter id="${id}" x="-20%" y="-20%" width="140%" height="150%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="dilated" />
        <feOffset in="dilated" dy="2" result="dilatedBottom" />
        <feFlood flood-color="${color}" result="outlineColor" />
        <feComposite in="outlineColor" in2="dilatedBottom" operator="in" result="bottomOutline" />
        <feComposite in="outlineColor" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="bottomOutline" />
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>`;
}

const FILTERS_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0">
    <defs>${Object.entries(STROKE_FILTER_COLORS)
      .map(([id, color]) => strokeFilter(id, color))
      .join('')}
    </defs>
  </svg>
`;

export default function injectUsernameEffectFilters(root = document.body) {
  if (root == null || root.querySelector(`#${FILTERS_CONTAINER_ID}`) != null) {
    return;
  }

  const container = document.createElement('div');
  container.id = FILTERS_CONTAINER_ID;
  container.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  container.innerHTML = FILTERS_SVG;
  root.appendChild(container);
}
