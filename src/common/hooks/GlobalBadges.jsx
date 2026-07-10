import {useEffect, useState} from 'react';
import twitch from '@/utils/twitch';

function useGlobalBadges(enabled = true) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let mounted = true;
    twitch.getGlobalBadges().then((globalBadges) => {
      if (!mounted) {
        return;
      }

      setBadges(globalBadges);
    });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return badges;
}

export default useGlobalBadges;
