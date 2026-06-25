import {Avatar, Button, Popover, Text} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {DateTime} from 'luxon';
import React, {useCallback, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import usePortalRef from '@/common/hooks/PortalRef';
import {EmoteAddDestinations, EmoteCategories, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import {getEmoteImageType} from '@/utils/emote';
import {createSrc} from '@/utils/image';
import useEmoteActions, {useCloseAfterAction} from './useEmoteActions';
import {
  addLoaderType,
  addToLabel,
  emoteAvailableQuery,
  getEmoteModalDetails,
  removeFromLabel,
  searchSharedEmotesQuery,
} from './utils';
import styles from './EmoteModal.module.css';

const GLOBAL_EMOTE_CATEGORY_IDS = [
  EmoteCategories.BETTERTTV_GLOBAL,
  EmoteCategories.FRANKERFACEZ_GLOBAL,
  EmoteCategories.SEVENTV_GLOBAL,
];

function MetadataRow({label, children}) {
  if (children == null) {
    return null;
  }

  return (
    <div className={styles.metadataRow}>
      <Text className={styles.metadataLabel}>{label}</Text>
      <Text className={styles.metadataValue}>{children}</Text>
    </div>
  );
}

export default function EmoteModalContent({emote, destination, onChangeDestination, onClose, onNeedsAlternative}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const [dimensions, setDimensions] = useState(null);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const portalRef = usePortalRef();
  const queryClient = useQueryClient();
  const {act, reset, mutationFor} = useEmoteActions();

  const {data: details} = useQuery({
    queryKey: ['emote-modal-details', emote.category?.provider, emote.id],
    queryFn: () => getEmoteModalDetails(emote),
  });

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

  const imageSrc = createSrc(emote.images, false, '4x');
  const isBetterTTVEmote = emote.category?.provider === EmoteProviders.BETTERTTV;
  const isEmoji = emote.category?.id === EmoteCategories.BETTERTTV_EMOJI;
  const isBetterTTVGlobal = emote.category?.id === EmoteCategories.BETTERTTV_GLOBAL;
  // emoji and BetterTTV global emotes are already available everywhere, so they can't be added or removed
  const addDisabled = isEmoji || isBetterTTVGlobal;
  const otherDestination =
    destination === EmoteAddDestinations.CHANNEL ? EmoteAddDestinations.PERSONAL : EmoteAddDestinations.CHANNEL;
  const actionMutation = mutationFor(destination);
  useCloseAfterAction(actionMutation, onClose);

  // look up whether the user already has this emote, so each destination can offer Add or Remove. Only
  // regular BetterTTV emotes can be added/removed, so skip the lookup (and its request) otherwise.
  const availabilityEmoteId = isBetterTTVEmote && !addDisabled ? emote.id : null;
  const channelAvailable = useQuery(
    emoteAvailableQuery(availabilityEmoteId, EmoteAddDestinations.CHANNEL, currentUser?.id)
  );
  const personalAvailable = useQuery(
    emoteAvailableQuery(availabilityEmoteId, EmoteAddDestinations.PERSONAL, currentUser?.id)
  );
  const availableFor = (dest) => (dest === EmoteAddDestinations.PERSONAL ? personalAvailable : channelAvailable);

  const handleImageLoad = useCallback((event) => {
    const {naturalWidth, naturalHeight} = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setDimensions({width: naturalWidth, height: naturalHeight});
    }
  }, []);

  const handleAddTo = useCallback(
    async (chosen) => {
      closeMenu();
      onChangeDestination(chosen);
      reset();

      if (!isBetterTTVEmote) {
        // a non-BetterTTV emote can't be added directly — fetch the BetterTTV alternatives first (the
        // button shows a loader) and hand them to the alternatives page so it renders them on its
        // first frame (no empty/loading flash)
        setLoadingAlternatives(true);
        const alternatives = await queryClient.fetchQuery(searchSharedEmotesQuery(emote.code));
        onNeedsAlternative(chosen, alternatives);
        return;
      }

      // already in the chosen set → remove it; otherwise add it
      const isAvailable =
        (chosen === EmoteAddDestinations.PERSONAL ? personalAvailable.data : channelAvailable.data) === true;
      act(emote.id, chosen, !isAvailable, onClose);
    },
    [
      closeMenu,
      onChangeDestination,
      reset,
      isBetterTTVEmote,
      queryClient,
      emote.code,
      emote.id,
      onNeedsAlternative,
      act,
      onClose,
      channelAvailable.data,
      personalAvailable.data,
    ]
  );

  const handleAddToSelected = useCallback(() => handleAddTo(destination), [handleAddTo, destination]);
  const handleAddToOther = useCallback(() => handleAddTo(otherDestination), [handleAddTo, otherDestination]);
  const handleMenuChange = useCallback(
    (isOpen) => {
      if (!isOpen) {
        closeMenu();
      }
    },
    [closeMenu]
  );

  const isGlobalEmote = GLOBAL_EMOTE_CATEGORY_IDS.includes(emote.category?.id);
  const currentChannel = getCurrentChannel();
  const createdAt = details?.createdAt != null ? DateTime.fromISO(details.createdAt) : null;
  const channelName = isEmoji
    ? formatMessage({defaultMessage: 'BetterTTV Emojis'})
    : isGlobalEmote
      ? formatMessage({defaultMessage: 'Global'})
      : (currentChannel?.displayName ?? currentChannel?.name ?? null);
  const uploadedBy = details?.user?.displayName ?? details?.user?.name ?? null;
  const fileType = getEmoteImageType(emote);
  const fileMetadata =
    fileType != null && dimensions != null ? `${fileType} (${dimensions.width}x${dimensions.height})` : fileType;

  const avatar = currentUser?.avatar != null ? <Avatar src={currentUser.avatar} size="md" /> : null;

  // per-destination button state: a BetterTTV emote the user already has shows Remove; otherwise Add,
  // which is disabled when the emote's owner has turned off sharing (the API rejects adding it). The
  // button stays loading until availability resolves so its label doesn't flip from Add to Remove.
  const sharingDisabled = isBetterTTVEmote && details?.sharing === false;
  const currentIsAdd = !isBetterTTVEmote || availableFor(destination).data !== true;
  const currentLabel = currentIsAdd ? addToLabel(destination) : removeFromLabel(destination);
  const currentLoading =
    loadingAlternatives || !actionMutation.isIdle || (isBetterTTVEmote && availableFor(destination).isLoading);
  const currentDisabled = currentIsAdd && sharingDisabled;
  const otherIsAdd = !isBetterTTVEmote || availableFor(otherDestination).data !== true;
  const otherLabel = otherIsAdd ? addToLabel(otherDestination) : removeFromLabel(otherDestination);
  const otherDisabled =
    (otherIsAdd && sharingDisabled) || (isBetterTTVEmote && availableFor(otherDestination).isLoading);

  return (
    <React.Fragment>
      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={imageSrc}
            alt={formatMessage({defaultMessage: 'Emote {code}'}, {code: emote.code})}
            onLoad={handleImageLoad}
          />
        </div>
        <div className={styles.metadata}>
          <MetadataRow label={formatMessage({defaultMessage: 'Channel'})}>{channelName}</MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'Added On'})}>
            {createdAt != null ? createdAt.toLocaleString(DateTime.DATE_MED) : null}
          </MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'Uploaded By'})}>{uploadedBy}</MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'File Metadata'})}>{fileMetadata}</MetadataRow>
        </div>
      </div>
      <div className={styles.footer}>
        <Button variant="elevated" size="lg" onClick={onClose}>
          {formatMessage({defaultMessage: 'Close'})}
        </Button>
        {addDisabled ? (
          <div className={styles.addButtonGroup}>
            <Button.Group>
              <Button variant="elevated" color="contrast" size="lg" disabled leftSection={avatar}>
                {addToLabel(destination)}
              </Button>
              <Button
                variant="elevated"
                color="contrast"
                size="lg"
                className={styles.menuChevron}
                disabled
                aria-label={formatMessage({defaultMessage: 'More options'})}>
                <Icon icon={faChevronDown} />
              </Button>
            </Button.Group>
          </div>
        ) : (
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
                <Button.Group>
                  <Button
                    variant="elevated"
                    color="contrast"
                    size="lg"
                    loading={currentLoading}
                    loaderProps={{type: addLoaderType(actionMutation)}}
                    disabled={currentDisabled}
                    leftSection={avatar}
                    onClick={handleAddToSelected}>
                    {currentLabel}
                  </Button>
                  <Button
                    variant="elevated"
                    color="contrast"
                    size="lg"
                    className={styles.menuChevron}
                    disabled={loadingAlternatives || !actionMutation.isIdle}
                    onClick={toggleMenu}
                    aria-label={formatMessage({defaultMessage: 'More options'})}>
                    <Icon icon={faChevronDown} />
                  </Button>
                </Button.Group>
              </div>
            </Popover.Target>
            <Popover.Dropdown ref={refs.floating} {...getFloatingProps()} className={styles.menuDropdown}>
              <Button
                variant="subtle"
                size="lg"
                fullWidth
                justify="start"
                className={styles.menuItemButton}
                leftSection={avatar}
                disabled={otherDisabled}
                onClick={handleAddToOther}>
                {otherLabel}
              </Button>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
    </React.Fragment>
  );
}
