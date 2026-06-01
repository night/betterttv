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
      subtitleClassName={styles.subtitle}
    />
  );
}

export default React.memo(EmoteRow, (prev, next) => {
  return prev.item === next.item && prev.selected === next.selected && prev.active === next.active;
});
