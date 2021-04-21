import SafeEventEmitter from '../utils/safe-event-emitter.js';

const IGNORED_HTML_TAGS = new Set(['BR', 'HEAD', 'LINK', 'META', 'SCRIPT', 'STYLE']);

let observer;
const observedIds = Object.create(null);
const observedClassNames = Object.create(null);
const observedTestSelectors = Object.create(null);
const attributeObservers = new Map();

function parseSelector(selector) {
  const partialSelectors = selector.split(',').map((s) => s.trim());
  const ids = [];
  const classNames = [];
  const testSelectors = [];
  for (const partialSelector of partialSelectors) {
    if (partialSelector.startsWith('#')) {
      ids.push({
        key: partialSelector.split(' ')[0].split('#')[1],
        partialSelector,
      });
    } else if (partialSelector.startsWith('.')) {
      classNames.push({
        key: partialSelector.split(' ')[0].split('.')[1],
        partialSelector,
      });
    } else if (partialSelector.includes('[data-test-selector')) {
      testSelectors.push({
        key: partialSelector.split(' ')[0].split('[data-test-selector="')[1].split('"]')[0],
        partialSelector,
      });
    }
  }
  return {
    ids,
    classNames,
    testSelectors,
  };
}

function startAttributeObserver(observedType, emitter, node) {
  const attributeObserver = new window.MutationObserver(() =>
    emitter.emit(observedType.selector, node, node.isConnected)
  );
  attributeObserver.observe(node, {attributes: true, subtree: true});
  attributeObservers.set(observedType, attributeObserver);
}

function stopAttributeObserver(observedType) {
  const attributeObserver = attributeObservers.get(observedType);
  if (!attributeObserver) {
    return;
  }

  attributeObserver.disconnect();
  attributeObservers.delete(observedType);
}

function processObservedResults(emitter, node, results) {
  if (!results || results.length === 0) {
    return;
  }

  for (const observedType of results) {
    const {partialSelector, selector, options} = observedType;
    let foundNode = partialSelector.includes(' ') ? node.querySelector(selector) : node;
    if (!foundNode) {
      continue;
    }
    if (options && options.useParentNode) {
      foundNode = node;
    }
    const {isConnected} = foundNode;
    if (options && options.attributes) {
      if (isConnected) {
        startAttributeObserver(observedType, emitter, foundNode);
      } else {
        stopAttributeObserver(observedType);
      }
    }
    emitter.emit(selector, foundNode, isConnected);
  }
}

function processMutations(emitter, nodes) {
  if (!nodes || nodes.length === 0) {
    return;
  }

  for (const node of nodes) {
    let nodeId = node.id;
    if (typeof nodeId === 'string' && nodeId.length > 0) {
      nodeId = nodeId.trim();
      processObservedResults(emitter, node, observedIds[nodeId]);
    }

    let testSelector = node.getAttribute('data-test-selector');
    if (typeof testSelector === 'string' && testSelector.length > 0) {
      testSelector = testSelector.trim();
      processObservedResults(emitter, node, observedTestSelectors[testSelector]);
    }

    const nodeClassList = node.classList;
    if (nodeClassList && nodeClassList.length > 0) {
      for (let className of nodeClassList) {
        className = className.trim();
        processObservedResults(emitter, node, observedClassNames[className]);
      }
    }
  }
}

class DOMObserver extends SafeEventEmitter {
  constructor() {
    super();

    observer = new window.MutationObserver((mutations) => {
      const pendingNodes = [];
      for (const {addedNodes, removedNodes} of mutations) {
        if (!addedNodes || !removedNodes || (addedNodes.length === 0 && removedNodes.length === 0)) {
          continue;
        }

        for (let i = 0; i < 2; i++) {
          const nodes = i === 0 ? addedNodes : removedNodes;
          for (const node of nodes) {
            if (node.nodeType !== Node.ELEMENT_NODE || IGNORED_HTML_TAGS.has(node.nodeName)) {
              continue;
            }

            pendingNodes.push(node);
            if (node.childElementCount === 0) {
              continue;
            }

            for (const childNode of node.querySelectorAll('[id],[class]')) {
              pendingNodes.push(childNode);
            }
          }
        }
      }

      if (pendingNodes.length === 0) {
        return;
      }

      processMutations(this, pendingNodes);
    });
    observer.observe(document, {childList: true, subtree: true});
  }

  on(selector, callback, options) {
    const parsedSelector = parseSelector(selector);

    const initialNodes = [];
    for (const selectorType of Object.keys(parsedSelector)) {
      let observedSelectorType;
      switch (selectorType) {
        case 'ids':
          observedSelectorType = observedIds;
          break;
        case 'classNames':
          observedSelectorType = observedClassNames;
          break;
        case 'testSelectors':
          observedSelectorType = observedTestSelectors;
          break;
        default:
          break;
      }

      for (const {key, partialSelector} of parsedSelector[selectorType]) {
        const currentObservedTypeSelectors = observedSelectorType[key];
        const observedType = {partialSelector, selector, options};
        if (!currentObservedTypeSelectors) {
          observedSelectorType[key] = [observedType];
        } else {
          currentObservedTypeSelectors.push(observedType);
        }

        if (observedSelectorType === observedIds) {
          const initialNode = document.getElementById(key);
          if (initialNode) {
            initialNodes.push(initialNode);
          }
        } else if (observedSelectorType === observedClassNames) {
          initialNodes.push(...document.getElementsByClassName(key));
        }
      }
    }

    const result = super.on(selector, callback);

    // trigger dom mutations for existing elements for on page
    processMutations(this, initialNodes);

    return result;
  }

  // Note: you cannot call this directly as this is behind SafeEventEmitter
  //       use the closure returned from `on` to remove the event listener if needed
  off(selector, callback) {
    this.removeListener(selector, callback);

    if (this.listenerCount(selector) > 0) {
      return;
    }

    const parsedSelector = parseSelector(selector);

    for (const selectorType of Object.keys(parsedSelector)) {
      let observedSelectorType;
      switch (selectorType) {
        case 'ids':
          observedSelectorType = observedIds;
          break;
        case 'classNames':
          observedSelectorType = observedClassNames;
          break;
        case 'testSelectors':
          observedSelectorType = observedTestSelectors;
          break;
        default:
          break;
      }

      for (const {key} of parsedSelector[selectorType]) {
        const currentObservedTypeSelectors = observedSelectorType[key];
        if (!currentObservedTypeSelectors) {
          continue;
        }
        const observedTypeIndex = currentObservedTypeSelectors.findIndex(
          (observedType) => observedType.selector === selector
        );
        if (observedTypeIndex === -1) {
          continue;
        }
        const observedType = currentObservedTypeSelectors[observedTypeIndex];
        stopAttributeObserver(observedType);
        currentObservedTypeSelectors.splice(observedTypeIndex);
        if (currentObservedTypeSelectors.length === 0) {
          delete observedSelectorType[key];
        }
      }
    }
  }
}

export default new DOMObserver();
