import React from 'react';
import {ShadowDOMComponentIds} from '@/constants';
import shadowDOM from '@/modules/shadow_dom/index';
import {closeTooltip, openTooltip} from './store';
import TooltipController from './TooltipController';

function handleMouseEnter(event) {
  const config = event.currentTarget.__bttvTooltip;
  if (config?.content == null) {
    return;
  }
  openTooltip(event.currentTarget, config);
}

function handleMouseLeave(event) {
  closeTooltip(event.currentTarget);
}

export function bindTooltip(element, {content, className = null, alignment = 'center'}) {
  element.__bttvTooltip = {content, className, alignment};

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  if (!shadowDOM.isMounted(ShadowDOMComponentIds.TOOLTIP_CONTROLLER)) {
    shadowDOM.mount(ShadowDOMComponentIds.TOOLTIP_CONTROLLER, <TooltipController />);
  }
}
