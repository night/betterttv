import React, {useCallback, useMemo} from 'react';
import {DEFAULT_PRIMARY_COLOR} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import SettingColorRadio from './SettingColorRadio.jsx';

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
    <SettingColorRadio
      showProBadge={showProBadge}
      showBetaBadge={showBetaBadge}
      value={normalizedValue}
      onChange={handleChange}
      name={name}
      description={description}
      colors={colors}
      colorLabels={colorLabels}
    />
  );
}

export default SettingPrimaryColorRadio;
