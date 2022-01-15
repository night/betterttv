import React from 'react';
import {CustomProvider, Whisper} from 'rsuite';
import AutocompletePopover from './AutocompletePopover.jsx';

export default function EmoteWhisper({boundingQuerySelector, chatInputElement, autocomplete}) {
  return (
    <CustomProvider theme="dark">
      <Whisper
        open
        placement={null}
        speaker={
          <AutocompletePopover
            chatInputElement={chatInputElement}
            boundingQuerySelector={boundingQuerySelector}
            autocomplete={autocomplete}
          />
        }>
        <span />
      </Whisper>
    </CustomProvider>
  );
}
