import {SettingIds} from '@/constants';
import settings from '@/settings';

const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// When the setting is enabled motion is always reduced; when disabled we fall back to the
// browser's reduced motion preference.
export function shouldReduceMotion() {
  return settings.get(SettingIds.REDUCED_MOTION) === true || reducedMotionMediaQuery.matches;
}

export function onReducedMotionChange(callback) {
  settings.on(`changed.${SettingIds.REDUCED_MOTION}`, callback);
  reducedMotionMediaQuery.addEventListener('change', callback);
}
