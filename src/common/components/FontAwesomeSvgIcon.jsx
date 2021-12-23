import React from 'react';

export default function FontAwesomeSvgIcon({fontAwesomeIcon: {width, height, svgPathData}, ...rest}) {
  return (
    <svg {...rest} viewBox={`0 0 ${width} ${height}`} fill="currentColor">
      <path d={svgPathData} />
    </svg>
  );
}
