import React, {useMemo} from 'react';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '../../constants.js';
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  createTheme,
  defaultVariantColorsResolver,
  defaultCssVariablesResolver,
  DEFAULT_THEME,
  Input,
  Kbd,
  MantineProvider,
  parseThemeColor,
  Pill,
  Radio,
  Switch,
  mergeMantineTheme,
  getThemeColor,
  alpha,
  Loader,
} from '@mantine/core';
import buttonStyles from './styles/button.module.css';
import pillStyles from './styles/pill.module.css';
import inputStyles from './styles/input.module.css';
import kbdStyles from './styles/kbd.module.css';
import switchStyles from './styles/switch.module.css';
import checkboxStyles from './styles/checkbox.module.css';
import radioStyles from './styles/radio.module.css';
import useStorageState from '../../common/hooks/StorageState.jsx';
import {ModalsProvider} from '@mantine/modals';
import useProRequiredState from '../../common/hooks/ProRequiredState.jsx';
import {LoaderIconError, LoaderIconIndicator, LoaderIconSuccess} from '../../common/components/LoaderIcon.jsx';

const mantineTheme = createTheme({
  primaryColor: DEFAULT_PRIMARY_COLOR,
  primaryShade: 6,
  cursorType: 'pointer',
  fontSizes: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '1.75rem',
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: {fontSize: '2rem', fontWeight: 500},
      h2: {fontSize: '1.75rem', fontWeight: 500},
      h3: {fontSize: '1.5rem', fontWeight: 400},
      h4: {fontSize: '1.25rem', fontWeight: 400},
      h5: {fontSize: '1rem', fontWeight: 400},
      h6: {fontSize: '0.75rem', fontWeight: 400},
    },
  },
  variantColorResolver: (input) => {
    let {theme, variant, color} = input;

    if (color == null || color === 'primary') {
      color = theme.primaryColor;
    }

    const parsedColor = parseThemeColor({color, theme});
    const base = theme.colors[color];

    if (variant === 'elevated') {
      const grayBase = theme.colors.gray;
      const darkBase = theme.colors.dark;

      if (parsedColor.color === 'dark') {
        return {
          background: `light-dark(${grayBase[1]}, ${darkBase[6]})`,
          hover: `light-dark(${grayBase[2]}, ${darkBase[5]})`,
          active: `light-dark(${grayBase[3]}, ${darkBase[4]})`,
          color: `light-dark(${grayBase[8]}, ${darkBase[0]})`,
          border: `light-dark(${grayBase[4]}, ${darkBase[4]})`,
        };
      }

      if (parsedColor.color === 'light') {
        return {
          background: grayBase[1],
          hover: grayBase[2],
          active: grayBase[3],
          color: grayBase[8],
          border: grayBase[4],
        };
      }

      if (parsedColor.color === 'contrast') {
        return {
          background: `light-dark(${darkBase[6]}, ${grayBase[1]})`,
          hover: `light-dark(${darkBase[5]}, ${grayBase[2]})`,
          active: `light-dark(${darkBase[4]}, ${grayBase[3]})`,
          color: `light-dark(${grayBase[0]}, ${grayBase[8]})`,
          border: `light-dark(${darkBase[4]}, ${grayBase[4]})`,
        };
      }

      return {
        background: `light-dark(${base[6]}, ${base[9]})`,
        hover: `light-dark(${base[7]}, ${base[8]})`,
        active: `light-dark(${base[8]}, ${base[7]})`,
        color: `light-dark(${base[0]}, ${base[0]})`,
        border: `light-dark(${base[8]}, ${base[7]})`,
      };
    }

    return defaultVariantColorsResolver(input);
  },
  components: {
    Switch: Switch.extend({classNames: switchStyles}),
    Checkbox: Checkbox.extend({classNames: checkboxStyles}),
    Radio: Radio.extend({classNames: radioStyles}),
    Input: Input.extend({classNames: inputStyles}),
    Button: Button.extend({
      classNames: buttonStyles,
      defaultProps: {variant: 'elevated', color: 'dark'},
    }),
    ActionIcon: ActionIcon.extend({
      classNames: buttonStyles,
      defaultProps: {variant: 'elevated', color: 'dark'},
    }),
    Pill: Pill.extend({
      classNames: pillStyles,
      defaultProps: {variant: 'elevated', color: 'dark'},
    }),
    Avatar: Avatar.extend({defaultProps: {color: 'dark'}}),
    Kbd: Kbd.extend({defaultProps: {size: 'lg'}, classNames: kbdStyles}),
    Loader: Loader.extend({
      defaultProps: {
        loaders: {
          ...Loader.defaultLoaders,
          loaderIconIndicator: LoaderIconIndicator,
          loaderIconSuccess: LoaderIconSuccess,
          loaderIconError: LoaderIconError,
        },
        type: 'loaderIconIndicator',
      },
    }),
  },
});

const resolver = (theme) => ({
  variables: {
    '--mantine-color-text': 'var(--mantine-color-dark-0)',
    '--mantine-color-default-border': 'var(--mantine-color-gray-0)',
    '--mantine-color-default-border': 'var(--mantine-color-dark-9)',
    '--mantine-primary-color-light-active': alpha(getThemeColor(theme.primaryColor, theme), 0.3),
  },
  dark: {
    '--mantine-color-text': 'var(--mantine-color-dark-0)',
    '--mantine-color-default-border': 'var(--mantine-color-dark-6)',
    '--mantine-color-body-secondary': 'var(--mantine-color-dark-9)',
    '--mantine-color-body': 'var(--mantine-color-dark-8)',
  },
  light: {
    '--mantine-color-text': 'var(--mantine-color-gray-9)',
    '--mantine-color-default-border': 'var(--mantine-color-gray-3)',
    '--mantine-color-body-secondary': 'var(--mantine-color-gray-0)',
  },
});

export const mantineVariablesResolver = (theme, primaryColor) => {
  if (primaryColor != null) {
    theme.primaryColor = primaryColor;
  }

  const {variables: defaultVariables, dark: defaultDark, light: defaultLight} = defaultCssVariablesResolver(theme);
  const {variables, dark, light} = resolver(theme);

  return {
    variables: {...defaultVariables, ...variables},
    dark: {...defaultDark, ...dark},
    light: {...defaultLight, ...light},
  };
};

export const theme = mergeMantineTheme(DEFAULT_THEME, mantineTheme);

function ThemeProvider({children, ...props}) {
  const [dark] = useStorageState(SettingIds.DARKENED_MODE);
  const [primaryColor] = useStorageState(SettingIds.PRIMARY_COLOR);

  const [normalizedPrimaryColor] = useProRequiredState({
    value: primaryColor,
    defaultValue: DEFAULT_PRIMARY_COLOR,
  });

  const modifiedTheme = useMemo(() => {
    if (normalizedPrimaryColor == null) {
      return {...theme, primaryColor: DEFAULT_PRIMARY_COLOR};
    }

    return {...theme, primaryColor: normalizedPrimaryColor};
  }, [normalizedPrimaryColor]);

  return (
    <MantineProvider
      forceColorScheme={dark ? 'dark' : 'light'}
      classNamesPrefix="bttv-mantine-"
      theme={modifiedTheme}
      withCssVariables={false}
      withGlobalClasses={false}
      {...props}>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}

export default ThemeProvider;
