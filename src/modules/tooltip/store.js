import {create} from 'zustand';

const CLOSED = {
  open: false,
  content: null,
  className: null,
  alignment: 'center',
  referenceElement: null,
};

const useTooltipStore = create((set, get) => ({
  ...CLOSED,
  show(element, config) {
    set({
      open: true,
      content: config.content,
      className: config.className ?? null,
      alignment: config.alignment ?? 'center',
      referenceElement: element,
    });
  },
  hide(element) {
    if (get().referenceElement !== element) {
      return;
    }
    set(CLOSED);
  },
  reset() {
    set(CLOSED);
  },
}));

export function openTooltip(element, config) {
  useTooltipStore.getState().show(element, config);
}

export function closeTooltip(element) {
  useTooltipStore.getState().hide(element);
}

export function resetTooltip() {
  useTooltipStore.getState().reset();
}

export default useTooltipStore;
