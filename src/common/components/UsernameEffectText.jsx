import classNames from 'classnames';
import React, {useMemo} from 'react';
import effects from '@/common/styles/UsernameEffects.module.css';
import {shouldReduceMotion} from '@/common/utils/reduced-motion';
import {CHAT_COLOR_USERNAME_EFFECTS} from '@/constants';
import twitch from '@/utils/twitch';

export default function UsernameEffectText({effect, hoverEffect, className, children}) {
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);
  const effectClassName = effect != null ? effects[effect] : null;
  const hoverEffectClassName = hoverEffect != null && !shouldReduceMotion() ? effects[hoverEffect] : null;
  const style =
    effectClassName != null && CHAT_COLOR_USERNAME_EFFECTS.includes(effect) && chatColor != null
      ? {color: chatColor}
      : undefined;

  return (
    <span
      className={classNames(className, effectClassName, hoverEffectClassName)}
      style={style}
      data-bttv-name={hoverEffectClassName != null ? children : undefined}>
      {children}
    </span>
  );
}
