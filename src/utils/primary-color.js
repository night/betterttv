import {generateColors} from '@mantine/colors-generator';
import {parseThemeColor} from '@mantine/core';
import chroma from 'chroma-js';
import {DEFAULT_PRIMARY_COLOR} from '@/constants';

export const CUSTOM_PRIMARY_COLOR_KEY = 'custom';

export const DEFAULT_CUSTOM_PRIMARY_COLOR = '#9147ff';

export function isCustomPrimaryColor(value) {
  return typeof value === 'string' && value.startsWith('#');
}

export function normalizeCustomColor(hex) {
  const [h, s, l] = chroma(hex).hsl();
  const achromatic = Number.isNaN(h) || s < 0.05;
  return chroma.hsl(achromatic ? 0 : h, achromatic ? s : Math.max(s, 0.4), Math.min(Math.max(l, 0.4), 0.65)).hex();
}

export function getEffectivePrimaryColor(value, isPro) {
  if (isCustomPrimaryColor(value) && !isPro) {
    return null;
  }
  return value;
}

export function getPrimaryColorShades(value, theme) {
  if (isCustomPrimaryColor(value)) {
    return generateColors(value);
  }
  const parsedColor = parseThemeColor({color: value, theme});
  return theme.colors[parsedColor.color];
}

export function resolvePrimaryColorTheme(value, theme) {
  if (value == null) {
    return {...theme, primaryColor: DEFAULT_PRIMARY_COLOR};
  }
  if (isCustomPrimaryColor(value)) {
    return {
      ...theme,
      colors: {...theme.colors, [CUSTOM_PRIMARY_COLOR_KEY]: generateColors(value)},
      primaryColor: CUSTOM_PRIMARY_COLOR_KEY,
    };
  }
  return {...theme, primaryColor: value};
}
