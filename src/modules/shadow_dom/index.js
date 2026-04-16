import React, {createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {PortalContext} from '../../common/contexts/PortalContext.jsx';
import {DEFAULT_PRIMARY_COLOR, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import useAuthStore from '../../stores/auth.js';
import {variablesToCSS} from '../../utils/css.js';
import extension from '../../utils/extension.js';
import {getProSettingValue} from '../../utils/pro.js';
import ThemeProvider, {mantineVariablesResolver, theme} from './ThemeProvider.jsx';

const randomPrefix = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
const APP_CONTAINER_ID = `${randomPrefix}${crypto.randomUUID()}`;

function AppContainer() {
  return Reflect.construct(HTMLElement, [], AppContainer);
}

AppContainer.prototype = Object.create(HTMLElement.prototype);
AppContainer.prototype.constructor = AppContainer;

customElements.define(APP_CONTAINER_ID, AppContainer);

class ShadowDOM {
  constructor() {
    this.components = {};

    const host = document.createElement(APP_CONTAINER_ID);

    this.shadowRoot = host.attachShadow({mode: 'closed', delegatesFocus: true});
    this.mountNode = document.createElement('main');
    this.mountNode.className = 'bttv-mantine-scope';
    this.mantineRoot = document.createElement('div');
    this.mountNode.appendChild(this.mantineRoot);
    this.shadowRoot.appendChild(this.mountNode);
    this.root = createRoot(this.mantineRoot);

    document.documentElement.appendChild(host);

    this.injectMantineVariables();
    this.addStyleSheet(extension.url('betterttv.css', true));

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.injectMantineVariables()
    );

    settings.on(`changed.${SettingIds.PRIMARY_COLOR}`, this.injectMantineVariables.bind(this));
  }

  injectMantineVariables() {
    const {user: currentUser} = useAuthStore.getState();
    let primaryColor = getProSettingValue(currentUser, SettingIds.PRIMARY_COLOR);

    if (primaryColor == null) {
      primaryColor = DEFAULT_PRIMARY_COLOR;
    }

    const {variables, dark, light} = mantineVariablesResolver(theme, primaryColor);

    const baseCssVariables = variablesToCSS('.bttv-mantine-scope', variables);
    const darkCssVariables = variablesToCSS('.bttv-mantine-scope:has([data-mantine-color-scheme="dark"])', dark);
    const lightCssVariables = variablesToCSS('.bttv-mantine-scope:has([data-mantine-color-scheme="light"])', light);

    this.setAdoptedStyleSheet([baseCssVariables, darkCssVariables, lightCssVariables]);
  }

  setAdoptedStyleSheet(cssList) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssList.join('\n'));
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  addStyleSheet(url) {
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
    const portalRef = createRef(null);

    this.root.render(
      <ThemeProvider getRootElement={() => this.mantineRoot} withGlobalClasses={false} withCssVariables={false}>
        <div ref={portalRef} id="bttv-shadow-dom-portal" />
        <PortalContext.Provider value={portalRef}>
          {components.map(([id, component]) => (
            <React.Fragment key={id}>{component}</React.Fragment>
          ))}
        </PortalContext.Provider>
      </ThemeProvider>
    );
  }
}

export default new ShadowDOM();
