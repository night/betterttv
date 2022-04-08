import React, {useEffect, useMemo, useState} from 'react';
import styles from './Preview.module.css';

function createPreviewImageURL(user) {
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user}-220x124.jpg`;
}

export default function StreamPreview({username: defaultUsername, usernameCallback: setUsernameCallback}) {
  const [username, setUsernameState] = useState(defaultUsername);

  useEffect(() => {
    setUsernameCallback(setUsernameState);

    return () => {
      setUsernameCallback(null);
    };
  }, [setUsernameCallback]);

  const url = useMemo(() => createPreviewImageURL(username), [username]);

  return (
    <div className={styles.previewContainer}>
      <img src={url} alt={`${username}-preview`} />
    </div>
  );
}
