import {faClose, faPaintBrush, faRobot} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Button, Image, Title} from '@mantine/core';
import classNames from 'classnames';
import {useInView} from 'framer-motion';
import React, {use, useEffect, useRef, useState} from 'react';
import AnimatedCanvas from '@/common/components/AnimatedCanvas';
import Icon from '@/common/components/Icon';
import NightbotLogoIcon from '@/common/components/NightbotLogoIcon';
import {SettingsPromotions} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import promotionStore from '@/modules/settings/stores/promotion-store';
import {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import cdn from '@/utils/cdn';
import Panel from './Panel';
import styles from './Promotion.module.css';

function BotProviderPromotionIcons() {
  return (
    <div className={styles.botProviderPromotionIcons}>
      <NightbotLogoIcon className={classNames(styles.logoImage, styles.nightbotLogo)} />
      <Image src={cdn.url('/assets/logos/moobot_logo.png')} className={styles.logoImage} />
      <Image src={cdn.url('/assets/logos/fossabot_logo.png')} className={styles.logoImage} />
      <Image src={cdn.url('/assets/logos/streamelements_logo.png')} className={styles.logoImage} />
    </div>
  );
}

function getPromotionToDisplay() {
  switch (promotionStore.getAvailablePromotionKey()) {
    case SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE:
      return {
        storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
        settingPanelId: SettingPanelIds.CHATBOTS,
        title: formatMessage({defaultMessage: 'Command Autocomplete'}),
        icon: <BotProviderPromotionIcons />,
      };
    case SettingsPromotions.SELF_BOT:
      return {
        storageKey: SettingsPromotions.SELF_BOT,
        settingPanelId: SettingPanelIds.SELF_BOT,
        title: formatMessage({defaultMessage: 'Auto-respond to your chat messages'}),
        icon: <Icon icon={faRobot} className={styles.logo} />,
      };
    case SettingsPromotions.THEME_CUSTOMIZE:
      return {
        storageKey: SettingsPromotions.THEME_CUSTOMIZE,
        settingPanelId: SettingPanelIds.THEME,
        title: formatMessage({defaultMessage: 'Customize your theme'}),
        icon: <Icon icon={faPaintBrush} className={styles.logo} />,
      };
    default:
      return null;
  }
}

function Promotion() {
  const {handleGotoSettingPanel} = use(PageContext);
  const [activePromotion, setActivePromotion] = useState(getPromotionToDisplay);
  const panelRef = useRef(null);
  const storageKey = activePromotion?.storageKey;
  const isInView = useInView(panelRef, {once: true, amount: 0.5});

  useEffect(() => {
    if (storageKey == null || !isInView) {
      return;
    }

    promotionStore.markPromotionSeen(storageKey);
  }, [isInView, storageKey]);

  if (activePromotion == null) {
    return null;
  }

  const {settingPanelId, icon, title} = activePromotion;

  const advance = () => {
    setActivePromotion(getPromotionToDisplay());
  };

  const handleDismiss = () => {
    promotionStore.markPromotionSeen(storageKey);
    advance();
  };

  const handleTakeMeThere = () => {
    promotionStore.markPromotionSeen(storageKey);
    handleGotoSettingPanel(settingPanelId);
    advance();
  };

  return (
    <Panel ref={panelRef} className={styles.promotion} containerClassName={styles.panelContainer}>
      <AnimatedCanvas className={styles.canvas} />
      <div className={styles.content}>
        {icon}
        <Title className={styles.title}>{title}</Title>
        <Button variant="elevated" color="light" size="lg" className={styles.button} onClick={handleTakeMeThere}>
          {formatMessage({defaultMessage: 'Take me there'})}
        </Button>
        <ActionIcon
          className={styles.closeButton}
          color="white"
          variant="transparent"
          size="lg"
          onClick={handleDismiss}
          aria-label="Close">
          <Icon icon={faClose} />
        </ActionIcon>
      </div>
    </Panel>
  );
}

export default Promotion;
