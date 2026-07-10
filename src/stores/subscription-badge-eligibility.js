import {create} from 'zustand';
import {getUserSubscriptionBadgeEligibility} from '@/actions/users';
import useAuthStore from './auth';

const useSubscriptionBadgeEligibilityStore = create(() => ({
  eligibleBadges: null,
  nextBadgeUnlocksAt: null,
}));

let lastFetch = null;

function clearEligibility() {
  lastFetch = null;
  useSubscriptionBadgeEligibilityStore.setState({eligibleBadges: null, nextBadgeUnlocksAt: null});
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
    eligibility = await getUserSubscriptionBadgeEligibility(user.id);
  } catch (_) {
    if (lastFetch === currentFetch) {
      lastFetch = null;
    }
    return;
  }

  if (lastFetch !== currentFetch) {
    return;
  }

  useSubscriptionBadgeEligibilityStore.setState({
    eligibleBadges: eligibility.eligibleBadges,
    nextBadgeUnlocksAt: eligibility.nextBadgeUnlocksAt,
  });
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

export default useSubscriptionBadgeEligibilityStore;
