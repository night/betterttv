import React, {useCallback, useState} from 'react';
import {getAvatarColor} from '@/utils/avatar-color';
import {getInitial} from '@/utils/initial';
import styles from './UserAvatar.module.css';

// betterttv.com's avatar: the picture, or the name's initial on the user's colour if it's missing or fails
function UserAvatar({user, size}) {
  // the src that failed, so a new avatar gets its own try
  const [failedSrc, setFailedSrc] = useState(null);
  const {avatar} = user;
  const handleError = useCallback(() => setFailedSrc(avatar ?? null), [avatar]);
  const name = user.displayName ?? user.name;
  const showImage = avatar != null && avatar !== failedSrc;

  return (
    <span
      className={styles.avatar}
      style={{
        '--avatar-size': `${size}px`,
        '--avatar-color': showImage ? undefined : getAvatarColor(user.name),
      }}
      data-initial={showImage ? undefined : true}>
      {showImage ? (
        <img src={avatar} alt="" width={size} height={size} onError={handleError} />
      ) : (
        <span aria-hidden="true">{getInitial(name)}</span>
      )}
    </span>
  );
}

export default UserAvatar;
