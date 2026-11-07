import {Anchor, Button, Text} from '@mantine/core';
import classNames from 'classnames';
import {ChevronRight, CreditCard, Flame, Gift, Heart, SquareArrowOutUpRight} from 'lucide-react';
import React from 'react';
import {useShallow} from 'zustand/react/shallow';
import {ExternalLinks, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import CloudBackupShowcaseCard from '@/modules/settings/components/pro/CloudBackupShowcaseCard';
import openGiftProModal from '@/modules/settings/components/pro/GiftProModal';
import ProBadgeShowcaseCard from '@/modules/settings/components/pro/ProBadgeShowcaseCard';
import ShowcaseImageCard from '@/modules/settings/components/pro/ShowcaseImageCard';
import UsernameEffectShowcaseCard from '@/modules/settings/components/pro/UsernameEffectShowcaseCard';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import {flatButtonVars} from '@/modules/shadow_dom/vars';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import styles from './ProHome.module.css';

const BETTERTTV_PRO_NAME = formatMessage({defaultMessage: 'BetterTTV Pro'});
const SUBSCRIBE_NAME = formatMessage({defaultMessage: 'Subscribe'});
const GIFT_PRO_NAME = formatMessage({defaultMessage: 'Gift Pro'});

// authenticate the socket before the tab opens so the purchase reflects here without a refresh
function handleUpgradeClick() {
  socketClient.ensureAuthentication();
}

registerSearchEntry({
  query: BETTERTTV_PRO_NAME,
  description: formatMessage({defaultMessage: 'Perks for subscribers.'}),
  keywords: ['bttv'],
  icon: Flame,
  onAccept: ({setPage}) => setPage(PageTypes.PRO_HOME),
});

registerSearchEntry({
  query: SUBSCRIBE_NAME,
  description: formatMessage({defaultMessage: 'Get BetterTTV Pro, or manage your subscription.'}),
  keywords: ['upgrade', 'plan', 'billing', 'payment', 'cancel'],
  icon: CreditCard,
  href: ExternalLinks.PRO,
  onAccept: handleUpgradeClick,
});

registerSearchEntry({
  query: GIFT_PRO_NAME,
  description: formatMessage({defaultMessage: 'Give BetterTTV Pro to someone else.'}),
  keywords: ['gift', 'present', 'give'],
  icon: Gift,
  onAccept: openGiftProModal,
});

// the page's main action for a subscriber; beside Subscribe it steps back to the flat style
function GiftProButton({primary = false}) {
  return (
    <Button
      size="lg"
      radius="lg"
      variant={primary ? 'elevated' : 'filled'}
      color={primary ? 'contrast' : 'dark.8'}
      vars={primary ? undefined : flatButtonVars}
      leftSection={<Gift size={16} />}
      onClick={openGiftProModal}>
      {GIFT_PRO_NAME}
    </Button>
  );
}

function ProHome() {
  const user = useAuthStore(useShallow((state) => state.user));
  const isPro = isUserPro(user);

  return (
    <PageScrollBody
      header={
        <PageHeader breadcrumbs={[{label: BETTERTTV_PRO_NAME}, {label: formatMessage({defaultMessage: 'Perks'})}]} />
      }
      footer={
        <div className={styles.premiumActions}>
          <Text size="md" className={styles.premiumThanks}>
            <Heart size={16} className={styles.premiumThanksHeart} />
            {isPro
              ? formatMessage({defaultMessage: 'Thank you for supporting BetterTTV'})
              : formatMessage({defaultMessage: 'Pro directly supports BetterTTV development'})}
          </Text>
          <div className={classNames(styles.premiumButtons, {[styles.premiumButtonsReversed]: isPro})}>
            <GiftProButton primary={isPro} />
            <Button
              component={Anchor}
              href={ExternalLinks.PRO}
              target="_blank"
              rel="noopener noreferrer"
              underline="never"
              size="lg"
              radius="lg"
              variant={isPro ? 'filled' : 'elevated'}
              color={isPro ? 'dark.8' : 'contrast'}
              vars={isPro ? flatButtonVars : undefined}
              rightSection={isPro ? <SquareArrowOutUpRight size={16} /> : <ChevronRight size={16} />}
              onClick={handleUpgradeClick}>
              {isPro ? formatMessage({defaultMessage: 'Manage Subscription'}) : SUBSCRIBE_NAME}
            </Button>
          </div>
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
