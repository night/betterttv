import React from 'react';
import {Whisper} from 'rsuite';
import ThemeProvider from '../ThemeProvider.jsx';
import AutocompletePopover from './AutocompletePopover.jsx';

export default function AutocompleteWhisper({
  boundingQuerySelector,
  chatInputElement,
  onComplete,
  getChatInputPartialInput,
  renderRow,
  computeMatches,
}) {
  return (
    <ThemeProvider>
      <Whisper
        open
        placement={null}
        speaker={
          <AutocompletePopover
            chatInputElement={chatInputElement}
            boundingQuerySelector={boundingQuerySelector}
            getChatInputPartialInput={getChatInputPartialInput}
            onComplete={onComplete}
            renderRow={renderRow}
            computeMatches={computeMatches}
          />
        }>
        <span />
      </Whisper>
    </ThemeProvider>
  );
}
