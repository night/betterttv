import React from 'react';
import {createRoot} from 'react-dom/client';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import useAuthStore from '../../stores/auth.js';
import {variablesToCSS} from '../../utils/css.js';
import extension from '../../utils/extension.js';
import {getProSettingValue} from '../../utils/pro.js';
import ThemeProvider, {mantineVariablesResolver, theme} from './ThemeProvider.jsx';
import {getProvider} from '../../utils/window.js';

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

class ShadowDOM {
  constructor() {
    this.components = {};

    this.host = document.createElement(APP_CONTAINER_ID);

    this.shadowRoot = this.host.attachShadow({mode: 'closed', delegatesFocus: true});
    this.mountNode = document.createElement('main');
    this.mountNode.className = SCOPE_CLASS;
    this.mountNode.setAttribute('data-platform', getProvider());
    this.mantineRoot = document.createElement('div');
    this.mountNode.appendChild(this.mantineRoot);
    this.shadowRoot.appendChild(this.mountNode);
    this.root = createRoot(this.mantineRoot);

    document.documentElement.appendChild(this.host);

    document.addEventListener('fullscreenchange', this.syncHostToFullscreen.bind(this));
    document.addEventListener('webkitfullscreenchange', this.syncHostToFullscreen.bind(this));
    document.addEventListener('MSFullscreenChange', this.syncHostToFullscreen.bind(this));

    this.injectMantineVariables();
    this.addStyleSheet(extension.url('betterttv.css', true));

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.injectMantineVariables()
    );

    this.toggleDarkModeClass();
    settings.on(`changed.${SettingIds.PRIMARY_COLOR}`, this.injectMantineVariables.bind(this));
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, this.toggleDarkModeClass.bind(this));
  }

  syncHostToFullscreen() {
    const fullscreenElement = document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

    if (fullscreenElement == null) {
      document.documentElement.appendChild(this.host);
      return;
    }

    if (fullscreenElement.contains(this.host)) {
      return;
    }

    fullscreenElement.appendChild(this.host);
  }

  toggleDarkModeClass() {
    const dark = settings.get(SettingIds.DARKENED_MODE) === true;
    this.mountNode.classList.toggle(DARK_MODE_CLASS, dark);
  }

  injectMantineVariables() {
    const primaryColor = getProSettingValue(SettingIds.PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR) ?? DEFAULT_PRIMARY_COLOR;
    const {variables, dark, light} = mantineVariablesResolver(theme, primaryColor);

    const baseCssVariables = variablesToCSS(`.${SCOPE_CLASS}`, {...variables, ...light});
    const darkCssVariables = variablesToCSS(`.${DARK_MODE_CLASS}`, dark);

    this.setAdoptedStyleSheet([baseCssVariables, darkCssVariables]);
  }

  setAdoptedStyleSheet(cssList) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssList.join('\n'));
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  addStyleSheet(url) {
    if (url == null) {
      return;
    }

    const css = document.createElement('link');
    css.setAttribute('href', url);
    css.setAttribute('type', 'text/css');
    css.setAttribute('rel', 'stylesheet');
    this.shadowRoot.appendChild(css);
  }

  mount(id, component) {
    this.components[id] = component;
    this.update();
  }

  unmount(id) {
    delete this.components[id];
    this.update();
  }

  isMounted(id) {
    return this.components[id] != null;
  }

  update() {
    const components = Object.entries(this.components);

    this.root.render(
      <ThemeProvider getRootElement={() => this.mantineRoot} withGlobalClasses={false} withCssVariables={false}>
        {components.map(([id, component]) => (
          <React.Fragment key={id}>{component}</React.Fragment>
        ))}
      </ThemeProvider>
    );
  }
}

export default new ShadowDOM();
