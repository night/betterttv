import React, {useState, useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import emoteStore from '../stores/index.js';

const ITEM_HEIGHT = 42;
const SIDEBAR_HEIGHT = 314;

function Sidebar({focus, onChange, ...restProps}) {
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
    if (focus.eventKey == null) return;

    const top = containerRef.current.scrollTop;
    const bottom = top + SIDEBAR_HEIGHT;
    const index = providers.findIndex((provider) => provider.id === focus.eventKey);
    const depth = (index + 1) * ITEM_HEIGHT;

    if (depth > bottom) {
      containerRef.current.scrollTo({
        top: depth - SIDEBAR_HEIGHT,
        left: 0,
        behavior: 'smooth',
      });
    }

    if (top > depth - ITEM_HEIGHT) {
      containerRef.current.scrollTo({
        top: depth - ITEM_HEIGHT,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [focus]);

  return (
    <div {...restProps} ref={containerRef}>
      <Nav vertical appearance="subtle" onSelect={onChange} activeKey={focus.eventKey}>
        {providers.map((provider) => (
          <Nav.Item key={provider.id} eventKey={provider.id} icon={<Icon>{provider.icon()}</Icon>} />
        ))}
      </Nav>
    </div>
  );
}

export default React.memo(Sidebar, ({focus: a}, {focus: b}) => a === b);
