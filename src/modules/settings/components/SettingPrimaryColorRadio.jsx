import React, {useCallback, useMemo, useState} from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {DEFAULT_PRIMARY_COLOR} from '@/constants';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {
  CUSTOM_PRIMARY_COLOR_KEY,
  DEFAULT_CUSTOM_PRIMARY_COLOR,
  isCustomPrimaryColor,
  normalizeCustomColor,
} from '@/utils/primary-color';
import {isUserPro} from '@/utils/pro';
import SettingColorRadio from './SettingColorRadio';

export const PRIMARY_COLOR_RADIO_DEFAULT = 'default';

export const PRIMARY_COLOR_PALETTE = [
  PRIMARY_COLOR_RADIO_DEFAULT,
  DEFAULT_PRIMARY_COLOR,
  'pink',
  'indigo',
  'green',
  'orange',
  CUSTOM_PRIMARY_COLOR_KEY,
];

export function normalizePrimaryColor(value, palette = PRIMARY_COLOR_PALETTE) {
  if (value == null) {
    return PRIMARY_COLOR_RADIO_DEFAULT;
  }
  if (isCustomPrimaryColor(value)) {
    return CUSTOM_PRIMARY_COLOR_KEY;
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
    custom: formatMessage({defaultMessage: 'Custom'}),
  };

  return Object.fromEntries(colors.map((color) => [color, messages[color] ?? color]));
}

function SettingPrimaryColorRadio({
  value,
  onChange,
  name,
  description,
  colors = PRIMARY_COLOR_PALETTE,
  showBetaBadge = false,
}) {
  const isPro = useAuthStore((state) => isUserPro(state.user));

  const [customDraft, setCustomDraft] = useState(() =>
    isCustomPrimaryColor(value) ? value : DEFAULT_CUSTOM_PRIMARY_COLOR
  );

  const normalizedValue = useMemo(() => normalizePrimaryColor(value, colors), [value, colors]);
  const colorLabels = useMemo(() => buildPrimaryColorLabels(colors), [colors]);

  const [, updateCustomColor] = useProRequiredState({setValue: onChange});

  const handleChange = useCallback(
    (next) => {
      if (next === CUSTOM_PRIMARY_COLOR_KEY) {
        updateCustomColor(customDraft);
        return;
      }
      onChange(next === PRIMARY_COLOR_RADIO_DEFAULT ? null : next);
    },
    [onChange, customDraft, updateCustomColor]
  );

  const handleCustomColorChange = useCallback((next) => {
    setCustomDraft(next);
  }, []);

  const handleCustomColorCommit = useCallback(
    (next) => {
      const normalized = normalizeCustomColor(next);
      setCustomDraft(normalized);
      onChange(normalized);
    },
    [onChange]
  );

  return (
    <SettingColorRadio
      showBetaBadge={showBetaBadge}
      value={normalizedValue}
      onChange={handleChange}
      name={name}
      description={description}
      colors={colors}
      colorLabels={colorLabels}
      proColor={CUSTOM_PRIMARY_COLOR_KEY}
      customColor={customDraft}
      customColorEnabled={isPro}
      onCustomColorChange={handleCustomColorChange}
      onCustomColorCommit={handleCustomColorCommit}
    />
  );
}

export default SettingPrimaryColorRadio;
