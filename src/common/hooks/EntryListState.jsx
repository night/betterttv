import {useCallback, useMemo, useRef} from 'react';

// Shared state for the settings entry tables (commands, timers, keywords): an
// id-keyed map of rows with add/update/delete handlers, newest rows first, and
// a ref callback that focuses the row added last.
function useEntryListState(value, setValue) {
  const entryList = useMemo(() => Object.entries(value ?? {}).reverse(), [value]);
  const pendingFocusRef = useRef(null);

  const addEntry = useCallback(
    (newEntry) => {
      setValue((prevEntries) => {
        const nextEntries = {...prevEntries};
        nextEntries[newEntry.id] = newEntry;
        return nextEntries;
      });

      pendingFocusRef.current = newEntry.id;
    },
    [setValue]
  );

  const updateHandler = useCallback(
    (id, newEntryData) => {
      setValue((prevEntries) => {
        const nextEntries = {...prevEntries};
        const existingEntry = nextEntries[id];

        if (existingEntry == null) {
          return prevEntries;
        }

        nextEntries[id] = {...existingEntry, ...newEntryData};
        return nextEntries;
      });
    },
    [setValue]
  );

  const deleteHandler = useCallback(
    (id) => {
      setValue((prevEntries) => {
        const nextEntries = {...prevEntries};

        if (nextEntries[id] == null) {
          return prevEntries;
        }

        delete nextEntries[id];
        return nextEntries;
      });
    },
    [setValue]
  );

  const focusInputRefCallback = useCallback((id, ref) => {
    if (pendingFocusRef.current !== id) {
      return;
    }

    ref?.focus();
    pendingFocusRef.current = null;
  }, []);

  return {entryList, addEntry, updateHandler, deleteHandler, focusInputRefCallback};
}

export default useEntryListState;
