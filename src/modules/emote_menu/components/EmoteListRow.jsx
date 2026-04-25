import classNames from 'classnames';
import React, {useCallback} from 'react';
import {Text} from '@mantine/core';
import EmoteButton from './EmoteButton.jsx';
import {getEmoteKey} from '../utils/emote-list-grid.js';
import styles from './EmoteListRow.module.css';

export function HeaderRow({style, className, row}) {
  return (
    <div style={style} className={classNames(className, styles.header)}>
      <span className={styles.headerIcon}>{row.icon}</span>
      <Text c="dimmed" size="sm" className={styles.headerText}>
        {row.displayName}
      </Text>
    </div>
  );
}

function EmoteRowComponent({style, className, row, rowIndex: y, coords, onClick, onMouseOver}) {
  const handleMouseOver = useCallback((x) => onMouseOver({x, y}), [onMouseOver, y]);

  return (
    <div key={y} style={style} className={classNames(className, styles.row)}>
      {row.map((emote, x) => (
        <EmoteButton
          key={getEmoteKey(emote)}
          emote={emote}
          onClick={onClick}
          onMouseOver={() => handleMouseOver(x)}
          active={x === coords.x && y === coords.y}
        />
      ))}
    </div>
  );
}

export const EmoteRow = React.memo(EmoteRowComponent, (prevProps, nextProps) => {
  const rowIndex = nextProps.rowIndex;

  const wasActive = prevProps.coords.y === rowIndex;
  const isActive = nextProps.coords.y === rowIndex;
  const activeChanged = wasActive !== isActive;

  const xChanged = prevProps.coords.x !== nextProps.coords.x && isActive;
  const rowChanged = prevProps.row !== nextProps.row;

  const onClickChanged = prevProps.onClick !== nextProps.onClick;
  const onMouseOverChanged = prevProps.onMouseOver !== nextProps.onMouseOver;

  const shouldRerender = activeChanged || xChanged || rowChanged || onClickChanged || onMouseOverChanged;

  return !shouldRerender;
});
