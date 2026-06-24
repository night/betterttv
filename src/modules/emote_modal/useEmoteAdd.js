import {useMutation} from '@tanstack/react-query';
import {useCallback, useEffect} from 'react';
import {addPersonalEmote, addSharedEmote} from '@/actions/emotes';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import {EmoteAddDestinations} from '@/constants';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';

// Closes the modal a short while after an add settles, leaving the success/error icon on the button
// long enough to read first. This delay is a deliberate pause (not a transition) — it mirrors
// openConfirmModal's success timeout.
export function useCloseAfterAdd(addMutation, onClose) {
  const settled = addMutation.isSuccess || addMutation.isError;
  useEffect(() => {
    if (!settled) {
      return undefined;
    }
    const timer = setTimeout(() => onClose(), 1000);
    return () => clearTimeout(timer);
  }, [settled, onClose]);
}

// Encapsulates adding an emote to a channel or personal set, including the sign-in gate and the
// Pro gate for personal emotes. Returns the destination's mutation so callers can drive button state.
export default function useEmoteAdd() {
  const addChannel = useMutation({
    mutationFn: ({emoteId, userId}) => addSharedEmote(emoteId, userId),
  });

  const addPersonal = useMutation({
    mutationFn: ({emoteId, userId}) => addPersonalEmote(emoteId, userId),
  });

  // returns the live mutation (so callers see its pending/success state), so it isn't memoized
  const mutationFor = (destination) => (destination === EmoteAddDestinations.PERSONAL ? addPersonal : addChannel);

  const add = useCallback(
    (emoteId, destination, onClose) => {
      const {user} = useAuthStore.getState();
      const isPersonal = destination === EmoteAddDestinations.PERSONAL;

      // not signed in — close the emote modal, then prompt to sign in (once its close transition
      // finishes, so the modals don't stack/overlap)
      if (user == null) {
        onClose(openSignInModal);
        return;
      }

      // personal emotes are a Pro feature — close the emote modal, then prompt to upgrade
      if (isPersonal && !isUserPro(user)) {
        onClose(openSubscriptionUpgradeModal);
        return;
      }

      const mutate = isPersonal ? addPersonal.mutate : addChannel.mutate;
      mutate({emoteId, userId: user.id});
    },
    [addChannel.mutate, addPersonal.mutate]
  );

  const reset = useCallback(() => {
    addChannel.reset();
    addPersonal.reset();
  }, [addChannel.reset, addPersonal.reset]);

  return {add, mutationFor, reset};
}
