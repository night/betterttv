import React, {useCallback, useState} from 'react';
import {EmoteAddDestinations, LAST_EMOTE_ADD_DESTINATION_STORAGE_KEY} from '@/constants';
import storage from '@/storage';
import EmoteAlternativesContent from './EmoteAlternativesContent';
import EmoteModalContent from './EmoteModalContent';
import {addToLabel} from './utils';

function getInitialDestination() {
  return storage.get(LAST_EMOTE_ADD_DESTINATION_STORAGE_KEY) === EmoteAddDestinations.PERSONAL
    ? EmoteAddDestinations.PERSONAL
    : EmoteAddDestinations.CHANNEL;
}

// Renders the emote modal's pages inside a single modal, swapping between them with state so there
// is no second modal/overlay (and no transition) when moving between pages. The chosen add
// destination (channel/personal) is shared across pages and remembered for next time.
export default function EmoteModalRouter({
  emote,
  detailTitle,
  initialPage = 'detail',
  onPageChange,
  onClose,
  onSetTitle,
}) {
  const [page, setPage] = useState(initialPage);
  const [destination, setDestinationState] = useState(getInitialDestination);
  // the alternatives, prefetched on the detail page, so the alternatives page has them immediately
  const [alternatives, setAlternatives] = useState(null);

  const setDestination = useCallback((value) => {
    setDestinationState(value);
    storage.set(LAST_EMOTE_ADD_DESTINATION_STORAGE_KEY, value);
  }, []);

  // each page sets the modal title as it's shown: the alternatives page shows the add destination
  // (passed in, since the chosen value may not be in state yet), the detail page shows the emote
  // (whose title is already set when the modal first opens)
  const showAlternatives = useCallback(
    (chosen, results) => {
      setAlternatives(results ?? null);
      onSetTitle(addToLabel(chosen));
      setPage('alternatives');
      onPageChange('alternatives');
    },
    [onSetTitle, onPageChange]
  );

  const showDetail = useCallback(() => {
    onSetTitle(detailTitle);
    setPage('detail');
    onPageChange('detail');
  }, [onSetTitle, detailTitle, onPageChange]);

  if (page === 'alternatives') {
    return (
      <EmoteAlternativesContent
        emote={emote}
        destination={destination}
        initialResults={alternatives}
        onClose={onClose}
        onBack={showDetail}
      />
    );
  }

  return (
    <EmoteModalContent
      emote={emote}
      destination={destination}
      onChangeDestination={setDestination}
      onClose={onClose}
      onNeedsAlternative={showAlternatives}
    />
  );
}
