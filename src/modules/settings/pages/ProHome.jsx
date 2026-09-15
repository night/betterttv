import {faArrowUpRightFromSquare, faHeart} from '@fortawesome/free-solid-svg-icons';
import {Anchor, Button, Text} from '@mantine/core';
import React from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import {ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import AccentThemeShowcaseCard from '@/modules/settings/components/pro/AccentThemeShowcaseCard';
import CloudBackupShowcaseCard from '@/modules/settings/components/pro/CloudBackupShowcaseCard';
import CommandAutocompleteShowcaseCard from '@/modules/settings/components/pro/CommandAutocompleteShowcaseCard';
import EmoteStickersShowcaseCard from '@/modules/settings/components/pro/EmoteStickersShowcaseCard';
import PriorityApprovalShowcaseCard from '@/modules/settings/components/pro/PriorityApprovalShowcaseCard';
import ProBadgeShowcaseCard from '@/modules/settings/components/pro/ProBadgeShowcaseCard';
import SelfBotShowcaseCard from '@/modules/settings/components/pro/SelfBotShowcaseCard';
import UsernameEffectShowcaseCard from '@/modules/settings/components/pro/UsernameEffectShowcaseCard';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import styles from './ProHome.module.css';

// the upgrade flow opens in a new tab; authenticating the socket session up front lets the
// purchase reflect in this client without a refresh once it completes
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
            {formatMessage({defaultMessage: 'Thank you for supporting BetterTTV'})}
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
      <div className={styles.featureColumns}>
        <UsernameEffectShowcaseCard />
        <AccentThemeShowcaseCard />
        <CommandAutocompleteShowcaseCard />
        <EmoteStickersShowcaseCard />
        <CloudBackupShowcaseCard />
        <SelfBotShowcaseCard />
        <ProBadgeShowcaseCard />
        <PriorityApprovalShowcaseCard />
      </div>
    </PageScrollBody>
  );
}

export default ProHome;
