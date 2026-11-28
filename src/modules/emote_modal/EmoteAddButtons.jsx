import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {Button, Menu, Popover, Skeleton, Text, Tooltip} from '@mantine/core';
import {useDisclosure, useTimeout} from '@mantine/hooks';
import classNames from 'classnames';
import {Check, ChevronDown, CircleCheck, Plus, Trash2} from 'lucide-react';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import ProBadge from '@/common/components/ProBadge';
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
import {isUserPro} from '@/utils/pro';
import {getCurrentUser} from '@/utils/user';
import styles from './EmoteModal.module.css';
import useEmoteModalStore, {availabilityKey, performAdd, performRemove, UNKNOWN_AVAILABILITY} from './store';
import {canAddEmote} from './utils';

// the menu is an inverted surface, so its rows take the inverse tokens
const inverseItemVars = () => ({
  root: {
    '--button-color': 'var(--mantine-color-text-inverse)',
    '--button-hover-color': 'var(--mantine-color-text-inverse)',
    '--button-hover': 'color-mix(in srgb, var(--mantine-color-text-inverse) 10%, transparent)',
  },
});

// the website's navbar buttons, which its add control turns into once the emote is in
const statusButtonVars = () => ({
  root: {
    '--button-bg': 'var(--mantine-color-elevated-hover)',
    '--button-hover': 'var(--mantine-color-elevated-active)',
  },
});

const NO_EMOTE_SETS = [];

// the website's spinner
const ADD_LOADER_PROPS = {type: 'oval'};

// how long the swap's transitions get to run: the check's tick is the last one drawn, by 580ms
const SWAP_ANIMATION_MS = 700;

// closes at once: a menu still fading would slide along as the button under it moves on a remove
const STATUS_MENU_TRANSITION = {exitDuration: 0};

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

function emoteSetName(emoteSet) {
  return emoteSet.name ?? formatMessage({defaultMessage: 'Unnamed set'});
}

// Escape closes the menu, so the modal it sits in doesn't close with it
function keepEscapeInMenu(event) {
  if (event.key === 'Escape') {
    event.stopPropagation();
  }
}

function renderEmphasis(chunks) {
  return (
    <span key="emphasis" className={styles.menuTitleEmphasis}>
      {chunks}
    </span>
  );
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
          <ChevronDown size={24} className={styles.chevron} />
        </Button>
      </Button.Group>
    </div>
  );
}

// a label whose width is set to its contents' as they change, so the stylesheet can ease the button around it
function AnimatedWidth({className, children}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (outer == null || inner == null) {
      return undefined;
    }
    function measure() {
      const {paddingLeft, paddingRight} = getComputedStyle(outer);
      const width = inner.offsetWidth + Number.parseFloat(paddingLeft) + Number.parseFloat(paddingRight);
      outer.style.width = `${width}px`;
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={outerRef} className={classNames(styles.animatedWidth, className)}>
      <span ref={innerRef} className={styles.animatedWidthInner}>
        {children}
      </span>
    </span>
  );
}

// spins while adding, then stays disabled. data-disabled over a native disabled keeps the tooltip's hover
function AddButton({state, tooltip, onClick, children, ...props}) {
  const portalRef = usePortalRef();

  return (
    <Tooltip label={tooltip} disabled={tooltip == null} withArrow portalProps={{target: portalRef?.current}}>
      <Button
        {...props}
        loading={state.status === AsyncStatuses.PENDING}
        loaderProps={ADD_LOADER_PROPS}
        data-disabled={state.disabled || undefined}
        aria-disabled={state.disabled || undefined}
        onClick={state.disabled || state.status !== AsyncStatuses.IDLE ? undefined : onClick}>
        {state.status === AsyncStatuses.ERROR ? formatMessage({defaultMessage: "Couldn't add"}) : children}
      </Button>
    </Tooltip>
  );
}

