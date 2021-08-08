import React, {useState, useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import emoteStore from '../stores/index.js';

const ITEM_HEIGHT = 42;
const SIDEBAR_HEIGHT = 314;

export default function Sidebar({section, onChange, ...restProps}) {
  const containerRef = useRef(null);
  const [providers, setProviders] = useState(emoteStore.getProviders());

  useEffect(() => {
    function callback() {
      setProviders(emoteStore.getProviders());
    }

    emoteStore.on('updated', callback);

    return () => {
      emoteStore.off('updated', callback);
    };
  }, []);

  useEffect(() => {
    if (section.eventKey == null) return;

    const top = containerRef.current.scrollTop;
    const bottom = top + SIDEBAR_HEIGHT;
    const index = providers.findIndex((provider) => provider.id === section.eventKey);
    const depth = (index + 1) * ITEM_HEIGHT;

    if (depth > bottom) {
      containerRef.current.scrollTo({
        top: depth - SIDEBAR_HEIGHT,
        left: 0,
        behavior: 'smooth',
      });

      return;
    }

    if (top > depth - ITEM_HEIGHT) {
      containerRef.current.scrollTo({
        top: depth - ITEM_HEIGHT,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [section]);

  return (
    <div {...restProps} ref={containerRef}>
      <Nav vertical appearance="subtle" onSelect={onChange} activeKey={section.eventKey}>
        {providers.map((provider) => (
          <Nav.Item key={provider.id} eventKey={provider.id} icon={provider.icon} />
        ))}
      </Nav>
    </div>
  );
}
