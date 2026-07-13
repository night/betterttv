import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Checkbox,
  alpha,
  createTheme,
  defaultVariantColorsResolver,
  v8CssVariablesResolver,
  DEFAULT_THEME,
  Input,
  Kbd,
  MantineProvider,
  parseThemeColor,
  Pill,
  Radio,
  Switch,
  TagsInput,
  mergeMantineTheme,
  Loader,
} from '@mantine/core';
import {useMounted} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import React, {useMemo, useRef} from 'react';
import {LoaderIconError, LoaderIconIndicator, LoaderIconSuccess} from '@/common/components/LoaderIcon';
import {PortalContext} from '@/common/contexts/PortalContext';
import useStorageState from '@/common/hooks/StorageState';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '@/constants';
import badgeStyles from '@/modules/shadow_dom/styles/badge.module.css';
import buttonStyles from '@/modules/shadow_dom/styles/button.module.css';
import checkboxStyles from '@/modules/shadow_dom/styles/checkbox.module.css';
import comboboxStyles from '@/modules/shadow_dom/styles/combobox.module.css';
import inputStyles from '@/modules/shadow_dom/styles/input.module.css';
import kbdStyles from '@/modules/shadow_dom/styles/kbd.module.css';
import pillStyles from '@/modules/shadow_dom/styles/pill.module.css';
import radioStyles from '@/modules/shadow_dom/styles/radio.module.css';
import switchStyles from '@/modules/shadow_dom/styles/switch.module.css';
import useAuthStore from '@/stores/auth';
import {getEffectivePrimaryColor, resolvePrimaryColorTheme} from '@/utils/primary-color';
import {isUserPro} from '@/utils/pro';

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
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    Autocomplete: Autocomplete.extend({
      classNames: comboboxStyles,
      defaultProps: {scrollAreaProps: {classNames: {content: comboboxStyles.scrollAreaContent}}},
    }),
    TagsInput: TagsInput.extend({
      classNames: comboboxStyles,
      defaultProps: {scrollAreaProps: {classNames: {content: comboboxStyles.scrollAreaContent}}},
    }),
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
    Badge: Badge.extend({classNames: badgeStyles}),
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
  },
  dark: {
    '--mantine-color-text': 'var(--mantine-color-dark-0)',
    '--mantine-color-text-inverse': 'var(--mantine-color-gray-9)',
    '--mantine-color-dimmed-inverse': 'var(--mantine-color-gray-6)',
    '--mantine-color-default-border': 'var(--mantine-color-dark-6)',
    '--mantine-color-body-secondary': 'var(--mantine-color-dark-9)',
    '--mantine-color-body': 'var(--mantine-color-dark-8)',
    '--mantine-color-body-inverse': 'var(--mantine-color-dark-0)',
    '--mantine-primary-color-light-active': alpha(theme.colors[theme.primaryColor][theme.primaryShade - 2], 0.3),
    '--mantine-color-elevated-hover': 'var(--mantine-color-dark-6)',
    '--mantine-color-elevated-active': 'var(--mantine-color-dark-5)',
  },
  light: {
    '--mantine-color-text': 'var(--mantine-color-gray-9)',
    '--mantine-color-text-inverse': 'var(--mantine-color-dark-0)',
    '--mantine-color-dimmed-inverse': 'var(--mantine-color-gray-5)',
    '--mantine-color-default-border': 'var(--mantine-color-gray-3)',
    '--mantine-color-body-secondary': 'var(--mantine-color-gray-0)',
    '--mantine-color-body-inverse': 'var(--mantine-color-gray-9)',
    '--mantine-primary-color-light-active': alpha(theme.colors[theme.primaryColor][theme.primaryShade], 0.18),
    '--mantine-color-elevated-hover': 'var(--mantine-color-gray-1)',
    '--mantine-color-elevated-active': 'var(--mantine-color-gray-2)',
  },
});

export const mantineVariablesResolver = (theme, primaryColor) => {
  if (primaryColor != null) {
    theme.primaryColor = primaryColor;
  }

  const {variables: defaultVariables, dark: defaultDark, light: defaultLight} = v8CssVariablesResolver(theme);
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
  const isPro = useAuthStore((state) => isUserPro(state.user));
  const portalRef = useRef();
  const isMounted = useMounted();

  const modifiedTheme = useMemo(
    () => resolvePrimaryColorTheme(getEffectivePrimaryColor(primaryColor, isPro), theme),
    [primaryColor, isPro]
  );

  return (
    <PortalContext value={portalRef}>
      <MantineProvider
        forceColorScheme={dark ? 'dark' : 'light'}
        classNamesPrefix="bttv-mantine-"
        theme={modifiedTheme}
        withCssVariables={false}
        withGlobalClasses={false}
        {...props}>
        <div ref={portalRef} id="bttv-shadow-dom-portal" />
        {/* portalRef.current is not available during the initial render */}
        {isMounted ? (
          /* withinPortal:false must be the provider-level default, not just per-modal. The manager
          renders a single persistent Modal whose per-modal props only apply while a modal is open,
          so without this the closed Modal falls back to withinPortal:true (portaled) and the first
          open flips it to inline — remounting the Transition already-open and skipping the enter
          animation. Keeping it false in both states avoids that remount. */
          <ModalsProvider modalProps={{withinPortal: false, portalProps: {target: portalRef.current}}}>
            {children}
          </ModalsProvider>
        ) : null}
      </MantineProvider>
    </PortalContext>
  );
}

export default ThemeProvider;
