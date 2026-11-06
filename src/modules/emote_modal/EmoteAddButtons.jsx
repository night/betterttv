import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {Button, Popover, Text, Tooltip} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {Check, ChevronDown} from 'lucide-react';
import React, {useCallback} from 'react';
import {useShallow} from 'zustand/react/shallow';
import StatusButton from '@/common/components/StatusButton';
import usePortalRef from '@/common/hooks/PortalRef';
import {
  AsyncStatuses,
  EmoteAddDestinations,
  EmoteAvailabilityRestrictionTypes,
  EmoteCategories,
  EmoteProviders,
} from '@/constants';
import formatMessage from '@/i18n/index';
import channelEmotes from '@/modules/emotes/channel-emotes';
import personalEmotes from '@/modules/emotes/personal-emotes';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import isPressOn from '@/utils/press';
import {getCurrentUser} from '@/utils/user';
import styles from './EmoteModal.module.css';
import useEmoteModalStore, {availabilityKey, performAdd, UNKNOWN_AVAILABILITY} from './store';
import {canAddEmote} from './utils';

// the menu is an inverted surface, so its rows take the inverse tokens
const inverseItemVars = () => ({
  root: {
    '--button-color': 'var(--mantine-color-text-inverse)',
    '--button-hover-color': 'var(--mantine-color-text-inverse)',
    '--button-hover': 'color-mix(in srgb, var(--mantine-color-text-inverse) 10%, transparent)',
  },
});

const NO_EMOTE_SETS = [];

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
          {formatMessage({defaultMessage: 'Add to Channel'})}
        </Button>
        <Button
          variant="elevated"
          color="contrast"
          size="lg"
          className={styles.menuChevron}
          disabled
          aria-label={formatMessage({defaultMessage: 'More add options'})}>
          <ChevronDown size={16} />
        </Button>
      </Button.Group>
    </div>
  );
}

// a destination in the menu, ticked once the emote is in it
function AddMenuRow({label, state, onClick}) {
  const portalRef = usePortalRef();

  return (
    <Tooltip
      label={state.tooltip}
      disabled={state.tooltip == null}
      withArrow
      portalProps={{target: portalRef?.current}}>
      <StatusButton
        variant="subtle"
        size="lg"
        fullWidth
        justify="space-between"
        vars={inverseItemVars}
        className={styles.menuItemButton}
        rightSection={state.added ? <Check size={16} /> : null}
        status={state.status}
        disabled={state.disabled}
        onClick={onClick}>
        <span className={styles.menuItemName}>{label}</span>
      </StatusButton>
    </Tooltip>
  );
}

function EmoteSetRow({emoteId, emoteSet, state}) {
  const handleAdd = useCallback(() => performAdd(emoteId, emoteSet.id), [emoteId, emoteSet.id]);

  return (
    <AddMenuRow
      label={emoteSet.name ?? formatMessage({defaultMessage: 'Unnamed set'})}
      state={state}
      onClick={handleAdd}
    />
  );
}

