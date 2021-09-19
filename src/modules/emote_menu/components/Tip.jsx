import React, {useEffect, useState} from 'react';
import {tipIds} from '../../../constants.js';
import storage from '../../../storage.js';
import Icons from './Icons.jsx';

function calcMostValuableTooltip(tooltips) {
  return tooltips.filter((tooltip) => !tooltip.learnt).sort((a, b) => a.timesSeen - b.timesSeen)[0];
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

export default function Tip({classname}) {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let shiftMultipleEmotes = storage.get(tipIds.EMOTE_MENU_SHIFT_MULTIPLE_EMOTES);
    let altFavoriteEmote = storage.get(tipIds.EMOTE_MENU_ALT_FAVORITE_EMOTE);

    if (shiftMultipleEmotes == null) {
      shiftMultipleEmotes = {
        id: tipIds.EMOTE_MENU_SHIFT_MULTIPLE_EMOTES,
        timesSeen: 0,
        learnt: false,
      };
    }

    if (altFavoriteEmote == null) {
      altFavoriteEmote = {
        id: tipIds.EMOTE_MENU_ALT_FAVORITE_EMOTE,
        timesSeen: 0,
        learnt: false,
      };
    }

    const mostValuableTip = calcMostValuableTooltip([shiftMultipleEmotes, altFavoriteEmote]);
    setTip(mostValuableTip);

    storage.set(mostValuableTip.id, {
      ...mostValuableTip,
      timesSeen: (mostValuableTip.timesSeen += 1),
    });
  }, []);

  return (
    <div className={classname}>
      <span>{Icons.BULB}</span>
      <div>{getTooltipText(tip.id)}</div>
    </div>
  );
}
