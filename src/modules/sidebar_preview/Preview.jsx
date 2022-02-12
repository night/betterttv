import classNames from 'classnames';
import React, {useState, useEffect} from 'react';
import styles from './Preview.module.css';

function createPreviewImage(user) {
  // prevent cache
  const dateTime = new Date().toISOString();
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user}-440x248.jpg?dateTime=${dateTime}`;
}

export default function StreamPreview({username: defaultUsername, usernameCallback}) {
  const [username, setUsername] = useState(defaultUsername);
  const imageRef = React.useRef(null);
  const loadingRef = React.useRef(true);

  function handleLoad() {
    window.requestAnimationFrame(() => {
      const currentImageRef = imageRef.current;
      if (currentImageRef == null) {
        return;
      }

      loadingRef.current = false;
      currentImageRef.classList.remove(styles.placeholder);
    });
  }

  useEffect(() => usernameCallback(setUsername), []);

  return (
    <div className={styles.previewContainer}>
      <img
        ref={imageRef}
        className={classNames({[styles.placeholder]: loadingRef.current})}
        src={createPreviewImage(username)}
        alt={`${username}-preview`}
        onLoad={loadingRef.current ? handleLoad : undefined}
      />
    </div>
  );
}
