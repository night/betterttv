import React, {useState, useEffect} from 'react';
import styles from './Preview.module.css';

function createPreviewImage(user) {
  // prevent cache
  const dateTime = new Date().toISOString();
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user}-440x248.jpg?dateTime=${dateTime}`;
}

export default function StreamPreview({username: defaultUsername, usernameCallback}) {
  const [username, setUsername] = useState(defaultUsername);
  useEffect(() => usernameCallback(setUsername), []);

  return (
    <div className={styles.previewContainer}>
      <img src={createPreviewImage(username)} alt={`${username}-preview`} />
    </div>
  );
}
