import React from 'react';
import {ShadowDOMComponentIds} from '../../constants.js';
import shadowDOM from '../shadow_dom/index.js';
import TooltipController, {TOOLTIP_TARGET_ATTRIBUTE} from './TooltipController.jsx';

const TOOLTIP_EXPIRY = 5 * 60 * 1000;

const tooltipMap = new Map();

function getTooltipById(id) {
  return tooltipMap.get(id);
}

function pruneTooltipMap() {
  if (tooltipMap.size === 0) {
    return disposeTooltipController();
  }

  const activeTooltipIds = new Set();
  const tooltipElements = document.querySelectorAll(`[${TOOLTIP_TARGET_ATTRIBUTE}]`);

  for (const element of tooltipElements) {
    activeTooltipIds.add(element.getAttribute(TOOLTIP_TARGET_ATTRIBUTE));
  }

  if (activeTooltipIds.size === 0) {
    return disposeTooltipController();
  }

  for (const [tooltipId] of tooltipMap.entries()) {
    if (activeTooltipIds.has(tooltipId)) {
      continue;
    }

    tooltipMap.delete(tooltipId);
  }

  if (tooltipMap.size === 0) {
    return disposeTooltipController();
  }
}

let intervalId = null;

function ensureTooltipController() {
  if (intervalId != null) {
    intervalId = setInterval(() => {
      window.requestIdleCallback(pruneTooltipMap);
    }, TOOLTIP_EXPIRY);
  }

  if (!shadowDOM.isMounted(ShadowDOMComponentIds.TOOLTIP_CONTROLLER)) {
    shadowDOM.mount(ShadowDOMComponentIds.TOOLTIP_CONTROLLER, <TooltipController getTooltipById={getTooltipById} />);
  }
}

function disposeTooltipController() {
  clearInterval(intervalId);
  shadowDOM.unmount(ShadowDOMComponentIds.TOOLTIP_CONTROLLER);
  intervalId = null;
}

export function bindTooltip(element, {elementId, content, className = null, alignment = 'center'}) {
  const id = elementId ?? crypto.randomUUID();

  if (!tooltipMap.has(id)) {
    tooltipMap.set(id, {content, className, alignment});
  }

  if (!element.hasAttribute(TOOLTIP_TARGET_ATTRIBUTE)) {
    element.setAttribute(TOOLTIP_TARGET_ATTRIBUTE, id);
  }

  ensureTooltipController();
}
