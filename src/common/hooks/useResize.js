import {useEffect} from 'react';

export default function useResize(reposition) {
  useEffect(() => {
    function handleResize() {
      reposition();
      // Twitch animates chat moving on zoom changes
      setTimeout(reposition, 500);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
}
