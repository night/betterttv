import React from 'react';
import Nav from 'rsuite/lib/Nav/index.js';

const emojis = ['🚀', '🎥', '🌞', '🎉', '🍌', '🍍', '🍎', '😛', '🚀', '🎥', '🌞', '🎉', '🍌', '🍍', '🍎', '😛'];

export default function Sidebar({...restProps}) {
  return (
    <div {...restProps}>
      <Nav vertical appearance="subtle">
        {emojis.map((emoji) => (
          <Nav.Item key={emoji} eventKey={emoji}>
            {emoji}
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}
