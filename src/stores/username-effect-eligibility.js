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

async function fetchEligibilityForUser(currentFetch, userId) {
  let eligibility;
  try {
    eligibility = await getUserUsernameEffectEligibility(userId);
  } catch (_) {
    if (lastFetch === currentFetch) {
      lastFetch = null;
    }
    return;
  }

  if (lastFetch !== currentFetch) {
    return;
  }

  useUsernameEffectEligibilityStore.setState({userId, eligibility});
}

export function fetchEligibility({force = false} = {}) {
  const {user} = useAuthStore.getState();

  if (user == null) {
    return Promise.resolve();
  }

  if (!force && lastFetch != null && lastFetch.userId === user.id) {
    return lastFetch.promise;
  }

  const currentFetch = {userId: user.id};
  lastFetch = currentFetch;
  currentFetch.promise = fetchEligibilityForUser(currentFetch, user.id);

  return currentFetch.promise;
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
