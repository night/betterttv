import classNames from 'classnames';
import React, {useMemo} from 'react';
import effects from '@/common/styles/UsernameEffects.module.css';
import {UsernameEffects} from '@/constants';
import twitch from '@/utils/twitch';

// Glow and flare paint over the current text color, so they take the user's chat color; the rest
// paint the text themselves (gradient/image) and ignore it.
const CHAT_COLOR_EFFECTS = [UsernameEffects.GLOW, UsernameEffects.FLARE];

// Renders text with the current user's username effect applied, the same way it appears in chat.
export default function UsernameEffectText({effect, className, children}) {
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);
  const effectClassName = effect != null ? effects[effect] : null;
  const style = effectClassName != null && CHAT_COLOR_EFFECTS.includes(effect) ? {color: chatColor} : undefined;

  return (
    <span className={classNames(className, effectClassName)} style={style}>
      {children}
    </span>
  );
}
