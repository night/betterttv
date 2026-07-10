import {QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {createRoot} from 'react-dom/client';
import queryClient from '@/common/query-client';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '@/constants';
import settings from '@/settings';
import useAuthStore from '@/stores/auth';
import {variablesToCSS} from '@/utils/css';
import extension from '@/utils/extension';
import {getProSettingValue} from '@/utils/pro';
import {getProvider} from '@/utils/window';
import ThemeProvider, {mantineVariablesResolver, theme} from './ThemeProvider';

const randomPrefix = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
const APP_CONTAINER_ID = `${randomPrefix}${crypto.randomUUID()}`;

function AppContainer() {
  return Reflect.construct(HTMLElement, [], AppContainer);
}

AppContainer.prototype = Object.create(HTMLElement.prototype);
AppContainer.prototype.constructor = AppContainer;

customElements.define(APP_CONTAINER_ID, AppContainer);

const SCOPE_CLASS = 'bttv-mantine-scope';
const DARK_MODE_CLASS = 'bttv-mantine-theme-dark';

// This module is a singleton, so its state lives in file-scoped globals.
const components = {};
const host = document.createElement(APP_CONTAINER_ID);
const shadowRoot = host.attachShadow({mode: 'closed', delegatesFocus: true});
const mountNode = document.createElement('main');
const mantineRoot = document.createElement('div');
const root = createRoot(mantineRoot);

function showMountNode() {
  mountNode.style.display = '';
}

function reparentHost(parent) {
  // Reparenting the host synchronously drops the shadow root's <link> styles until the browser
  // re-loads it (its `load` re-fires), so hide the UI across the move and let the reveal-on-load
  // bring it back once styled. Otherwise it flashes unstyled (e.g. a giant emote menu, or the
  // autocomplete leaking over the video).
  mountNode.style.display = 'none';
  parent.appendChild(host);
}

function syncHostToFullscreen() {
  const fullscreenElement = document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
  if (fullscreenElement == null) {
    if (host.parentElement !== document.documentElement) {
      reparentHost(document.documentElement);
    }
    return;
  }

  if (fullscreenElement.contains(host)) {
    return;
  }

  reparentHost(fullscreenElement);
}

function toggleDarkModeClass() {
  const dark = settings.get(SettingIds.DARKENED_MODE) === true;
  mountNode.classList.toggle(DARK_MODE_CLASS, dark);
}

function setAdoptedStyleSheet(cssList) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssList.join('\n'));
  shadowRoot.adoptedStyleSheets = [sheet];
}

function injectMantineVariables() {
  const primaryColor = getProSettingValue(SettingIds.PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR) ?? DEFAULT_PRIMARY_COLOR;
  const {variables, dark, light} = mantineVariablesResolver(theme, primaryColor);

  const baseCssVariables = variablesToCSS(`.${SCOPE_CLASS}`, {...variables, ...light});
  const darkCssVariables = variablesToCSS(`.${DARK_MODE_CLASS}`, dark);

  setAdoptedStyleSheet([baseCssVariables, darkCssVariables]);
}

function addStyleSheet() {
  const url = extension.url('betterttv.css', true);
  // Only a single stylesheet is supported: the load-gated reveal (and the reveal on each
  // reparent) assumes one stylesheet, so a second would race it and let the UI show unstyled.
  if (url == null) {
    return;
  }

  const css = document.createElement('link');
  css.setAttribute('href', url);
  css.setAttribute('type', 'text/css');
  css.setAttribute('rel', 'stylesheet');
  // Reveal the UI only once its stylesheet has loaded, so it never renders unstyled. If the
  // stylesheet is missing or fails to load we leave it hidden rather than show an unstyled UI.
  css.addEventListener('load', showMountNode);
  shadowRoot.appendChild(css);
}

function update() {
  root.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider getRootElement={() => mantineRoot} withGlobalClasses={false} withCssVariables={false}>
        {Object.entries(components).map(([id, component]) => (
          <React.Fragment key={id}>{component}</React.Fragment>
        ))}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function mount(id, component) {
  components[id] = component;
  update();
}

function unmount(id) {
  delete components[id];
  update();
}

function isMounted(id) {
  return components[id] != null;
}

mountNode.className = SCOPE_CLASS;
// Keep the UI hidden until its stylesheet has loaded so it never flashes unstyled.
mountNode.style.display = 'none';
mountNode.setAttribute('data-platform', getProvider());
mountNode.appendChild(mantineRoot);
shadowRoot.appendChild(mountNode);

document.documentElement.appendChild(host);

document.addEventListener('fullscreenchange', syncHostToFullscreen);

injectMantineVariables();
addStyleSheet();

useAuthStore.subscribe((state) => state.user?.pro ?? false, injectMantineVariables);

toggleDarkModeClass();
settings.on(`changed.${SettingIds.PRIMARY_COLOR}`, injectMantineVariables);
settings.on(`changed.${SettingIds.DARKENED_MODE}`, toggleDarkModeClass);

export default {mount, unmount, isMounted};
