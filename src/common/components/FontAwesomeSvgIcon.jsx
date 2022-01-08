import React from 'react';

export default function FontAwesomeSvgIcon({fontAwesomeIcon: {width = 20, height = 20, svgPathData}, ...restProps}) {
  return (
    <svg {...restProps} viewBox={`0 0 ${width} ${height}`} fill="currentColor">
      <path d={svgPathData} />
    </svg>
  );
}
