import React, {useContext, useState} from 'react';
import Panel from './Panel.jsx';
import AnimatedCanvas from '../../../common/components/AnimatedCanvas.jsx';
import styles from './Promotion.module.css';
import {ActionIcon, Button, Title} from '@mantine/core';
import {PageContext} from '../contexts/PageContext.jsx';
import {SettingPanelIds} from '../stores/SettingStore.jsx';
import Icon from '../../../common/components/Icon.jsx';
import {faClose, faPaintBrush} from '@fortawesome/free-solid-svg-icons';
import formatMessage from '../../../i18n/index.js';
import {SettingsPromotions} from '../../../constants.js';
import storage from '../../../storage.js';

function Promotion() {
  const {handleGotoSettingPanel} = useContext(PageContext);
  const [dismissed, setDismissed] = useState(() => storage.get(SettingsPromotions.THEME_CUSTOMIZE) === true);

  const markPromotionSeen = () => {
    storage.set(SettingsPromotions.THEME_CUSTOMIZE, true);
    setDismissed(true);
  };

  const handleTakeMeThere = () => {
    markPromotionSeen();
    handleGotoSettingPanel(SettingPanelIds.THEME);
  };

  const handleDismiss = () => {
    markPromotionSeen();
  };

  if (dismissed) {
    return null;
  }

  return (
    <Panel className={styles.promotion}>
      <AnimatedCanvas className={styles.canvas} />
      <div className={styles.content}>
        <Icon icon={faPaintBrush} className={styles.logo} />
        <Title className={styles.title}>{formatMessage({defaultMessage: 'Customize your theme!'})}</Title>
        <Button variant="elevated" color="light" size="lg" className={styles.button} onClick={handleTakeMeThere}>
          {formatMessage({defaultMessage: 'Take me there'})}
        </Button>
        <ActionIcon color="white" variant="transparent" size="lg" onClick={handleDismiss} aria-label="Close">
          <Icon icon={faClose} />
        </ActionIcon>
      </div>
    </Panel>
  );
}

export default Promotion;
