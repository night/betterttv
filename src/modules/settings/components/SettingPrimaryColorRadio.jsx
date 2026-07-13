import React, {useCallback, useMemo} from 'react';
import {DEFAULT_PRIMARY_COLOR} from '@/constants';
import formatMessage from '@/i18n/index';
import swatchStyles from './SettingPrimaryColorRadio.module.css';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import groupStyles from './SettingRadioCardGroup.module.css';
import SettingWrapper from './SettingWrapper';

export const PRIMARY_COLOR_RADIO_DEFAULT = 'default';

export const PRIMARY_COLOR_PALETTE = [
  PRIMARY_COLOR_RADIO_DEFAULT,
  DEFAULT_PRIMARY_COLOR,
  'pink',
  'indigo',
  'green',
  'orange',
];

export function normalizePrimaryColor(value, palette = PRIMARY_COLOR_PALETTE) {
  if (value == null) {
    return PRIMARY_COLOR_RADIO_DEFAULT;
  }
  if (palette.includes(value)) {
    return value;
  }
  return PRIMARY_COLOR_RADIO_DEFAULT;
}

function buildPrimaryColorLabels(colors) {
  const messages = {
    default: formatMessage({defaultMessage: 'Default'}),
    red: formatMessage({defaultMessage: 'Red'}),
    pink: formatMessage({defaultMessage: 'Pink'}),
    indigo: formatMessage({defaultMessage: 'Indigo'}),
    green: formatMessage({defaultMessage: 'Green'}),
    orange: formatMessage({defaultMessage: 'Orange'}),
  };

  return Object.fromEntries(colors.map((color) => [color, messages[color] ?? color]));
}

function SettingPrimaryColorRadio({
  value,
  onChange,
  name,
  description,
  colors = PRIMARY_COLOR_PALETTE,
  showProBadge = false,
  showBetaBadge = false,
}) {
  const normalizedValue = useMemo(() => normalizePrimaryColor(value, colors), [value, colors]);
  const colorLabels = useMemo(() => buildPrimaryColorLabels(colors), [colors]);
  const handleChange = useCallback((next) => onChange(next === PRIMARY_COLOR_RADIO_DEFAULT ? null : next), [onChange]);

  return (
    <SettingWrapper
      name={name}
      wrap
      reverse
      description={description}
      controlClassName={groupStyles.radioGroup}
      showProBadge={showProBadge}
      showBetaBadge={showBetaBadge}>
      <SettingRadioCardGroup value={normalizedValue} onChange={handleChange}>
        {colors.map((color) => (
          <SettingRadioCard
            key={color}
            value={color}
            tooltip={colorLabels[color]}
            ariaLabel={
              color === PRIMARY_COLOR_RADIO_DEFAULT
                ? formatMessage({defaultMessage: 'Default theme primary color'})
                : formatMessage({defaultMessage: '{colorName} primary color'}, {colorName: color})
            }
            className={swatchStyles.swatch}
            radioCardProps={{'data-bttv-color': color}}
          />
        ))}
      </SettingRadioCardGroup>
    </SettingWrapper>
  );
}

export default SettingPrimaryColorRadio;
