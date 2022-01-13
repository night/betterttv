import React from 'react';
import {Whisper} from 'rsuite';
import AutocompletePopover from './AutocompletePopover.jsx';

export default function EmoteWhisper({boundingQuerySelector, chatInputElement}) {
  return (
    <Whisper
      open
      placement={null}
      speaker={
        <AutocompletePopover chatInputElement={chatInputElement} boundingQuerySelector={boundingQuerySelector} />
      }>
      <span />
    </Whisper>
  );
}
