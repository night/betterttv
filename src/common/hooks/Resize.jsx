import debounce from 'lodash.debounce';
import {useEffect} from 'react';

export default function useResize(callback) {
  useEffect(() => {
    function handleResize() {
      requestAnimationFrame(callback);
      // Twitch animates chat moving on zoom changes
      // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- fire-and-forget reflow nudge; listener removed on unmount
      setTimeout(() => requestAnimationFrame(callback), 500);
    }

    const requestResize = debounce(handleResize, 250);

    window.addEventListener('resize', requestResize);
    return () => window.removeEventListener('resize', requestResize);
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- resize listener is intentionally bound once on mount
  }, []);
}
