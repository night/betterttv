import classNames from 'classnames';
import React, {useMemo} from 'react';
import effects from '@/common/styles/UsernameEffects.module.css';
import {CHAT_COLOR_USERNAME_EFFECTS} from '@/constants';
import twitch from '@/utils/twitch';

// Renders text styled like the user's chat username, including its hover animation.
export default function UsernameEffectText({effect, hoverEffect, className, children}) {
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);
  const effectClassName = effect != null ? effects[effect] : null;
  const style =
    effectClassName != null && CHAT_COLOR_USERNAME_EFFECTS.includes(effect) && chatColor != null
      ? {color: chatColor}
      : undefined;

  return (
    <span
      className={classNames(className, effectClassName, hoverEffect != null ? effects[hoverEffect] : null)}
      style={style}
      data-bttv-name={hoverEffect != null ? children : undefined}>
      {children}
    </span>
  );
}
