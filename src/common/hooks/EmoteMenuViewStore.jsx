import {useEffect} from 'react';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

export default function useEmoteMenuViewStore(callback) {
  useEffect(() => {
    function dirtyCallback() {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStore.once('updated', () => callback());
      }
    }

    const cleanup = emoteMenuViewStore.on('dirty', dirtyCallback);
    return () => cleanup();
  }, [callback]);
}