// a destination in the menu, ticked once the emote is in it
function AddMenuRow({label, state, onClick, rightSection = null}) {
  return (
    <AddButton
      variant="subtle"
      size="lg"
      fullWidth
      justify="space-between"
      vars={inverseItemVars}
      className={styles.menuItemButton}
      rightSection={state.added ? <Check size={16} /> : rightSection}
      state={state}
      tooltip={state.tooltip}
      onClick={onClick}>
      <span className={styles.menuItemName}>{label}</span>
    </AddButton>
  );
}

function EmoteSetRow({emoteId, emoteSet, state}) {
  const handleAdd = useCallback(() => performAdd(emoteId, emoteSet.id), [emoteId, emoteSet.id]);

  return <AddMenuRow label={emoteSetName(emoteSet)} state={state} onClick={handleAdd} />;
}

// The up-front destination: its add, then once the emote is in, a ticked button in the same place whose menu
// removes it again
function UpFrontButton({emote, destination, state, addLabel, statusLabel, onAdd}) {
  const portalRef = usePortalRef();
  const removeFailed = useEmoteModalStore((store) => store.removeErrors[destination] === true);
  const {added} = state;
  const [opened, setOpened] = useState(false);
  const {refs, context} = useFloating({open: added && opened, onOpenChange: setOpened});
  // the closed shadow root hides the press's path from the document, so it's checked by position
  const isOutsidePress = useCallback(
    (event) => !isPressOn(refs.floating.current, event) && !isPressOn(refs.reference.current, event),
    [refs]
  );
  const dismiss = useDismiss(context, {outsidePress: isOutsidePress});
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);
  const handleChange = useCallback((isOpen) => setOpened(added && isOpen), [added]);
  const actionDisabled = !added && state.disabled;
  const actionReady = !actionDisabled && state.status === AsyncStatuses.IDLE;
  // the Tooltip passes on the button's own click over Menu.Target's, so the click is all here: a status's
  // opens the menu, an add's is its own
  const handleClick = useCallback(() => {
    if (added) {
      setOpened((isOpen) => !isOpen);
    } else if (actionReady) {
      onAdd();
    }
  }, [actionReady, added, onAdd]);
  const handleRemove = useCallback(() => performRemove(emote.id, destination), [destination, emote.id]);
  const tooltip = added ? undefined : state.tooltip;

  return (
    <Menu
      opened={added && opened}
      onChange={handleChange}
      position="bottom-end"
      offset={8}
      closeOnClickOutside={false}
      transitionProps={STATUS_MENU_TRANSITION}
      portalProps={{target: portalRef?.current}}>
      <Menu.Target>
        <Tooltip label={tooltip} disabled={tooltip == null} withArrow portalProps={{target: portalRef?.current}}>
          <Button
            ref={refs.setReference}
            {...getReferenceProps()}
            variant={added ? 'filled' : 'elevated'}
            color={added ? 'dark.8' : 'contrast'}
            vars={added ? statusButtonVars : undefined}
            size="lg"
            className={styles.channelButton}
            data-opened={(added && opened) || undefined}
            loading={!added && state.status === AsyncStatuses.PENDING}
            loaderProps={ADD_LOADER_PROPS}
            data-disabled={actionDisabled || undefined}
            aria-disabled={actionDisabled || undefined}
            aria-haspopup={added ? 'menu' : undefined}
            onClick={handleClick}>
            <AnimatedWidth className={styles.labelBox}>
              <span className={styles.swap}>
                <span className={styles.swapLayer} data-shown={!added || undefined} aria-hidden={added || undefined}>
                  <span className={styles.labelText}>
                    {state.status === AsyncStatuses.ERROR ? formatMessage({defaultMessage: "Couldn't add"}) : addLabel}
                  </span>
                </span>
                <span
                  className={classNames(styles.swapLayer, styles.statusLayer)}
                  data-shown={added || undefined}
                  aria-hidden={!added || undefined}>
                  <CircleCheck size={16} className={styles.statusCheck} />
                  <span className={styles.labelText}>
                    {removeFailed ? formatMessage({defaultMessage: "Couldn't remove"}) : statusLabel}
                  </span>
                  <ChevronDown size={16} className={classNames(styles.chevron, styles.statusChevron)} />
                </span>
              </span>
            </AnimatedWidth>
          </Button>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown ref={refs.setFloating} {...getFloatingProps({onKeyDown: keepEscapeInMenu})}>
        <div className={styles.statusMenuTitle}>
          {formatMessage({defaultMessage: 'As <b>{code}</b>'}, {code: emote.code, b: renderEmphasis})}
        </div>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<Trash2 size={16} />} onClick={handleRemove}>
          {formatMessage({defaultMessage: 'Remove'})}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function EmoteAddButtons({emote}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const portalRef = usePortalRef();
  const addStatuses = useEmoteModalStore((state) => state.addStatuses);
  const userId = currentUser?.id ?? null;
  const loadedEmoteSets = useEmoteModalStore((state) => (userId != null ? state.emoteSets[userId] : NO_EMOTE_SETS));
  const emoteSets = loadedEmoteSets ?? NO_EMOTE_SETS;
  // undefined while it loads, null for the channel's own emotes
  const liveSetId = useEmoteModalStore((state) => (userId != null ? state.liveSetIds[userId] : null));

  const [menuOpened, {close: closeMenu, toggle: toggleMenu}] = useDisclosure(false);
  const {refs, context} = useFloating({open: menuOpened, onOpenChange: closeMenu});
  // the closed shadow root hides the press's path from the document, so it's checked by position
  const isOutsidePress = useCallback(
    (event) => !isPressOn(refs.floating.current, event) && !isPressOn(refs.reference.current, event),
    [refs]
  );
  const dismiss = useDismiss(context, {outsidePress: isOutsidePress});
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);

  // the swap animates only just after a click in the control, not as the modal's data comes in
  const [animated, setAnimated] = useState(false);
  const {start: startAnimationEnd, clear: clearAnimationEnd} = useTimeout(() => setAnimated(false), SWAP_ANIMATION_MS);
  const handleClickCapture = useCallback(() => {
    setAnimated(true);
    clearAnimationEnd();
    startAnimationEnd();
  }, [clearAnimationEnd, startAnimationEnd]);

  const isBetterTTVEmote = emote.category?.provider === EmoteProviders.BETTERTTV;
  const addable = canAddEmote(emote);
  const availabilityEligible = addable && userId != null;
  const availability = useEmoteModalStore((state) =>
    availabilityEligible ? (state.availability[availabilityKey(userId, emote.id)] ?? null) : UNKNOWN_AVAILABILITY
  );
  // the set live in the channel's chat goes up front in Channel's place
  const liveSet = liveSetId != null ? emoteSets.find((emoteSet) => emoteSet.id === liveSetId) : undefined;
  // a skeleton until the live set is known, so Add to Channel doesn't flash ahead of the set's name
  const liveSetPending =
    availabilityEligible && (liveSetId === undefined || (liveSetId != null && loadedEmoteSets == null));
  const upFrontDestination = liveSet?.id ?? EmoteAddDestinations.CHANNEL;
  // local signals that need no api round-trip and keep working when it's unreachable: your own
  // channel's chat emotes (its live set's) are already loaded, and your personal emotes arrive over the socket
  const currentChannel = getCurrentChannel();
  const platformUser = getCurrentUser();
  const isOwnChannel = currentUser != null && platformUser != null && currentChannel?.id === platformUser.id;
  const locallyInChat = isBetterTTVEmote && isOwnChannel && channelEmotes.getEligibleEmoteById(emote.id) != null;
  const locallyInPersonal =
    isBetterTTVEmote &&
    currentUser != null &&
    personalEmotes.getEmotes(platformUser).some((personalEmote) => personalEmote.id === emote.id);
  const personalLocked = currentUser != null && !isUserPro(currentUser);

  const buttonStateFor = (target) => {
    const entry = availability?.[target] ?? null;
    // a remove outranks what the chat shows until the socket catches up
    const locallyAdded =
      entry?.removed !== true &&
      ((target === upFrontDestination && locallyInChat) ||
        (target === EmoteAddDestinations.PERSONAL && locallyInPersonal));
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
  const personalState = buttonStateFor(EmoteAddDestinations.PERSONAL);
  // with no slots for personal emotes the row offers Pro instead, which the add opens in front of it
  const personal =
    personalLocked && !personalState.added ? {...personalState, disabled: false, tooltip: undefined} : personalState;
  const upFront = liveSet != null ? buttonStateFor(liveSet.id) : channel;

  const handleAddUpFront = useCallback(() => performAdd(emote.id, upFrontDestination), [emote.id, upFrontDestination]);
  const handleAddChannel = useCallback(() => performAdd(emote.id, EmoteAddDestinations.CHANNEL), [emote.id]);
  const handleAddPersonal = useCallback(() => {
    if (personalLocked) {
      closeMenu();
    }
    performAdd(emote.id, EmoteAddDestinations.PERSONAL);
  }, [closeMenu, emote.id, personalLocked]);
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

  if (liveSetPending) {
    return <Skeleton className={styles.addSkeleton} aria-hidden="true" />;
  }

  const channelRestriction = availability?.[EmoteAddDestinations.CHANNEL]?.restriction;

  if (channelRestriction === EmoteAvailabilityRestrictionTypes.SHARING_DISABLED) {
    return (
      <Button size="lg" disabled>
        {formatMessage({defaultMessage: 'Sharing Disabled'})}
      </Button>
    );
  }

  // the api won't add an uploader's emote to their own channel, so with Channel up front the control is the menu alone
  const isUploader = channelRestriction === EmoteAvailabilityRestrictionTypes.OWN_EMOTE && liveSet == null;
  const menuLabel = formatMessage({defaultMessage: 'Add to…'});
  const split = !isUploader && upFront.added;
  const sets = emoteSets.filter((emoteSet) => emoteSet.id !== liveSet?.id);

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
        <div
          className={styles.addButtonGroup}
          data-animated={animated || undefined}
          onClickCapture={handleClickCapture}>
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
            <Button.Group className={styles.actions} data-split={split || undefined}>
              <UpFrontButton
                emote={emote}
                destination={upFrontDestination}
                state={upFront}
                addLabel={
                  liveSet != null
                    ? formatMessage({defaultMessage: 'Add to {name}'}, {name: emoteSetName(liveSet)})
                    : formatMessage({defaultMessage: 'Add to Channel'})
                }
                statusLabel={liveSet != null ? emoteSetName(liveSet) : formatMessage({defaultMessage: 'Channel'})}
                onAdd={handleAddUpFront}
              />
              <Button
                variant="elevated"
                color="contrast"
                size="lg"
                className={styles.menuChevron}
                onClick={toggleMenu}
                aria-expanded={menuOpened}
                aria-label={formatMessage({defaultMessage: 'More add options'})}>
                <span className={styles.menuIcons}>
                  <span className={styles.menuIcon} data-shown={!split || undefined}>
                    <ChevronDown size={24} className={styles.chevron} />
                  </span>
                  <span className={styles.menuIcon} data-shown={split || undefined}>
                    <Plus size={20} />
                  </span>
                </span>
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
        {liveSet != null ? (
          <AddMenuRow label={formatMessage({defaultMessage: 'Channel'})} state={channel} onClick={handleAddChannel} />
        ) : null}
        <AddMenuRow
          label={formatMessage({defaultMessage: 'Personal'})}
          state={personal}
          rightSection={personalLocked ? <ProBadge /> : null}
          onClick={handleAddPersonal}
        />
        {sets.length > 0 ? <div className={styles.menuDivider} role="separator" /> : null}
        {sets.map((emoteSet) => (
          <EmoteSetRow key={emoteSet.id} emoteId={emote.id} emoteSet={emoteSet} state={buttonStateFor(emoteSet.id)} />
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}
