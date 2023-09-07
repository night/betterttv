import debounce from 'lodash.debounce';
import {useEffect} from 'react';

export default function useResize(callback) {
  useEffect(() => {
    function handleResize() {
      requestAnimationFrame(callback);
      // Twitch animates chat moving on zoom changes
      setTimeout(() => requestAnimationFrame(callback), 500);
    }

    const requestResize = debounce(handleResize, 250);

    window.addEventListener('resize', requestResize);
    return () => window.removeEventListener('resize', requestResize);
  }, []);
}
