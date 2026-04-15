import React from 'react';
import {RadioGroup, RadioCard, Tooltip} from '@mantine/core';
import formatMessage from '../../../i18n/index.js';
import styles from './SettingColorRadio.module.css';
import SettingWrapper from './SettingWrapper.jsx';
import usePortalRef from '../../../common/hooks/PortalRef.jsx';
import Icon from '../../../common/components/Icon.jsx';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';

function SettingColorRadio({
  value,
  onChange,
  name,
  description,
  colors,
  colorLabels,
  showProBadge = false,
  showBetaBadge = false,
}) {
  const portalRef = usePortalRef();

  return (
    <SettingWrapper
      name={name}
      wrap
      reverse
      description={description}
      controlClassName={styles.radioGroup}
      showProBadge={showProBadge}
      showBetaBadge={showBetaBadge}>
      <RadioGroup className={styles.radioGroup} value={value} onChange={onChange}>
        <div className={styles.radioCards}>
          {colors.map((color) => (
            <React.Fragment key={color}>
              <Tooltip
                openDelay={200}
                withArrow
                arrowSize={8}
                radius="md"
                className={styles.tooltip}
                label={colorLabels[color]}
                portalProps={{target: portalRef.current}}>
                <RadioCard
                  value={color}
                  radius="lg"
                  className={styles.swatch}
                  data-bttv-color={color}
                  aria-label={
                    color === 'default'
                      ? formatMessage({defaultMessage: 'Default theme primary color'})
                      : formatMessage({defaultMessage: '{colorName} primary color'}, {colorName: color})
                  }>
                  <Icon icon={faCheckCircle} className={styles.checkIcon} />
                </RadioCard>
              </Tooltip>
            </React.Fragment>
          ))}
        </div>
      </RadioGroup>
    </SettingWrapper>
  );
}

export default SettingColorRadio;
