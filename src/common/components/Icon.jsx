import React from 'react';

function Icon({icon, size = 16, className}) {
  if (icon?.icon == null) {
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
