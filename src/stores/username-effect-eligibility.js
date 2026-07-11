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
let inFlight = null;

function clearEligibility() {
  lastFetch = null;
  useUsernameEffectEligibilityStore.setState({userId: null, eligibility: null});
}

async function requestEligibility(userId, currentFetch) {
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

  // single-flight: a forced refetch (e.g. the selection gate after a free -> paid upgrade)
  // coalesces onto the subscription's in-flight fetch rather than racing a second request
  // whose failure could discard the first one's successful result
  if (inFlight != null && inFlight.userId === user.id) {
    return inFlight.promise;
  }

  if (!force && lastFetch != null && lastFetch.userId === user.id) {
    return Promise.resolve();
  }

  const currentFetch = {userId: user.id};
  lastFetch = currentFetch;

  const record = {userId: user.id, promise: requestEligibility(user.id, currentFetch)};
  inFlight = record;
  record.promise.finally(() => {
    if (inFlight === record) {
      inFlight = null;
    }
  });

  return record.promise;
}

// persisted eligibility may belong to a previous session's account; only expose it for the current user
export function getEligibility() {
  const {user} = useAuthStore.getState();
  const {userId, eligibility} = useUsernameEffectEligibilityStore.getState();

  if (user == null || userId !== user.id) {
    return null;
  }

  return eligibility;
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
