import {useEffect, useState} from 'react';
import watcher from '../../watcher.js';
import {getCurrentChannel} from '../../utils/channel.js';

function useCurrentChannel() {
  const [channel, setChannel] = useState(() => getCurrentChannel());

  useEffect(() => {
    function updateChannel() {
      setChannel(getCurrentChannel());
    }

    const cleanup = watcher.on('channel.updated', updateChannel);
    return () => cleanup();
  }, [setChannel]);

  return channel;
}

export default useCurrentChannel;
