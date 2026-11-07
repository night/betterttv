import {Button, Text} from '@mantine/core';
import {EqualNot} from 'lucide-react';
import React from 'react';
import {ProviderTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {getProvider} from '@/utils/window';
import styles from './AccountMismatch.module.css';
import {TwitchMark, YoutubeMark} from './BrandMarks';
import LogoIcon from './LogoIcon';

const MARK_SIZE = 32;

export function formatAccountMismatchMessage() {
  return formatMessage(
    {defaultMessage: "The BetterTTV account you signed in with doesn't match your {platform} account."},
    {platform: getProvider() === ProviderTypes.YOUTUBE ? 'YouTube' : 'Twitch'}
  );
}

function AccountMismatch({onCancel, onTryAgain}) {
  const isYoutube = getProvider() === ProviderTypes.YOUTUBE;

  return (
    <React.Fragment>
      <div className={styles.body}>
        <div className={styles.marks} aria-hidden="true">
          <span className={styles.tile}>
            {isYoutube ? (
              <YoutubeMark size={MARK_SIZE} className={styles.youtube} />
            ) : (
              <TwitchMark size={MARK_SIZE} className={styles.twitch} />
            )}
          </span>
          <EqualNot size={24} className={styles.notEqual} />
          <span className={styles.tile}>
            <LogoIcon width={MARK_SIZE} height={MARK_SIZE} />
          </span>
        </div>
        <Text size="lg">{formatAccountMismatchMessage()}</Text>
      </div>
      <div className={styles.footer}>
        <Button size="lg" variant="elevated" onClick={onCancel}>
          {formatMessage({defaultMessage: 'Cancel'})}
        </Button>
        <Button size="lg" variant="elevated" color="contrast" onClick={onTryAgain}>
          {formatMessage({defaultMessage: 'Try Again'})}
        </Button>
      </div>
    </React.Fragment>
  );
}

export default AccountMismatch;
