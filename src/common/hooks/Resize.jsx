import {useEffect} from 'react';

export default function useResize(callback) {
  useEffect(() => {
    function handleResize() {
      callback();
      // Twitch animates chat moving on zoom changes
      setTimeout(callback, 500);
    }

    callback();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
}
