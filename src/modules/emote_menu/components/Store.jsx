import {useEffect, useState} from 'react';
import watcher from '../../../watcher.js';
import emotes from '../../emotes/index.js';

/* eslint-disable-next-line import/prefer-default-export */
export function useEmotesState() {
  const [value, setValue] = useState(emotes.getCategorizedEmotes());

  useEffect(() => {
    function callback() {
      setValue(emotes.getCategorizedEmotes());
    }

    watcher.on('emotes.updated', callback);

    return () => {
      watcher.off('emotes.updated', callback);
    };
  }, []);

  return [value, setValue];
}
