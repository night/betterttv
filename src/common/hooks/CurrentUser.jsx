import {useEffect, useState} from 'react';
import watcher from '@/watcher';
import {getCurrentUser} from '@/utils/user';

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
