import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {getUserUsernameEffectEligibility} from '@/actions/users';
import useAuthStore, {getCredentials} from '@/stores/auth';

const STORAGE_ID = 'bttvPrivate_usernameEffectEligibility';

const useUsernameEffectEligibilityStore = create(
  persist(
    () => ({
      eligibility: null,
    }),
    {name: STORAGE_ID}
  )
);

function eligibilityInputsEqual(a, b) {
  return a?.id === b?.id && (a?.pro ?? false) === (b?.pro ?? false);
}

let pendingSync = null;

async function syncUsernameEffectEligibility(user) {
  if (user == null) {
    // a null user with credentials is still resolving at boot, so keep the persisted
    // eligibility until the refetch lands; only a sign-out clears it
    if (getCredentials().accessToken == null) {
      useUsernameEffectEligibilityStore.setState({eligibility: null});
    }
    return;
  }

  let eligibility;
  try {
    eligibility = await getUserUsernameEffectEligibility(user.id);
  } catch {
    return;
  }

  if (!eligibilityInputsEqual(useAuthStore.getState().user, user)) {
    return;
  }

  useUsernameEffectEligibilityStore.setState({eligibility});
}

// eligibility depends on who is signed in and their pro status, so a free -> paid upgrade
// (or account switch) refetches; anything else on the user can change without a refetch.
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    pendingSync = syncUsernameEffectEligibility(user);
  },
  {
    equalityFn: eligibilityInputsEqual,
    fireImmediately: true,
  }
);

export async function waitForUsernameEffectEligibility() {
  await pendingSync;
  return useUsernameEffectEligibilityStore.getState().eligibility;
}

export default useUsernameEffectEligibilityStore;
