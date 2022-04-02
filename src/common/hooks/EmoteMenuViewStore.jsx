import {useEffect} from 'react';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

export default function useEmoteMenuViewStoreUpdated(shouldUpdate, handleUpdate) {
  useEffect(() => {
    function handleDirty() {
      if (!shouldUpdate) {
        return;
      }
      emoteMenuViewStore.updateEmotes();
    }

    handleDirty();

    const removeUpdatedListener = emoteMenuViewStore.on('updated', handleUpdate);
    const removeDirtyListener = emoteMenuViewStore.on('dirty', handleDirty);
    return () => {
      removeUpdatedListener();
      removeDirtyListener();
    };
  }, [shouldUpdate, handleUpdate]);
}
