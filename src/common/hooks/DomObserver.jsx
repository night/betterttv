import {useEffect, useState} from 'react';
import domObserver from '@/observers/dom';

function useDomObserver(selector, options = {}) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (selector == null || selector.length === 0) {
      setNode(null);
      return undefined;
    }

    function updateNode(foundNode) {
      if (foundNode == null) {
        foundNode = document.querySelector(selector);
      }

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
