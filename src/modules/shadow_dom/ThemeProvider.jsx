import React, {useMemo, useRef} from 'react';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '@/constants';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Checkbox,
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
  mergeMantineTheme,
  Loader,
} from '@mantine/core';
import badgeStyles from '@/modules/shadow_dom/styles/badge.module.css';
import buttonStyles from '@/modules/shadow_dom/styles/button.module.css';
import pillStyles from '@/modules/shadow_dom/styles/pill.module.css';
import inputStyles from '@/modules/shadow_dom/styles/input.module.css';
import kbdStyles from '@/modules/shadow_dom/styles/kbd.module.css';
import switchStyles from '@/modules/shadow_dom/styles/switch.module.css';
import checkboxStyles from '@/modules/shadow_dom/styles/checkbox.module.css';
import radioStyles from '@/modules/shadow_dom/styles/radio.module.css';
import useStorageState from '@/common/hooks/StorageState';
import {ModalsProvider} from '@mantine/modals';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {LoaderIconError, LoaderIconIndicator, LoaderIconSuccess} from '@/common/components/LoaderIcon';
import {PortalContext} from '@/common/contexts/PortalContext';
import {useMounted} from '@mantine/hooks';

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

      if (parsedColor.color === 'dark') {
        return {
          background: 'var(--mantine-color-button-elevated-background)',
          hover: 'var(--mantine-color-button-elevated-hover)',
          active: 'var(--mantine-color-button-elevated-active)',
          color: 'var(--mantine-color-button-elevated-color)',
          border: 'var(--mantine-color-button-elevated-border)',
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
          background: 'var(--mantine-color-button-elevated-contrast-background)',
          hover: 'var(--mantine-color-button-elevated-contrast-hover)',
          active: 'var(--mantine-color-button-elevated-contrast-active)',
          color: 'var(--mantine-color-button-elevated-contrast-color)',
          border: 'var(--mantine-color-button-elevated-contrast-border)',
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
    // elevated button variant, color="dark"
    '--mantine-color-button-elevated-background': 'var(--mantine-color-dark-6)',
    '--mantine-color-button-elevated-hover': 'var(--mantine-color-dark-5)',
    '--mantine-color-button-elevated-active': 'var(--mantine-color-dark-4)',
    '--mantine-color-button-elevated-color': 'var(--mantine-color-dark-0)',
    '--mantine-color-button-elevated-border': 'var(--mantine-color-dark-4)',
    // elevated button variant, color="contrast"
    '--mantine-color-button-elevated-contrast-background': 'var(--mantine-color-gray-1)',
    '--mantine-color-button-elevated-contrast-hover': 'var(--mantine-color-gray-2)',
    '--mantine-color-button-elevated-contrast-active': 'var(--mantine-color-gray-3)',
    '--mantine-color-button-elevated-contrast-color': 'var(--mantine-color-gray-8)',
    '--mantine-color-button-elevated-contrast-border': 'var(--mantine-color-gray-4)',
  },
  light: {
    '--mantine-color-text': 'var(--mantine-color-gray-9)',
    '--mantine-color-text-inverse': 'var(--mantine-color-dark-0)',
    '--mantine-color-dimmed-inverse': 'var(--mantine-color-gray-5)',
    '--mantine-color-default-border': 'var(--mantine-color-gray-3)',
    '--mantine-color-body-secondary': 'var(--mantine-color-gray-0)',
    '--mantine-color-body-inverse': 'var(--mantine-color-gray-9)',
    // elevated button variant, color="dark"
    '--mantine-color-button-elevated-background': 'var(--mantine-color-gray-1)',
    '--mantine-color-button-elevated-hover': 'var(--mantine-color-gray-2)',
    '--mantine-color-button-elevated-active': 'var(--mantine-color-gray-3)',
    '--mantine-color-button-elevated-color': 'var(--mantine-color-gray-8)',
    '--mantine-color-button-elevated-border': 'var(--mantine-color-gray-4)',
    // elevated button variant, color="contrast"
    '--mantine-color-button-elevated-contrast-background': 'var(--mantine-color-dark-6)',
    '--mantine-color-button-elevated-contrast-hover': 'var(--mantine-color-dark-5)',
    '--mantine-color-button-elevated-contrast-active': 'var(--mantine-color-dark-4)',
    '--mantine-color-button-elevated-contrast-color': 'var(--mantine-color-gray-0)',
    '--mantine-color-button-elevated-contrast-border': 'var(--mantine-color-dark-4)',
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
  const portalRef = useRef();
  const isMounted = useMounted();

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
    <PortalContext.Provider value={portalRef}>
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
    </PortalContext.Provider>
  );
}

export default ThemeProvider;
