import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {Button, Popover, Tooltip} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import React, {useCallback} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import StatusButton from '@/common/components/StatusButton';
import usePortalRef from '@/common/hooks/PortalRef';
import {AsyncStatuses, EmoteAddDestinations, EmoteAvailabilityRestrictionTypes, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import channelEmotes from '@/modules/emotes/channel-emotes';
import personalEmotes from '@/modules/emotes/personal-emotes';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import {getCurrentUser} from '@/utils/user';
import styles from './EmoteModal.module.css';
import useEmoteModalStore, {availabilityKey, performAdd, UNKNOWN_AVAILABILITY} from './store';
import {addedToLabel, addToLabel, canAddEmote} from './utils';

// why a still-loaded emote can't be added to a destination, for the reasons the api reports
function restrictionTooltip(restriction) {
  switch (restriction) {
    case EmoteAvailabilityRestrictionTypes.SHARING_DISABLED:
      return formatMessage({defaultMessage: 'Sharing is disabled for this emote'});
    case EmoteAvailabilityRestrictionTypes.NOT_LIVE:
      return formatMessage({defaultMessage: 'This emote is not public on BetterTTV'});
    case EmoteAvailabilityRestrictionTypes.NOT_APPROVED:
      return formatMessage({defaultMessage: 'This emote is not approved for personal use'});
    case EmoteAvailabilityRestrictionTypes.NO_SLOTS:
      return formatMessage({defaultMessage: 'You have no free emote slots'});
    default:
      return undefined;
  }
}

function DisabledAddButtons() {
  return (
    <div className={styles.addButtonGroup}>
      <Button.Group>
        <Button variant="elevated" color="contrast" size="lg" disabled>
          {addToLabel(EmoteAddDestinations.CHANNEL)}
        </Button>
        <Button
          variant="elevated"
          color="contrast"
          size="lg"
          className={styles.menuChevron}
          disabled
          aria-label={formatMessage({defaultMessage: 'More add options'})}>
          <Icon icon={faChevronDown} />
        </Button>
      </Button.Group>
    </div>
  );
}

export default function EmoteAddButtons({emote}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const portalRef = usePortalRef();
  const addStatuses = useEmoteModalStore((state) => state.addStatuses);

  const [menuOpened, {close: closeMenu, toggle: toggleMenu}] = useDisclosure(false);
  const {refs, context} = useFloating({open: menuOpened, onOpenChange: closeMenu});
  // outside-press detection has to walk the composed path because we render inside a shadow DOM
  const dismiss = useDismiss(context, {
    outsidePress: (event) => {
      const path = event.composedPath();
      return !path.includes(refs.floating.current) && !path.includes(refs.reference.current);
    },
  });
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);

  const isBetterTTVEmote = emote.category?.provider === EmoteProviders.BETTERTTV;
  const addable = canAddEmote(emote);
  const userId = currentUser?.id ?? null;
  const availabilityEligible = addable && userId != null;
  const availability = useEmoteModalStore((state) =>
    availabilityEligible ? (state.availability[availabilityKey(userId, emote.id)] ?? null) : UNKNOWN_AVAILABILITY
  );
  // local signals that need no api round-trip and keep working when it's unreachable: your own
  // channel's emotes are already loaded, and your personal emotes arrive over the socket
  const currentChannel = getCurrentChannel();
  const platformUser = getCurrentUser();
  const isOwnChannel = currentUser != null && platformUser != null && currentChannel?.id === platformUser.id;
  const locallyInChannel = isBetterTTVEmote && isOwnChannel && channelEmotes.getEligibleEmoteById(emote.id) != null;
  const locallyInPersonal =
    isBetterTTVEmote &&
    currentUser != null &&
    personalEmotes.getEmotes(platformUser).some((personalEmote) => personalEmote.id === emote.id);

  const buttonStateFor = (target) => {
    const entry = availability?.[target] ?? null;
    const locallyAdded = target === EmoteAddDestinations.CHANNEL ? locallyInChannel : locallyInPersonal;
    // an own emote counts as added to its channel: it renders there inherently and can't be added
    const added =
      entry?.restriction === EmoteAvailabilityRestrictionTypes.ALREADY_ADDED ||
      (target === EmoteAddDestinations.CHANNEL && entry?.restriction === EmoteAvailabilityRestrictionTypes.OWN_EMOTE) ||
      locallyAdded;
    // hold pending while availability is in flight, unless a local signal already answered, so
    // the button doesn't flash enabled then flip
    const pending = addStatuses[target] === AsyncStatuses.IDLE && availability == null && !added;

    return {
      label: added ? addedToLabel(target) : addToLabel(target),
      status: pending ? AsyncStatuses.PENDING : addStatuses[target],
      disabled: added || entry?.canAdd === false,
      // an added destination speaks for itself; the rest explain why they can't be added
      tooltip: added ? undefined : restrictionTooltip(entry?.restriction),
    };
  };

  const channel = buttonStateFor(EmoteAddDestinations.CHANNEL);
  const personal = buttonStateFor(EmoteAddDestinations.PERSONAL);

  const handleAddChannel = useCallback(() => performAdd(emote.id, EmoteAddDestinations.CHANNEL), [emote.id]);
  const handleAddPersonal = useCallback(() => performAdd(emote.id, EmoteAddDestinations.PERSONAL), [emote.id]);
  const handleMenuChange = useCallback(
    (isOpen) => {
      if (!isOpen) {
        closeMenu();
      }
    },
    [closeMenu]
  );

  if (!addable) {
    return <DisabledAddButtons />;
  }

  return (
    <Popover
      radius="lg"
      shadow="lg"
      opened={menuOpened}
      onChange={handleMenuChange}
      position="bottom-start"
      width="target"
      closeOnClickOutside={false}
      portalProps={{target: portalRef?.current}}>
      <Popover.Target ref={refs.reference} {...getReferenceProps()}>
        <div className={styles.addButtonGroup}>
          <Button.Group>
            <Tooltip
              label={channel.tooltip}
              disabled={channel.tooltip == null}
              withArrow
              portalProps={{target: portalRef?.current}}>
              <StatusButton
                variant="elevated"
                color="contrast"
                size="lg"
                status={channel.status}
                disabled={channel.disabled}
                onClick={handleAddChannel}>
                {channel.label}
              </StatusButton>
            </Tooltip>
            <Button
              variant="elevated"
              color="contrast"
              size="lg"
              className={styles.menuChevron}
              onClick={toggleMenu}
              aria-label={formatMessage({defaultMessage: 'More add options'})}>
              <Icon icon={faChevronDown} />
            </Button>
          </Button.Group>
        </div>
      </Popover.Target>
      <Popover.Dropdown ref={refs.floating} {...getFloatingProps()} className={styles.menuDropdown}>
        <Tooltip
          label={personal.tooltip}
          disabled={personal.tooltip == null}
          withArrow
          portalProps={{target: portalRef?.current}}>
          <StatusButton
            variant="subtle"
            size="lg"
            fullWidth
            justify="start"
            className={styles.menuItemButton}
            status={personal.status}
            disabled={personal.disabled}
            onClick={handleAddPersonal}>
            {personal.label}
          </StatusButton>
        </Tooltip>
      </Popover.Dropdown>
    </Popover>
  );
}
