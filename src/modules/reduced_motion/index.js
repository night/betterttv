import effects from '@/common/styles/UsernameEffects.module.css';
import {onReducedMotionChange, shouldReduceMotion} from '@/common/utils/reduced-motion';

class ReducedMotionModule {
  constructor() {
    onReducedMotionChange(() => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(effects.reducedMotion, shouldReduceMotion());
  }
}

export default new ReducedMotionModule();
