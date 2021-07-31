import React, {useState, useEffect} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import grid from '../grid.js';

export default function Sidebar({focus, onChange, ...restProps}) {
  const [providers, setProviders] = useState(grid.getHeaders());

  useEffect(() => {
    function callback() {
      setProviders(grid.getHeaders());
    }

    grid.on('loaded', callback);

    return () => {
      grid.off('loaded', callback);
    };
  }, []);

  return (
    <div {...restProps}>
      <Nav vertical appearance="subtle" onSelect={onChange} activeKey={focus.eventKey}>
        {providers.map(({icon, id}) => (
          <Nav.Item key={id} eventKey={id} icon={<Icon>{icon()}</Icon>} />
        ))}
      </Nav>
    </div>
  );
}
