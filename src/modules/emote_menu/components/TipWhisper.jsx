import React, {useEffect, useState} from 'react';
import Tooltip from 'rsuite/lib/Tooltip/index.js';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Icons from './Icons.jsx';
import tips from '../../../utils/tips.js';
import {tipIds} from '../../../constants.js';

const DELAY_SHOW_TOOLTIP = 10000;
const MIN_TIMES_SEE_TOOLTIP = 3; // if the user has seen tooltip 5 times, stop showing them it

function calcMostValuableTooltip(tooltips) {
  return tooltips
    .filter((tooltip) => !tooltip.learnt && tooltip.timesSeen < MIN_TIMES_SEE_TOOLTIP)
    .sort((a, b) => b.timesSeen - a.timesSeen)[0];
}

function getTooltipText(id) {
  switch (id) {
    case tipIds.EMOTE_MENU_ALT_FAVORITE_EMOTE:
      return 'Hold alt and click on an emote to favorite it.';
    case tipIds.EMOTE_MENU_SHIFT_MULTIPLE_EMOTES:
      return 'Hold shift to select multiple emotes.';
    default:
      return null;
  }
}

export default function TipWhisper({children}) {
  const triggerRef = React.useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const mostValuableTooltip = calcMostValuableTooltip([
      tips.getTip(tipIds.EMOTE_MENU_SHIFT_MULTIPLE_EMOTES),
      tips.getTip(tipIds.EMOTE_MENU_ALT_FAVORITE_EMOTE),
    ]);

    // we either don't show the tooltip cause there is none or randomly don't as to avoid being obnoxious
    if (mostValuableTooltip == null && Math.random() < 0.3) {
      return;
    }

    setTooltip(mostValuableTooltip);
    const timeout = setTimeout(() => triggerRef.current.open(), DELAY_SHOW_TOOLTIP);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Whisper
      triggerRef={triggerRef}
      trigger="hover"
      placement="topEnd"
      delayShow={6000}
      onOpen={() => tips.seenTip(tooltip?.id)}
      speaker={
        <Tooltip>
          {Icons.BULB}: {getTooltipText(tooltip?.id)}
        </Tooltip>
      }>
      {children}
    </Whisper>
  );
}
