import React, {useMemo} from 'react';
import styles from './ItemsHeader.module.css';
import formatMessage from '../../../i18n/index.js';

function MatchesHeader(children) {
  return <span className={styles.matches}>{children}</span>;
}

export default function ItemsHeader({chatInputPartialEmote}) {
  const partialInput = useMemo(
    () => chatInputPartialEmote.slice(1, chatInputPartialEmote.length),
    [chatInputPartialEmote]
  );

  return (
    <div className={styles.header}>
      {formatMessage(
        {defaultMessage: '<matches>Matches for</matches> {partialInput}'},
        {matches: MatchesHeader, partialInput}
      )}
    </div>
  );
}
