import {useDebouncedCallback} from '@mantine/hooks';
import isEqual from 'lodash.isequal';
import {useCallback, useEffect, useRef, useState} from 'react';
import Sentry from '@/utils/sentry';

// Optimistic local state mirrored from a remote `value`. Updates flip the local value
// instantly, then persist via `onSave` on a debounce. Writes are deduped (a write is
// skipped when the value already matches what was last sent) and a newer write aborts an
// in-flight one so a stale response can't win the race. A failed write rolls the value
// back to the remote source of truth. `onSave` receives `(value, {signal})`.
export default function useDebouncedRemoteState({value: remoteValue, onSave, delay = 500}) {
  const [value, setValue] = useState(remoteValue);
  // the value last sent to (or currently being sent to) the remote, kept in sync with it
  const savedValueRef = useRef(remoteValue);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    setValue(remoteValue);
    savedValueRef.current = remoteValue;
  }, [remoteValue]);

  const save = useDebouncedCallback((nextValue) => {
    if (isEqual(nextValue, savedValueRef.current)) {
      return;
    }
    savedValueRef.current = nextValue;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    Promise.resolve(onSave(nextValue, {signal: abortController.signal})).catch((error) => {
      if (error.name === 'AbortError') {
        return;
      }
      // the write failed, so roll the optimistic value back to the remote source of truth
      savedValueRef.current = remoteValue;
      setValue(remoteValue);
      Sentry.captureException(error);
    });
  }, delay);

  const update = useCallback(
    (nextValue) => {
      setValue(nextValue);
      save(nextValue);
    },
    [save]
  );

  return [value, update];
}
