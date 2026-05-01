import {darken, lighten, parseThemeColor} from '@mantine/core';
import {DEFAULT_PRIMARY_COLOR, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import useAuthStore from '../../stores/auth.js';
import {variablesToCSS} from '../../utils/css.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {getProSettingValue} from '../../utils/pro.js';
import {theme} from '../shadow_dom/ThemeProvider.jsx';

const CSS_VARIABLES_STYLE_ID = 'twitch-purple-css-variables';

class AccentColor {
  constructor() {
    this.load();

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.load()
    );

    settings.on(`changed.${SettingIds.PRIMARY_COLOR}`, this.load.bind(this));
  }

  load() {
    const value = getProSettingValue(SettingIds.PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR);
    const cssVariablesStyle = document.getElementById(CSS_VARIABLES_STYLE_ID);

    if (value == null) {
      if (cssVariablesStyle != null) {
        cssVariablesStyle.remove();
      }

      return;
    }

    const themeColor = parseThemeColor({color: value, theme});
    const baseColors = theme.colors[themeColor.color];

    const twitchPurpleColors = {
      '--color-twitch-purple-1': darken(baseColors[9], 0.4),
      '--color-twitch-purple-2': darken(baseColors[9], 0.3),
      '--color-twitch-purple-3': darken(baseColors[9], 0.2),
      '--color-twitch-purple-4': darken(baseColors[9], 0.1),
      '--color-twitch-purple-5': baseColors[9],
      '--color-twitch-purple-6': baseColors[8],
      '--color-twitch-purple-7': baseColors[7],
      '--color-twitch-purple-8': baseColors[6],
      '--color-twitch-purple-9': baseColors[5],
      '--color-twitch-purple-10': baseColors[4],
      '--color-twitch-purple-11': baseColors[3],
      '--color-twitch-purple-12': baseColors[2],
      '--color-twitch-purple-13': baseColors[1],
      '--color-twitch-purple-14': baseColors[0],
      '--color-twitch-purple-15': lighten(baseColors[0], 0.1),
    };

    const twitchTextColors = {
      '--color-text-link': baseColors[7],
      '--color-text-link-hover': baseColors[6],
      '--color-text-link-active': baseColors[7],
      '--color-text-link-focus': baseColors[6],
      '--color-text-link-visited': baseColors[7],
    };

    const twitchButtonColors = {
      '--color-background-button-primary-default': baseColors[9],
      '--color-background-button-primary-hover': baseColors[8],
      '--color-background-button-primary-active': baseColors[7],
    };

    const twitchAccentColors = {
      '--color-accent': baseColors[9],
      '--color-accent-label': baseColors[0],
      '--color-accent-hover': baseColors[8],
      '--color-background-button-purchase': baseColors[5],
      '--color-accent-primary-1': baseColors[0],
      '--color-accent-primary-2': baseColors[1],
      '--color-accent-primary-3': baseColors[2],
      '--color-accent-primary-4': baseColors[3],
      '--color-accent-primary-5': baseColors[4],
    };

    const seekerBarStyles = {
      'background-color': baseColors[5],
    };

    const newCssVariablesStyle = document.createElement('style');
    newCssVariablesStyle.setAttribute('id', CSS_VARIABLES_STYLE_ID);

    const variables = [
      variablesToCSS(':root', twitchPurpleColors, true),
      variablesToCSS('div[class^="ScTokenOverrideCSSVars"]', twitchTextColors, true),
      variablesToCSS('div[class^="ScAccentRegionCssVars"]', twitchAccentColors, true),
      variablesToCSS('button[class^="ScCoreButton"]', twitchButtonColors, true),
      variablesToCSS('span[data-test-selector="seekbar-segment__segment"]', seekerBarStyles, true),
    ].join('\n');

    newCssVariablesStyle.textContent = variables;

    if (cssVariablesStyle == null) {
      document.body.appendChild(newCssVariablesStyle);
    } else {
      cssVariablesStyle.replaceWith(newCssVariablesStyle);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AccentColor()]);
