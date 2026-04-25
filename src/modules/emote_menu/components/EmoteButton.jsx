import classNames from 'classnames';
import React, {useCallback} from 'react';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteButton.module.css';

function EmoteButton({emote, onClick, onMouseOver, active}) {
  const locked = emote.metadata?.isLocked?.() ?? false;
  const handleMouseOver = useCallback(() => onMouseOver(emote), [onMouseOver, emote]);
  const handleFocus = useCallback(() => onMouseOver(emote), [onMouseOver, emote]);
  const handleClick = useCallback(() => onClick(emote), [onClick, emote]);

  return (
    <button
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onFocus={handleFocus}
      type="button"
      disabled={locked}
      className={classNames(styles.emote, active ? styles.active : null)}>
      <Emote emote={emote} locked={locked} />
    </button>
  );
}

export default EmoteButton;
