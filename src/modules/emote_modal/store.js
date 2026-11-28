import {create} from 'zustand';
import {
  addPersonalEmote,
  addSharedEmote,
  getEmoteAvailability,
  getEmoteSets,
  removeSharedEmote,
} from '@/actions/emotes';
import {getUser} from '@/actions/users';
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
  // availabilityKey -> add destination (an emote set's id for a set) -> {canAdd, restriction}
  availability: {},
  // add destination (an emote set's id for a set) -> AsyncStatuses value
  addStatuses: {...IDLE_ADD_STATUSES},
  // user id -> the user's emote sets besides their channel's own, absent while the first read runs
  emoteSets: {},
  // user id -> the id of the set live in their chat, null for their channel's own emotes, absent while it loads
  liveSetIds: {},
  // add destination -> true while a failed remove says so
  removeErrors: {},
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
    result = {...destinations, [EmoteAddDestinations.CHANNEL]: destinations[userId]};
  } catch {
    // settles as the retryable sentinel
  } finally {
    pendingAvailability.delete(key);
  }

  useEmoteModalStore.setState((state) => {
    const current = state.availability[key] === UNKNOWN_AVAILABILITY ? null : state.availability[key];
    // adds performed while the lookup was in flight are fresher than the fetched snapshot
    const merged = current == null && result === UNKNOWN_AVAILABILITY ? UNKNOWN_AVAILABILITY : {...result, ...current};
    return {availability: {...state.availability, [key]: merged}};
  });
  return result;
}

// sets can change on the website between opens, so each open reads them again
export async function fetchEmoteSets(userId) {
  try {
    const emoteSets = await getEmoteSets(userId);
    useEmoteModalStore.setState((state) => ({emoteSets: {...state.emoteSets, [userId]: emoteSets}}));
  } catch {
    // keeps what's known, the menu just offers fewer destinations
    useEmoteModalStore.setState((state) => ({emoteSets: {[userId]: [], ...state.emoteSets}}));
  }
}

// the primary set can change on the website too; one that can't be read leaves Channel up front
export async function fetchLiveSet(userId) {
  let liveSetId = null;
  try {
    const {primaryEmoteSetId} = await getUser(userId);
    liveSetId = primaryEmoteSetId == null || primaryEmoteSetId === userId ? null : primaryEmoteSetId;
  } catch {
    // Channel up front
  }
  useEmoteModalStore.setState((state) => ({liveSetIds: {...state.liveSetIds, [userId]: liveSetId}}));
}

function addToDestination(emoteId, userId, destination) {
  if (destination === EmoteAddDestinations.PERSONAL) {
    return addPersonalEmote(emoteId, userId);
  }

  // the user's id doubles as their default channel emote set's id
  return addSharedEmote(emoteId, userId, destination === EmoteAddDestinations.CHANNEL ? userId : destination);
}

// how long a failed add shows before it can be tried again
const ERROR_STATUS_DURATION = 2500;

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

  fetchAvailability(emoteId, user.id);
  // signed in from the gate, the modal hasn't read the account's sets yet
  const {liveSetIds, emoteSets} = useEmoteModalStore.getState();
  if (!(user.id in liveSetIds)) {
    fetchLiveSet(user.id);
  }
  if (emoteSets[user.id] == null) {
    fetchEmoteSets(user.id);
  }

  if (destination === EmoteAddDestinations.PERSONAL && !isUserPro(user)) {
    openSubscriptionUpgradeModal({}, () => performAdd(emoteId, destination));
    return;
  }

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
  try {
    await addToDestination(emoteId, user.id, destination);
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
    setStatus(AsyncStatuses.IDLE);
  } catch {
    setStatus(AsyncStatuses.ERROR);
    await wait(ERROR_STATUS_DURATION);
    setStatus(AsyncStatuses.IDLE);
  }
}

function setAvailabilityEntry(key, destination, entry) {
  useEmoteModalStore.setState((state) => ({
    availability: {...state.availability, [key]: {...state.availability[key], [destination]: entry}},
  }));
}

function setRemoveError(destination, failed) {
  useEmoteModalStore.setState((state) => ({removeErrors: {...state.removeErrors, [destination]: failed}}));
}

// takes the emote out of a set (the user's id for their channel's own) at once, putting it back if the api refuses
export async function performRemove(emoteId, destination) {
  const {user} = useAuthStore.getState();
  if (user == null) {
    return;
  }

  const key = availabilityKey(user.id, emoteId);
  const previous = useEmoteModalStore.getState().availability[key]?.[destination];
  const epoch = addEpoch;
  // removed outranks what the chat still shows, until the socket catches up
  setAvailabilityEntry(key, destination, {canAdd: true, restriction: null, removed: true});
  setRemoveError(destination, false);
  try {
    await removeSharedEmote(emoteId, user.id, destination === EmoteAddDestinations.CHANNEL ? user.id : destination);
  } catch {
    setAvailabilityEntry(key, destination, previous);
    if (epoch !== addEpoch) {
      return;
    }
    setRemoveError(destination, true);
    await wait(ERROR_STATUS_DURATION);
    if (epoch === addEpoch) {
      setRemoveError(destination, false);
    }
  }
}

// statuses outlive the modal, so every open resets them and supersedes in-flight adds
export function resetAdd() {
  addEpoch += 1;
  useEmoteModalStore.setState({addStatuses: {...IDLE_ADD_STATUSES}, removeErrors: {}});
}

export default useEmoteModalStore;
