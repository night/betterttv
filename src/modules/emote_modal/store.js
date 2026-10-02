import {create} from 'zustand';
import {addPersonalEmote, addSharedEmote, getEmoteAvailability} from '@/actions/emotes';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import {AsyncStatuses, EmoteAddDestinations, EmoteAvailabilityRestrictionTypes} from '@/constants';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';

const IDLE_ADD_STATUSES = {
  [EmoteAddDestinations.CHANNEL]: AsyncStatuses.IDLE,
  [EmoteAddDestinations.PERSONAL]: AsyncStatuses.IDLE,
};

// a failed load settles as this sentinel and refetches on the next open. unknown availability
// leaves the add buttons enabled, the api stays the enforcer.
export const UNKNOWN_AVAILABILITY = {};

const useEmoteModalStore = create(() => ({
  // availabilityKey -> {channel: {canAdd, restriction}, personal: {canAdd, restriction}}
  availability: {},
  // add destination -> AsyncStatuses value
  addStatuses: {...IDLE_ADD_STATUSES},
}));

// in-flight requests, keyed like the cache, so concurrent callers share one request
const pendingAvailability = new Map();

// availability entries are per account, so a sign-in switch can't serve another user's state
export function availabilityKey(userId, emoteId) {
  return `${userId}:${emoteId}`;
}

// the api answers per destination with {canAdd, restriction}, keyed by emote set id (the user's
// id for their channel) plus "personal"
export function fetchAvailability(emoteId, userId) {
  const key = availabilityKey(userId, emoteId);
  const cached = useEmoteModalStore.getState().availability[key];
  if (cached != null && cached !== UNKNOWN_AVAILABILITY) {
    return Promise.resolve(cached);
  }

  let pending = pendingAvailability.get(key);
  if (pending == null) {
    pending = loadAvailability(emoteId, userId, key);
    pendingAvailability.set(key, pending);
  }
  return pending;
}

async function loadAvailability(emoteId, userId, key) {
  let result = UNKNOWN_AVAILABILITY;
  try {
    const destinations = await getEmoteAvailability(emoteId);
    result = {
      [EmoteAddDestinations.CHANNEL]: destinations[userId],
      [EmoteAddDestinations.PERSONAL]: destinations.personal,
    };
  } catch {
    // settles as the retryable sentinel
  } finally {
    pendingAvailability.delete(key);
  }

  useEmoteModalStore.setState((state) => {
    const current = state.availability[key];
    // adds performed while the lookup was in flight are fresher than the fetched snapshot
    const merged = current == null && result === UNKNOWN_AVAILABILITY ? UNKNOWN_AVAILABILITY : {...result, ...current};
    return {availability: {...state.availability, [key]: merged}};
  });
  return result;
}

// pending rounds up to this so fast requests still read as work. the timer runs alongside the
// request, so slower requests add no extra wait.
const MINIMUM_PENDING_DURATION = 500;
// how long the settled success/error icon stays before the button returns to idle
const SETTLED_STATUS_DURATION = 700;

// bumped on every modal open so an add still in flight from a previous open can't repaint the
// current modal's statuses
let addEpoch = 0;

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// adds an emote to a set and drives the destination's status through its whole lifecycle, with
// the sign-in and Pro gates in front
export async function performAdd(emoteId, destination) {
  const {user} = useAuthStore.getState();

  // the gates open over the still-open emote modal, and the add resumes once the user clears them
  if (user == null) {
    openSignInModal({}, () => performAdd(emoteId, destination));
    return;
  }

  if (destination === EmoteAddDestinations.PERSONAL && !isUserPro(user)) {
    openSubscriptionUpgradeModal({}, () => performAdd(emoteId, destination));
    return;
  }

  const addEmote = destination === EmoteAddDestinations.PERSONAL ? addPersonalEmote : addSharedEmote;
  const epoch = addEpoch;

  function setStatus(status) {
    if (epoch !== addEpoch) {
      return;
    }

    useEmoteModalStore.setState((state) => ({
      addStatuses: {...state.addStatuses, [destination]: status},
    }));
  }

  setStatus(AsyncStatuses.PENDING);
  const minimumPending = wait(MINIMUM_PENDING_DURATION);
  try {
    await addEmote(emoteId, user.id);
    await minimumPending;
    const key = availabilityKey(user.id, emoteId);
    // the add consumed a slot, so every other emote's cached canAdd may now be stale. keep only
    // this emote's entry, marking the added destination, and let the rest refetch on next open
    useEmoteModalStore.setState((state) => ({
      availability: {
        [key]: {
          ...state.availability[key],
          [destination]: {canAdd: false, restriction: EmoteAvailabilityRestrictionTypes.ALREADY_ADDED},
        },
      },
    }));
    setStatus(AsyncStatuses.SUCCESS);
  } catch {
    await minimumPending;
    setStatus(AsyncStatuses.ERROR);
  }

  await wait(SETTLED_STATUS_DURATION);
  setStatus(AsyncStatuses.IDLE);
}

// statuses outlive the modal, so every open resets them and supersedes in-flight adds
export function resetAdd() {
  addEpoch += 1;
  useEmoteModalStore.setState({addStatuses: {...IDLE_ADD_STATUSES}});
}

export default useEmoteModalStore;
