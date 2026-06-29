import {useEffect, useState} from 'react';
import domObserver from '@/observers/dom';

function useDomObserver(selector, options = {}) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (selector == null || selector.length === 0) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing the observed DOM node into state
      setNode(null);
      return undefined;
    }

    function updateNode(foundNode) {
      if (foundNode == null) {
        foundNode = document.querySelector(selector);
      }

      // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing the observed DOM node into state
      setNode(foundNode);
    }

    updateNode();

    const unsubscribe = domObserver.on(selector, updateNode, options);
    return () => unsubscribe();
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- only the selector should recreate the observer
  }, [selector]);

  return node;
}

export default useDomObserver;
