import {useEffect} from 'react';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

let emoteMenuViewStoreCleanup;
export default function useEmoteMenuViewStore(callback) {
  useEffect(() => {
    function dirtyCallback() {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStoreCleanup = emoteMenuViewStore.once('updated', () => callback());
      }
    }

    callback();

    const cleanup = emoteMenuViewStore.on('dirty', dirtyCallback);

    return () => {
      cleanup();
      if (emoteMenuViewStoreCleanup != null) {
        emoteMenuViewStoreCleanup();
      }
    };
  }, [callback]);
}
