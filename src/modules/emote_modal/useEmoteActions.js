import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect} from 'react';
import {addPersonalEmote, addSharedEmote, removePersonalEmote, removeSharedEmote} from '@/actions/emotes';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import {EmoteAddDestinations} from '@/constants';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';

// Closes the modal a short while after an add/remove settles, leaving the success/error icon on the
// button long enough to read first. This delay is a deliberate pause (not a transition) — it mirrors
// openConfirmModal's success timeout.
export function useCloseAfterAction(mutation, onClose) {
  const settled = mutation.isSuccess || mutation.isError;
  useEffect(() => {
    if (!settled) {
      return undefined;
    }
    const timer = setTimeout(() => onClose(), 1000);
    return () => clearTimeout(timer);
  }, [settled, onClose]);
}

// Encapsulates adding and removing an emote for a channel or personal set, including the sign-in gate
// and the Pro gate (only adding a personal emote needs Pro). Returns the destination's mutation so
// callers can drive button state. On success it updates the destination's availability cache so the
// modal can flip between Add and Remove without a refetch.
export default function useEmoteActions() {
  const queryClient = useQueryClient();

  const channel = useMutation({
    mutationFn: ({emoteId, userId, remove}) =>
      remove ? removeSharedEmote(emoteId, userId) : addSharedEmote(emoteId, userId),
    onSuccess: (_data, {emoteId, userId, remove}) =>
      queryClient.setQueryData(['emote-available', EmoteAddDestinations.CHANNEL, emoteId, userId ?? null], !remove),
  });

  const personal = useMutation({
    mutationFn: ({emoteId, userId, remove}) =>
      remove ? removePersonalEmote(emoteId, userId) : addPersonalEmote(emoteId, userId),
    onSuccess: (_data, {emoteId, userId, remove}) =>
      queryClient.setQueryData(['emote-available', EmoteAddDestinations.PERSONAL, emoteId, userId ?? null], !remove),
  });

  // returns the live mutation (so callers see its pending/success state), so it isn't memoized
  const mutationFor = (destination) => (destination === EmoteAddDestinations.PERSONAL ? personal : channel);

  const act = useCallback(
    (emoteId, destination, isAdd, onClose) => {
      const {user} = useAuthStore.getState();
      const isPersonal = destination === EmoteAddDestinations.PERSONAL;

      // not signed in — close the emote modal, then prompt to sign in (once its close transition
      // finishes, so the modals don't stack/overlap)
      if (user == null) {
        onClose(openSignInModal);
        return;
      }

      // personal emotes are a Pro feature — close the emote modal, then prompt to upgrade. Removing
      // an emote you already have doesn't require Pro, only adding one does.
      if (isAdd && isPersonal && !isUserPro(user)) {
        onClose(openSubscriptionUpgradeModal);
        return;
      }

      const mutate = isPersonal ? personal.mutate : channel.mutate;
      mutate({emoteId, userId: user.id, remove: !isAdd});
    },
    [channel.mutate, personal.mutate]
  );

  const reset = useCallback(() => {
    channel.reset();
    personal.reset();
  }, [channel.reset, personal.reset]);

  return {act, mutationFor, reset};
}
