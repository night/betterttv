import {faDiscord} from '@fortawesome/free-brands-svg-icons';
import {faDroplet, faShirt} from '@fortawesome/free-solid-svg-icons';
import {Avatar, Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {getCurrentUserProfilePicture} from '@/utils/user';
import styles from './SelfBotShowcaseCard.module.css';
import cardStyles from './ShowcaseCard.module.css';

function SelfBotShowcaseCard() {
  const bttvUser = useAuthStore(useShallow((state) => state.user));
  const avatarSrc = bttvUser?.avatar ?? getCurrentUserProfilePicture();

  const messages = [
    {text: formatMessage({defaultMessage: 'Join my Discord!'}), icon: faDiscord, color: 'indigo'},
    {text: formatMessage({defaultMessage: 'Remind me to hydrate!'}), icon: faDroplet, color: 'green'},
    {text: formatMessage({defaultMessage: 'Check out my merch!'}), icon: faShirt, color: 'red'},
  ];

  return (
    <div className={classNames(cardStyles.showcaseCard, cardStyles.showcasePreview)}>
      <div className={styles.bubbleStack} aria-hidden="true">
        {messages.map((message) => (
          <div key={message.text} className={styles.bubbleRow}>
            <span className={classNames(styles.bubble, {[styles.bubbleNoAvatar]: avatarSrc == null})}>
              {avatarSrc != null ? <Avatar src={avatarSrc} size={32} radius="xl" /> : null}
              {message.text}
              <span className={styles.bubbleIcon} data-color={message.color}>
                <Icon icon={message.icon} size={12} />
              </span>
            </span>
          </div>
        ))}
      </div>
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Schedule & Auto-Reply to Messages'})}
      </Title>
    </div>
  );
}

export default SelfBotShowcaseCard;
