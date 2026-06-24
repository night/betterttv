import {Button, RadioCard, RadioGroup, Text} from '@mantine/core';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useState} from 'react';
import Icon from '@/common/components/Icon';
import {EmoteAddDestinations} from '@/constants';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import useEmoteAdd, {useCloseAfterAdd} from './useEmoteAdd';
import {addLoaderType, searchSharedEmotesQuery} from './utils';
import styles from './EmoteModal.module.css';

function AlternativesList({emote, destination, results, selected, onSelect}) {
  // results is null until the search resolves; render nothing until then so the empty-state message
  // doesn't briefly flash the "Select an alternative" heading before it
  if (results == null) {
    return null;
  }

  if (results.length === 0) {
    return (
      <Text className={styles.emptyAlternatives}>
        {formatMessage({defaultMessage: 'No BetterTTV emotes found for "{code}".'}, {code: emote.code})}
      </Text>
    );
  }

  return (
    <React.Fragment>
      <Text size="md">
        {destination === EmoteAddDestinations.PERSONAL
          ? formatMessage({defaultMessage: 'Select an alternative emote to add to your personal emotes'})
          : formatMessage({defaultMessage: 'Select an alternative emote to add to your channel emotes'})}
      </Text>
      <RadioGroup value={selected ?? ''} onChange={onSelect}>
        <div className={styles.grid}>
          {results.map((alternative) => (
            <RadioCard key={alternative.id} value={alternative.id} className={styles.altTile}>
              <img className={styles.altImage} src={cdn.emoteUrl(alternative.id, '3x')} alt={alternative.code} />
              <Icon icon={faCheckCircle} className={styles.altCheck} />
            </RadioCard>
          ))}
        </div>
      </RadioGroup>
    </React.Fragment>
  );
}

export default function EmoteAlternativesContent({emote, destination, initialResults, onClose, onBack}) {
  const [selected, setSelected] = useState(null);
  const {add, reset, mutationFor} = useEmoteAdd();
  const addMutation = mutationFor(destination);
  useCloseAfterAdd(addMutation, onClose);

  // initialResults are prefetched on the detail page before navigating here, so the list renders on
  // the first frame instead of flashing an empty/loading state
  const {data} = useQuery({...searchSharedEmotesQuery(emote.code), initialData: initialResults ?? undefined});
  const results = data ?? null;
  // default to the first alternative so the user can add right away
  const selectedId = selected ?? results?.[0]?.id ?? null;

  const handleSelect = useCallback(
    (value) => {
      setSelected(value);
      reset();
    },
    [reset]
  );

  const handleConfirm = useCallback(() => {
    if (selectedId == null) {
      return;
    }

    add(selectedId, destination, onClose);
  }, [add, selectedId, destination, onClose]);

  return (
    <React.Fragment>
      <div className={styles.content}>
        <AlternativesList
          emote={emote}
          destination={destination}
          results={results}
          selected={selectedId}
          onSelect={handleSelect}
        />
      </div>
      <div className={styles.footer}>
        <Button variant="elevated" size="lg" onClick={onBack}>
          {formatMessage({defaultMessage: 'Back'})}
        </Button>
        <Button
          variant="elevated"
          color="contrast"
          size="lg"
          loading={!addMutation.isIdle}
          loaderProps={{type: addLoaderType(addMutation)}}
          disabled={selectedId == null}
          onClick={handleConfirm}>
          {formatMessage({defaultMessage: 'Confirm'})}
        </Button>
      </div>
    </React.Fragment>
  );
}
