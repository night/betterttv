import domObserver from '../../observers/dom.js';

const BTTV_GLOBAL_MIXIN = '__BTTV_GLOBAL_MIXIN__';
const SEVEN_TV_ROOT_ID = 'seventv-root';

class SevenTV {
  constructor() {
    domObserver.on(`#${SEVEN_TV_ROOT_ID}`, (_, isConnected) => {
      if (!isConnected) {
        return;
      }
      this.applyGlobalMixin();
    });
  }

  getSeventvVueApp() {
    const root = document.getElementById(SEVEN_TV_ROOT_ID);
    if (root == null) {
      return null;
    }
    return root.__vue_app__;
  }

  applyGlobalMixin() {
    const vueApp = this.getSeventvVueApp();
    if (vueApp == null) {
      return;
    }
    const mixins = vueApp?._context?.mixins;
    if (mixins == null || !Array.isArray(mixins)) {
      return;
    }
    const globalMixin = mixins.find((mixin) => mixin?.__name === BTTV_GLOBAL_MIXIN);
    if (globalMixin != null) {
      return;
    }
    vueApp.mixin({
      __name: BTTV_GLOBAL_MIXIN,
      mounted() {
        this.$el.__bttv_seventv_instance = this;
      },
      beforeUnmount() {
        if (this.$el.__bttv_seventv_instance !== this) {
          return;
        }
        delete this.$el.__bttv_seventv_instance;
      },
    });
  }

  getElementInstance(element) {
    const instance = element?.__bttv_seventv_instance?.$;
    if (instance == null) {
      return null;
    }
    return instance;
  }
}

export default new SevenTV();
