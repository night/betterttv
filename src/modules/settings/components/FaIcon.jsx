import React from 'react';

export default function FaSvgIcon({faIcon, ...rest}) {
  const {width, height, svgPathData} = faIcon;
  return (
    <svg {...rest} viewBox={`0 0 ${width} ${height}`} width="2em" height="2em" fill="currentColor">
      <path d={svgPathData} />
    </svg>
  );
}
