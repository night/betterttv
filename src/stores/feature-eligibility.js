import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {getFeatureEligibility} from '@/actions/account';
import useAuthStore from './auth';

// the shipped key is kept so old storage isn't left behind
const STORAGE_ID = 'bttvPrivate_usernameEffectEligibility';

const useFeatureEligibilityStore = create(
  persist(
    () => ({
      userId: null,
      eligibility: null,
    }),
    {
      name: STORAGE_ID,
      // v1 changed the shape; older payloads are dropped and refetched
      version: 1,
      migrate: () => ({userId: null, eligibility: null}),
    }
  )
);

// badge eligibility used to persist in its own store before it was read from this one
try {
  window.localStorage.removeItem('bttvPrivate_subscriptionBadgeEligibility');
} catch (_) {}

let lastFetch = null;

function clearEligibility() {
  lastFetch = null;
  useFeatureEligibilityStore.setState({userId: null, eligibility: null});
}

async function fetchEligibilityForUser(currentFetch, userId) {
  let eligibility;
  try {
    eligibility = await getFeatureEligibility();
  } catch (_) {
    if (lastFetch === currentFetch) {
      lastFetch = null;
    }
    return;
  }

  if (lastFetch !== currentFetch) {
    return;
  }

  useFeatureEligibilityStore.setState({userId, eligibility});
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

export default useFeatureEligibilityStore;
