import {faArrowUpRightFromSquare, faHeart} from '@fortawesome/free-solid-svg-icons';
import {Anchor, Button, Text} from '@mantine/core';
import React from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import {ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import CloudBackupShowcaseCard from '@/modules/settings/components/pro/CloudBackupShowcaseCard';
import ProBadgeShowcaseCard from '@/modules/settings/components/pro/ProBadgeShowcaseCard';
import ShowcaseImageCard from '@/modules/settings/components/pro/ShowcaseImageCard';
import UsernameEffectShowcaseCard from '@/modules/settings/components/pro/UsernameEffectShowcaseCard';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import styles from './ProHome.module.css';

// authenticate the socket before the tab opens so the purchase reflects here without a refresh
function handleUpgradeClick() {
  socketClient.ensureAuthentication();
}

function ProHome() {
  const user = useAuthStore(useShallow((state) => state.user));
  const isPro = isUserPro(user);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'BetterTTV Pro'})},
            {label: formatMessage({defaultMessage: 'Perks'})},
          ]}
        />
      }
      footer={
        <div className={styles.premiumActions}>
          <Text size="md" className={styles.premiumThanks}>
            <Icon icon={faHeart} size={16} className={styles.premiumThanksHeart} />
            {isPro
              ? formatMessage({defaultMessage: 'Thank you for supporting BetterTTV'})
              : formatMessage({defaultMessage: 'Pro directly supports BetterTTV development'})}
          </Text>
          <Button
            component={Anchor}
            href={ExternalLinks.PRO}
            target="_blank"
            rel="noopener noreferrer"
            underline="never"
            size="lg"
            radius="xl"
            variant="elevated"
            color="contrast"
            rightSection={<Icon icon={faArrowUpRightFromSquare} size={14} />}
            onClick={handleUpgradeClick}>
            {isPro
              ? formatMessage({defaultMessage: 'Manage Subscription'})
              : formatMessage({defaultMessage: 'Upgrade to Pro'})}
          </Button>
        </div>
      }>
      <div className={styles.featureGrid}>
        <UsernameEffectShowcaseCard />
        <ShowcaseImageCard
          image="emote_stickers"
          width={328}
          height={160}
          label={formatMessage({defaultMessage: 'Up to 500 Channel & 50 Personal Emotes'})}
        />
        <ProBadgeShowcaseCard />
        <ShowcaseImageCard
          image="approval_ticket"
          width={308}
          height={198}
          imageClassName={styles.ticketArt}
          label={formatMessage({defaultMessage: 'Your Emotes, Approved First'})}
        />
        <ShowcaseImageCard
          image="accent_fan"
          width={300}
          height={180}
          label={formatMessage({defaultMessage: 'Recolor Twitch & YouTube'})}
        />
        <ShowcaseImageCard
          image="self_bot"
          width={260}
          height={160}
          label={formatMessage({defaultMessage: 'Schedule & Auto-Reply to Messages'})}
        />
        <CloudBackupShowcaseCard />
        <ShowcaseImageCard
          image="autocomplete_panel"
          width={256}
          height={200}
          label={formatMessage({defaultMessage: 'Autocomplete Chat Bot Commands'})}
        />
      </div>
    </PageScrollBody>
  );
}

export default ProHome;
