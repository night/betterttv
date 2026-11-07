import classNames from 'classnames';
import React, {useMemo} from 'react';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import effects from '@/common/styles/UsernameEffects.module.css';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {useUsernameLook} from '@/stores/username-looks';
import twitch from '@/utils/twitch';
import {getPreviewDisplayName} from '@/utils/user';
import styles from './UsernameChatPreview.module.css';

// The account's line in chat with its picks on, as the website shows it; hovering the line plays the hover effect.
export default function UsernameChatPreview() {
  const currentUser = useCurrentUser();
  const authUser = useAuthStore((state) => state.user);
  const effect = useUsernameLook('usernameEffect');
  const hoverEffect = useUsernameLook('usernameHoverEffect');
  const font = useUsernameLook('usernameFont');
  const chatColorStyle = useMemo(() => {
    const chatColor = twitch.getCurrentUserChatColor();
    return chatColor != null ? {'--chat-color': chatColor} : undefined;
  }, []);

  const badgeUrl = authUser?.subscriptionBadge === true ? authUser.subscriptionBadgeUrl : null;

  return (
    <div className={styles.box} style={chatColorStyle}>
      <div className={classNames(styles.line, effects.hoverTrigger)}>
        {badgeUrl != null ? (
          <img src={badgeUrl} alt="" className={styles.badge} />
        ) : (
          <span className={classNames(styles.badge, styles.missingBadge)} />
        )}
        <UsernameEffectText effect={effect} hoverEffect={hoverEffect} font={font} className={styles.name}>
          {getPreviewDisplayName(currentUser, authUser)}
        </UsernameEffectText>
        <span className={styles.text}>: {formatMessage({defaultMessage: 'third-party thing!'})}</span>
      </div>
    </div>
  );
}
