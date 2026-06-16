import React from 'react';
import {ShadowDOMComponentIds} from '@/constants';
import shadowDOM from '@/modules/shadow_dom/index';
import TooltipController, {TOOLTIP_MARKER_ATTRIBUTE} from './TooltipController';

export function bindTooltip(element, {content, className = null, alignment = 'center'}) {
  element.__bttvTooltip = {content, className, alignment};

  let tooltipKey = element.getAttribute(TOOLTIP_MARKER_ATTRIBUTE);

  if (tooltipKey == null || tooltipKey.length === 0) {
    tooltipKey = crypto.randomUUID();
    element.setAttribute(TOOLTIP_MARKER_ATTRIBUTE, tooltipKey);
  }

  if (!shadowDOM.isMounted(ShadowDOMComponentIds.TOOLTIP_CONTROLLER)) {
    shadowDOM.mount(ShadowDOMComponentIds.TOOLTIP_CONTROLLER, <TooltipController />);
  }
}
