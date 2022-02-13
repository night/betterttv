import React, {useEffect, useState} from 'react';
import styles from './Preview.module.css';

function createPreviewImage(user) {
  const dateTime = new Date().toISOString(); // cache prevention
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user}-440x248.jpg?dateTime=${dateTime}`;
}

export default function StreamPreview({username: defaultUsername, usernameCallback: setUsernameCallback}) {
  const [username, setUsernameState] = useState(defaultUsername);
  useEffect(() => setUsernameCallback(setUsernameState), []);

  return (
    <div className={styles.previewContainer}>
      <img src={createPreviewImage(username)} alt={`${username}-preview`} />
    </div>
  );
}
