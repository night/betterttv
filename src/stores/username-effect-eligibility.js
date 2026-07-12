import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {getUserUsernameEffectEligibility} from '@/actions/users';
import useAuthStore from './auth';

const STORAGE_ID = 'bttvPrivate_usernameEffectEligibility';

const useUsernameEffectEligibilityStore = create(
  persist(
    () => ({
      userId: null,
      eligibility: null,
    }),
    {name: STORAGE_ID}
  )
);

let lastFetch = null;

function clearEligibility() {
  lastFetch = null;
  useUsernameEffectEligibilityStore.setState({userId: null, eligibility: null});
}

export async function fetchEligibility({force = false} = {}) {
  const {user} = useAuthStore.getState();

  if (user == null) {
    return;
  }

  if (!force && lastFetch != null && lastFetch.userId === user.id) {
    return;
  }

  const currentFetch = {userId: user.id};
  lastFetch = currentFetch;

  let eligibility;
  try {
    eligibility = await getUserUsernameEffectEligibility(user.id);
  } catch (_) {
    if (lastFetch === currentFetch) {
      lastFetch = null;
    }
    return;
  }

  if (lastFetch !== currentFetch) {
    return;
  }

  useUsernameEffectEligibilityStore.setState({userId: user.id, eligibility});
}

useAuthStore.subscribe(
  (state) => state.user,
  (user, prevUser) => {
    if (user == null) {
      clearEligibility();
      return;
    }

    // stay lazy until something has fetched (settings may never be opened)
    if (lastFetch == null) {
      return;
    }

    if (user.id === prevUser?.id && user.pro === prevUser?.pro) {
      return;
    }

    if (user.id !== prevUser?.id) {
      clearEligibility();
    }

    fetchEligibility({force: true});
  }
);

export default useUsernameEffectEligibilityStore;
