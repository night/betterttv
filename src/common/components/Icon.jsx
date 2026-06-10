import React from 'react';

// Renders an icon from either Hugeicons Pro (an array of [tag, attrs] tuples on a
// 24x24 viewBox) or Font Awesome (an object whose `icon` field is [width, height, …, path]).
// The icon source is chosen at build time (see src/common/icons), so both shapes must render.
function Icon({icon, size = 16, className}) {
  if (icon == null) {
    return null;
  }

  // Hugeicons: array of ['path', {d, fill, key}] tuples.
  if (Array.isArray(icon)) {
    return (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        className={className}>
        {icon.map(([Tag, {key, ...attrs}], i) => (
          <Tag key={key ?? i} {...attrs} />
        ))}
      </svg>
    );
  }

  // Font Awesome fallback.
  if (icon.icon == null) {
    return null;
  }

  const [width, height, , , svgPathData] = icon.icon;

  return (
    <svg
      fill="currentColor"
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}>
      {Array.isArray(svgPathData) ? svgPathData.map((path, i) => <path key={i} d={path} />) : <path d={svgPathData} />}
    </svg>
  );
}

export default Icon;
