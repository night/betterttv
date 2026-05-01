import React from 'react';
import AutocompleteRow from '../../../common/components/AutocompleteRow.jsx';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteRow.module.css';

function EmoteRow({item: emote, active, selected, onMouseOver, onClick}) {
  return (
    <AutocompleteRow
      leading={<Emote className={styles.emote} emote={emote} />}
      title={emote.code}
      subtitle={emote.category.displayName}
      active={active}
      selected={selected}
      onMouseOver={onMouseOver}
      onClick={onClick}
    />
  );
}

export default EmoteRow;
