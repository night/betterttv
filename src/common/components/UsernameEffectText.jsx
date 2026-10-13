import classNames from 'classnames';
import React, {useMemo} from 'react';
import effects from '@/common/styles/UsernameEffects.module.css';
import {shouldReduceMotion} from '@/common/utils/reduced-motion';
import {CHAT_COLOR_USERNAME_EFFECTS, UsernameHoverEffects} from '@/constants';
import twitch from '@/utils/twitch';

export default function UsernameEffectText({effect, hoverEffect, font, className, children}) {
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);
  const effectClassName = effect != null ? effects[effect] : null;
  const hoverEffectClassName = hoverEffect != null && !shouldReduceMotion() ? effects[hoverEffect] : null;
  const fontClassName = font != null ? effects[font] : null;
  const style =
    effectClassName != null && CHAT_COLOR_USERNAME_EFFECTS.includes(effect) && chatColor != null
      ? {color: chatColor}
      : undefined;

  return (
    <span
      className={classNames(className, effectClassName, hoverEffectClassName, fontClassName)}
      style={style}
      data-bttv-name={
        hoverEffectClassName != null && hoverEffect === UsernameHoverEffects.FLIP && typeof children === 'string'
          ? children
          : undefined
      }>
      {children}
    </span>
  );
}
