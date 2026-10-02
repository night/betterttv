import {useDebouncedCallback} from '@mantine/hooks';
import isEqual from 'lodash.isequal';
import {useCallback, useEffect, useRef, useState} from 'react';
import Sentry from '@/utils/sentry';

// Optimistic local state mirrored from a remote `value`. Updates flip the local value instantly,
// then persist via `onSave` on a debounce. Changing the value aborts any in-flight write right
// away (not on the next debounced save) so a superseded write can't commit remotely, and the
// final value is always sent so a write that did leak is overwritten. `onSave` receives
// `(value, {signal, isStale})`; `isStale()` reports whether a newer value has superseded this
// write, so callers can skip applying its result. A failed write that is still current rolls the
// value back to the remote source of truth.
export default function useDebouncedRemoteState({value: remoteValue, onSave, delay = 500}) {
  const [value, setValue] = useState(remoteValue);
  // the latest value the user intends, set the instant `update` is called (before the debounce);
  // a write whose value no longer matches this has been superseded and must not apply
  const latestValueRef = useRef(remoteValue);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    setValue(remoteValue);
  }, [remoteValue]);

  const save = useDebouncedCallback(
    (nextValue) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const isStale = () => !isEqual(nextValue, latestValueRef.current);

      Promise.resolve(onSave(nextValue, {signal: abortController.signal, isStale})).catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }
        // a newer value superseded this write mid-flight; don't let its stale failure roll back the current value
        if (isStale()) {
          return;
        }
        // the write failed, so roll the optimistic value back to the remote source of truth
        setValue(remoteValue);
        Sentry.captureException(error);
      });
    },
    {delay, flushOnUnmount: true}
  );

  const update = useCallback(
    (nextValue) => {
      latestValueRef.current = nextValue;
      // cancel any in-flight write immediately so a superseded value can't commit remotely
      abortControllerRef.current?.abort();
      setValue(nextValue);
      save(nextValue);
    },
    [save]
  );

  return [value, update];
}
