import React from 'react';
import {Whisper} from 'rsuite';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';
import AutocompletePopover from './AutocompletePopover.jsx';

export default function EmoteWhisper({boundingQuerySelector, chatInputElement, onComplete, getChatInputPartialEmote}) {
  return (
    <ThemeProvider>
      <Whisper
        open
        placement={null}
        speaker={
          <AutocompletePopover
            chatInputElement={chatInputElement}
            boundingQuerySelector={boundingQuerySelector}
            getChatInputPartialEmote={getChatInputPartialEmote}
            onComplete={onComplete}
          />
        }>
        <span />
      </Whisper>
    </ThemeProvider>
  );
}
