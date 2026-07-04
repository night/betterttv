import {useEffect, useState} from 'react';
import {getCurrentUser} from '@/utils/user';
import watcher from '@/watcher';

function useCurrentUser() {
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    function updateUser() {
      setUser(getCurrentUser());
    }

    const cleanups = [watcher.on('channel.updated', updateUser), watcher.on('user.updated', updateUser)];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return user;
}

export default useCurrentUser;
