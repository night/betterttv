import React from 'react';
import {ShadowDOMComponentIds} from '@/constants';
import shadowDOM from '@/modules/shadow_dom/index';
import TooltipController, {openTooltip, closeTooltip} from './TooltipController';

// Module-level constants: no per-element closure, and addEventListener dedups by reference so
// re-binding the same element on re-render can't stack listeners. Listeners live on the element
// itself, so they're garbage-collected with it when the node scrolls out — no manual cleanup.
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
