import useCurrentChannel from './CurrentChannel';
import useCurrentUser from './CurrentUser';

function useIsOnOwnChannel() {
  const user = useCurrentUser();
  const channel = useCurrentChannel();
  return user != null && channel != null && user.id === channel.id;
}

export default useIsOnOwnChannel;
