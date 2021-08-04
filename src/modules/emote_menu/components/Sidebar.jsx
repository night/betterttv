import React, {useState, useEffect} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import emoteStore from '../stores/index.js';

export default function Sidebar({focus, onChange, ...restProps}) {
  const [providers, setProviders] = useState(emoteStore.providers);

  useEffect(() => {
    function callback() {
      setProviders(emoteStore.providers);
    }

    emoteStore.on('loaded', callback);

    return () => {
      emoteStore.off('loaded', callback);
    };
  }, []);

  return (
    <div {...restProps}>
      <Nav vertical appearance="subtle" onSelect={onChange} activeKey={focus.eventKey}>
        {providers.map(({provider}) => (
          <Nav.Item key={provider.id} eventKey={provider.id} icon={<Icon>{provider.icon()}</Icon>} />
        ))}
      </Nav>
    </div>
  );
}
