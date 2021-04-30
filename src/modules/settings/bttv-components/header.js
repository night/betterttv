import React from 'react';

function Header({heading, description}) {
  return (
    <div>
      <h3>{heading}</h3>
      <p className="bttv-muted-text">{description}</p>
    </div>
  );
}

export default Header;
