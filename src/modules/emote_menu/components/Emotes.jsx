import React from 'react';
import {MultiGrid} from 'react-virtualized';
import emotes from '../grid.js';
import Emote from './Emote.jsx';

const COL_COUNT = 6;

function EmotesComponent({onChange, search, ...restProps}) {
  function cellRenderer({columnIndex, rowIndex, key, style}) {
    const [code, emote] = emotes.getEmoteAtIndex(columnIndex * COL_COUNT + rowIndex);
    return <Emote key={key} code={code} data={emote} style={style} />;
  }

  return (
    <div {...restProps}>
      <MultiGrid
        cellRenderer={cellRenderer}
        columnWidth={30}
        rowHeight={30}
        columnCount={COL_COUNT}
        rowCount={Math.floor(emotes.length / COL_COUNT)}
        fixedRowCount={1}
        height={308}
        width={272}
      />
    </div>
  );
}

export default React.memo(EmotesComponent);
