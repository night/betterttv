import {create} from 'zustand';
import useAuthStore from './auth';

// The username effect, hover effect and font picks still saving, by user field, so a pick shows
// across every setting and preview at once instead of when its save lands.
const useUsernameLooksStore = create(() => ({}));

export function setUsernameLook(field, value) {
  useUsernameLooksStore.setState({[field]: value});
}

// the field's pick while it saves, otherwise what the account holds
export function useUsernameLook(field) {
  const saved = useAuthStore((state) => state.user?.[field] ?? null);
  return useUsernameLooksStore((state) => (state[field] !== undefined ? state[field] : saved));
}

// What a hovered card tries in the Username page's chat preview, by field; undefined is no try.
const useTriedLooksStore = create(() => ({}));

export function setTriedLook(field, value) {
  useTriedLooksStore.setState({[field]: value});
}

export function clearTriedLooks() {
  useTriedLooksStore.setState({}, true);
}

export function useTriedLook(field) {
  return useTriedLooksStore((state) => state[field]);
}

// the hovered card's try, otherwise the field's look
export function usePreviewLook(field) {
  const look = useUsernameLook(field);
  const tried = useTriedLook(field);
  return tried !== undefined ? tried : look;
}
