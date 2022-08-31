import React from 'react';
import {Button, Divider, Header, Popover} from 'rsuite';
import {getReactInstance, searchReactParents} from '../../../utils/twitch.js';
import styles from './Menu.module.css';

export default function ContextMenu() {
  const popoverRef = React.useRef(null);
  const [messageContext, setMessageContext] = React.useState(null);
  const [popoverPosition, setPopoverPosition] = React.useState({x: 0, y: 0});

  React.useEffect(() => {
    function contextMenuHandler(event) {
      const reactNode = searchReactParents(getReactInstance(event.target), (node) => {
        if (node.pendingProps != null && node.pendingProps.message) {
          return true;
        }
        return false;
      });

      if (reactNode != null) {
        event.preventDefault();
        setPopoverPosition({x: event.clientX, y: event.clientY});
        setMessageContext(reactNode.pendingProps.message);
      }
    }

    window.addEventListener('contextmenu', contextMenuHandler);

    return () => {
      window.removeEventListener('contextmenu', contextMenuHandler);
    };
  }, []);

  return (
    <Popover
      className={styles.popover}
      ref={popoverRef}
      visible={messageContext != null}
      style={{
        left: popoverPosition.x,
        top: popoverPosition.y,
      }}>
      <Header className={styles.heading}>{messageContext?.user?.userDisplayName}</Header>
      <Divider className={styles.divider} />
      <div className={styles.buttons}>
        <Button appearance="subtle" size="xs">
          Reply
        </Button>
        <Button appearance="subtle" size="xs">
          Add Highlight
        </Button>
        <Button appearance="subtle" size="xs">
          Block
        </Button>
      </div>
    </Popover>
  );
}
