import React, {useContext, useState} from 'react';
import Panel from './Panel.jsx';
import AnimatedCanvas from '../../../common/components/AnimatedCanvas.jsx';
import styles from './Promotion.module.css';
import {ActionIcon, Button, Image, Title} from '@mantine/core';
import {PageContext} from '../contexts/PageContext.jsx';
import {SettingPanelIds} from '../stores/SettingStore.jsx';
import Icon from '../../../common/components/Icon.jsx';
import {faClose, faPaintBrush} from '@fortawesome/free-solid-svg-icons';
import formatMessage from '../../../i18n/index.js';
import storage from '../../../storage.js';
import NightbotLogoIcon from '../../../common/components/NightbotLogoIcon.jsx';
import {SettingIds, SettingsPromotions} from '../../../constants.js';
import cdn from '../../../utils/cdn.js';
import classNames from 'classnames';
import {getProSettingValue} from '../../../utils/pro.js';

const PROMOTION_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const LAST_DISMISSED_ANY_AT_KEY = 'settingsPromotionLastDismissedAnyAt';

function isGlobalPromotionCooldown() {
  const lastDismissedAnyAt = storage.get(LAST_DISMISSED_ANY_AT_KEY);

  if (lastDismissedAnyAt == null || typeof lastDismissedAnyAt !== 'number') {
    return false;
  }

  return Date.now() - lastDismissedAnyAt < PROMOTION_COOLDOWN_MS;
}

function isPromotionSlotDismissed(storageKey) {
  return storage.get(storageKey) === true;
}

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
  if (isGlobalPromotionCooldown()) {
    return null;
  }

  if (
    !isPromotionSlotDismissed(SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE) &&
    !getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false)
  ) {
    return {
      storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
      settingPanelId: SettingPanelIds.CHATBOTS,
      title: formatMessage({defaultMessage: 'Command Autocomplete'}),
      icon: <BotProviderPromotionIcons />,
    };
  }

  if (
    !isPromotionSlotDismissed(SettingsPromotions.THEME_CUSTOMIZE) &&
    getProSettingValue(SettingIds.PRIMARY_COLOR, null) == null
  ) {
    return {
      storageKey: SettingsPromotions.THEME_CUSTOMIZE,
      settingPanelId: SettingPanelIds.THEME,
      title: formatMessage({defaultMessage: 'Customize your theme'}),
      icon: <Icon icon={faPaintBrush} className={styles.logo} />,
    };
  }

  return null;
}

function markPromotionSeen(storageKey) {
  storage.set(storageKey, true);
  storage.set(LAST_DISMISSED_ANY_AT_KEY, Date.now());
}

function Promotion() {
  const {handleGotoSettingPanel} = useContext(PageContext);
  const [activePromotion, setActivePromotion] = useState(getPromotionToDisplay);

  if (activePromotion == null) {
    return null;
  }

  const {storageKey, settingPanelId, icon, title} = activePromotion;

  const advance = () => {
    setActivePromotion(getPromotionToDisplay());
  };

  const handleDismiss = () => {
    markPromotionSeen(storageKey);
    advance();
  };

  const handleTakeMeThere = () => {
    markPromotionSeen(storageKey);
    handleGotoSettingPanel(settingPanelId);
    advance();
  };

  return (
    <Panel className={styles.promotion} containerClassName={styles.panelContainer}>
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
