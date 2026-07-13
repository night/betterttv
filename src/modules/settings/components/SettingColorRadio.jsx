import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {Badge, RadioGroup, RadioCard, Tooltip} from '@mantine/core';
import React from 'react';
import Icon from '@/common/components/Icon';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n/index';
import ColorPicker from './ColorPicker';
import styles from './SettingColorRadio.module.css';
import SettingWrapper from './SettingWrapper';

function SettingColorRadio({
  value,
  onChange,
  name,
  description,
  colors,
  colorLabels,
  proColor,
  customColor,
  customColorEnabled = false,
  onCustomColorChange,
  onCustomColorCommit,
  showProBadge = false,
  showBetaBadge = false,
}) {
  const portalRef = usePortalRef();

  const renderSwatch = (color) => (
    <RadioCard
      value={color}
      radius="lg"
      className={styles.swatch}
      data-bttv-color={color}
      style={color === proColor && customColor != null ? {'--bttv-custom-color': customColor} : undefined}
      aria-label={
        color === 'default'
          ? formatMessage({defaultMessage: 'Default theme primary color'})
          : formatMessage({defaultMessage: '{colorName} primary color'}, {colorName: colorLabels[color] ?? color})
      }>
      {color === proColor ? (
        <Badge color="indigo" variant="elevated" className={styles.proBadge}>
          {formatMessage({defaultMessage: 'Pro'})}
        </Badge>
      ) : null}
      <Icon icon={faCheckCircle} className={styles.checkIcon} />
    </RadioCard>
  );

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
          {colors.map((color) => {
            if (color === proColor) {
              if (customColorEnabled) {
                return (
                  <ColorPicker
                    key={color}
                    value={customColor}
                    onChange={onCustomColorChange}
                    onChangeEnd={onCustomColorCommit}>
                    {renderSwatch(color)}
                  </ColorPicker>
                );
              }
              return <React.Fragment key={color}>{renderSwatch(color)}</React.Fragment>;
            }
            return (
              <Tooltip
                key={color}
                openDelay={200}
                withArrow
                arrowSize={8}
                radius="md"
                className={styles.tooltip}
                label={colorLabels[color]}
                portalProps={{target: portalRef.current}}>
                {renderSwatch(color)}
              </Tooltip>
            );
          })}
        </div>
      </RadioGroup>
    </SettingWrapper>
  );
}

export default SettingColorRadio;
