import classNames from 'classnames';
import React, {useMemo} from 'react';
import effects from '@/common/styles/UsernameEffects.module.css';
import {CHAT_COLOR_USERNAME_EFFECTS} from '@/constants';
import twitch from '@/utils/twitch';

// Renders text styled like the user's chat username. The ref lets a container animate it on hover.
export default function UsernameEffectText({ref, effect, className, children}) {
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);
  const effectClassName = effect != null ? effects[effect] : null;
  const style =
    effectClassName != null && CHAT_COLOR_USERNAME_EFFECTS.includes(effect) && chatColor != null
      ? {color: chatColor}
      : undefined;

  return (
    <span ref={ref} className={classNames(className, effectClassName)} style={style}>
      {children}
    </span>
  );
}
