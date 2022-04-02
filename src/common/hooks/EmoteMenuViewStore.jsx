import {useEffect} from 'react';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

export default function useEmoteMenuViewStore(callback) {
  let emoteMenuViewStoreCleanup;

  useEffect(() => {
    function dirtyCallback() {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStoreCleanup = emoteMenuViewStore.once('updated', () => callback());
      }
    }

    dirtyCallback();

    const cleanup = emoteMenuViewStore.on('dirty', dirtyCallback);

    return () => {
      cleanup();
      if (emoteMenuViewStoreCleanup != null) {
        emoteMenuViewStoreCleanup();
      }
    };
  }, [callback]);
}
