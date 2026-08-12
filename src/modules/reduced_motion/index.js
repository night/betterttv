import effects from '@/common/styles/UsernameEffects.module.css';
import {onReducedMotionChange, shouldReduceMotion} from '@/common/utils/reduced-motion';
import watcher from '@/watcher';

class ReducedMotionModule {
  constructor() {
    onReducedMotionChange(() => this.load());
    watcher.on('load.chat', () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(effects.reducedMotion, shouldReduceMotion());
  }
}

export default new ReducedMotionModule();
