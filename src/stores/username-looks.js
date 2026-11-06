import {create} from 'zustand';
import useAuthStore from './auth';

// The username effect, hover effect and font picks still saving, by user field, so a pick shows
// across every setting and preview at once instead of when its save lands.
const useUsernameLooksStore = create(() => ({}));

export function setUsernameLook(field, value) {
  useUsernameLooksStore.setState({[field]: value});
}

export function clearUsernameLook(field) {
  useUsernameLooksStore.setState(({[field]: _cleared, ...looks}) => looks, true);
}

// the field's pick while it saves, otherwise what the account holds
export function useUsernameLook(field) {
  const saved = useAuthStore((state) => state.user?.[field] ?? null);
  return useUsernameLooksStore((state) => (field in state ? state[field] : saved));
}
