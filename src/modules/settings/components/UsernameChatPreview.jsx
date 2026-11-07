import {ActionIcon, Title, useComputedColorScheme} from '@mantine/core';
import classNames from 'classnames';
import {Moon, Sun} from 'lucide-react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import effects from '@/common/styles/UsernameEffects.module.css';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {clearTriedLooks, usePreviewLook, useTriedLook} from '@/stores/username-looks';
import twitch from '@/utils/twitch';
import {getPreviewDisplayName} from '@/utils/user';
import groupStyles from './SettingGroup.module.css';
import styles from './UsernameChatPreview.module.css';

const MESSAGES = [
  formatMessage({defaultMessage: 'third-party thing!'}),
  formatMessage({defaultMessage: 'is this thing on?'}),
  formatMessage({defaultMessage: 'hello world!'}),
];

function pickMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

// the box's own text colours, so the toggle reads on either scheme; px, since rem sizes shrink on
// Twitch's 10px root
const schemeToggleVars = () => ({
  root: {
    '--ai-size': '32px',
    '--ai-color': 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))',
    '--ai-hover': 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
  },
});

// The account's line in chat with its picks on, as the website shows it; hovering the line plays the hover effect.
export default function UsernameChatPreview() {
  const currentUser = useCurrentUser();
  const authUser = useAuthStore((state) => state.user);
  const effect = usePreviewLook('usernameEffect');
  const hoverEffect = usePreviewLook('usernameHoverEffect');
  const font = usePreviewLook('usernameFont');
  const triedBadgeUrl = useTriedLook('subscriptionBadgeUrl');
  const chatColorStyle = useMemo(() => {
    const chatColor = twitch.getCurrentUserChatColor();
    return chatColor != null ? {'--chat-color': chatColor} : undefined;
  }, []);
  // the settings' scheme until one is picked
  const settingsScheme = useComputedColorScheme('dark');
  const [pickedScheme, setPickedScheme] = useState(null);
  // a different line each time the page opens
  const [message] = useState(pickMessage);

  // a try still showing when the page closes would show again on the next open
  useEffect(() => clearTriedLooks, []);

  const savedBadgeUrl = authUser?.subscriptionBadge === true ? authUser.subscriptionBadgeUrl : null;
  const badgeUrl = triedBadgeUrl !== undefined ? triedBadgeUrl : savedBadgeUrl;
  const scheme = pickedScheme ?? settingsScheme;
  const handleSchemeToggle = useCallback(() => setPickedScheme(scheme === 'dark' ? 'light' : 'dark'), [scheme]);

  return (
    <section className={groupStyles.section}>
      <Title order={2} className={groupStyles.name}>
        {formatMessage({defaultMessage: 'Preview'})}
      </Title>
      <div className={styles.box} data-scheme={scheme} style={chatColorStyle}>
        <ActionIcon
          variant="subtle"
          size="md"
          radius="md"
          vars={schemeToggleVars}
          className={styles.schemeToggle}
          onClick={handleSchemeToggle}
          aria-label={
            scheme === 'dark'
              ? formatMessage({defaultMessage: 'Show light chat'})
              : formatMessage({defaultMessage: 'Show dark chat'})
          }>
          {scheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </ActionIcon>
        <div className={classNames(styles.line, effects.hoverTrigger)}>
          {badgeUrl != null ? <img src={badgeUrl} alt="" className={styles.badge} /> : null}
          <UsernameEffectText effect={effect} hoverEffect={hoverEffect} font={font} className={styles.name}>
            {getPreviewDisplayName(currentUser, authUser)}
          </UsernameEffectText>
          <span className={styles.text}>: {message}</span>
        </div>
      </div>
    </section>
  );
}