export default function EmoteAddButtons({emote}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const portalRef = usePortalRef();
  const addStatuses = useEmoteModalStore((state) => state.addStatuses);
  const emoteSets = useEmoteModalStore((state) => state.emoteSets[currentUser?.id] ?? NO_EMOTE_SETS);

  const [menuOpened, {close: closeMenu, toggle: toggleMenu}] = useDisclosure(false);
  const {refs, context} = useFloating({open: menuOpened, onOpenChange: closeMenu});
  // the press is seen on the document, where the closed shadow root hides its path, so it's placed by
  // position; otherwise the chevron's press would close the menu and its click reopen it
  const dismiss = useDismiss(context, {
    outsidePress: (event) => !isPressOn(refs.floating.current, event) && !isPressOn(refs.reference.current, event),
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
    const locallyAdded =
      (target === EmoteAddDestinations.CHANNEL && locallyInChannel) ||
      (target === EmoteAddDestinations.PERSONAL && locallyInPersonal);
    // an own emote counts as added to its channel: it renders there inherently and can't be added
    const added =
      entry?.restriction === EmoteAvailabilityRestrictionTypes.ALREADY_ADDED ||
      (target === EmoteAddDestinations.CHANNEL && entry?.restriction === EmoteAvailabilityRestrictionTypes.OWN_EMOTE) ||
      locallyAdded;
    // hold pending while availability is in flight, unless a local signal already answered, so
    // the button doesn't flash enabled then flip
    const addStatus = addStatuses[target] ?? AsyncStatuses.IDLE;
    const pending = addStatus === AsyncStatuses.IDLE && availability == null && !added;

    return {
      added,
      status: pending ? AsyncStatuses.PENDING : addStatus,
      disabled: added || entry?.canAdd === false,
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

  if (emote.category?.id === EmoteCategories.BETTERTTV_GLOBAL) {
    return (
      <Text size="md" className={styles.globalNote}>
        {formatMessage({defaultMessage: 'Available in all chats using BetterTTV'})}
      </Text>
    );
  }

  if (!addable) {
    return <DisabledAddButtons />;
  }

  const channelTooltip = channel.added ? formatMessage({defaultMessage: 'Already added'}) : channel.tooltip;
  const channelRestriction = availability?.[EmoteAddDestinations.CHANNEL]?.restriction;

  if (channelRestriction === EmoteAvailabilityRestrictionTypes.SHARING_DISABLED) {
    return (
      <Button size="lg" disabled>
        {formatMessage({defaultMessage: 'Sharing Disabled'})}
      </Button>
    );
  }

  // the api won't add an uploader's emote to their own channel, so on theirs the control is the menu
  // alone
  const isUploader = channelRestriction === EmoteAvailabilityRestrictionTypes.OWN_EMOTE;
  const menuLabel = formatMessage({defaultMessage: 'Add to…'});

  return (
    <Popover
      radius="lg"
      shadow="lg"
      opened={menuOpened}
      onChange={handleMenuChange}
      position="bottom-end"
      width="target"
      closeOnClickOutside={false}
      portalProps={{target: portalRef?.current}}>
      <Popover.Target ref={refs.reference} {...getReferenceProps()}>
        <div className={styles.addButtonGroup}>
          {isUploader ? (
            <Button
              variant="elevated"
              color="contrast"
              size="lg"
              rightSection={<ChevronDown size={16} />}
              onClick={toggleMenu}>
              {menuLabel}
            </Button>
          ) : (
            <Button.Group>
              <Tooltip
                label={channelTooltip}
                disabled={channelTooltip == null}
                withArrow
                portalProps={{target: portalRef?.current}}>
                <StatusButton
                  variant="elevated"
                  color="contrast"
                  size="lg"
                  status={channel.status}
                  disabled={channel.disabled}
                  onClick={handleAddChannel}>
                  {formatMessage({defaultMessage: 'Add to Channel'})}
                </StatusButton>
              </Tooltip>
              <Button
                variant="elevated"
                color="contrast"
                size="lg"
                className={styles.menuChevron}
                onClick={toggleMenu}
                aria-label={formatMessage({defaultMessage: 'More add options'})}>
                <ChevronDown size={16} />
              </Button>
            </Button.Group>
          )}
        </div>
      </Popover.Target>
      <Popover.Dropdown ref={refs.floating} {...getFloatingProps()} className={styles.menuDropdown}>
        {!isUploader ? (
          <React.Fragment>
            <div className={styles.menuTitle}>{menuLabel}</div>
            <div className={styles.menuDivider} role="separator" />
          </React.Fragment>
        ) : null}
        <AddMenuRow label={formatMessage({defaultMessage: 'Personal'})} state={personal} onClick={handleAddPersonal} />
        {emoteSets.length > 0 ? <div className={styles.menuDivider} role="separator" /> : null}
        {emoteSets.map((emoteSet) => (
          <EmoteSetRow key={emoteSet.id} emoteId={emote.id} emoteSet={emoteSet} state={buttonStateFor(emoteSet.id)} />
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}
