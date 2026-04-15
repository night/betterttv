import {useEffect, useRef} from 'react';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

export default function useEmoteMenuViewStoreUpdated(shouldUpdate, handleUpdate) {
  const handleUpdateRef = useRef(handleUpdate);

  useEffect(() => {
    handleUpdateRef.current = handleUpdate;
  }, [handleUpdate]);

  useEffect(() => {
    function handleDirty() {
      if (!shouldUpdate) {
        return;
      }
      emoteMenuViewStore.updateEmotes();
    }

    const removeUpdatedListener = emoteMenuViewStore.on('updated', () => handleUpdateRef.current());
    const removeDirtyListener = emoteMenuViewStore.on('dirty', handleDirty);

    handleUpdateRef.current();
    handleDirty();

    return () => {
      removeUpdatedListener();
      removeDirtyListener();
    };
  }, [shouldUpdate]);
}
