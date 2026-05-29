import {ActionIcon, Button, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput} from '@mantine/core';
import React, {useCallback, useMemo, useRef} from 'react';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import styles from './SettingTextReplacements.module.css';
import formatMessage from '../../../i18n/index.js';
import Panel from './Panel.jsx';
import Icon from '../../../common/components/Icon.jsx';
function ReplacementRow({id, data, updateHandler, deleteHandler, triggerInputRefCallback}) {
  const onUpdate = useCallback((newData) => updateHandler(id, newData), [updateHandler, id]);
  const onDelete = useCallback(() => deleteHandler(id), [deleteHandler, id]);
  const triggerInputRef = useCallback((ref) => triggerInputRefCallback(id, ref), [triggerInputRefCallback, id]);

  return (
    <TableTr>
      <TableTd className={styles.inputDataCell}>
        <TextInput
          variant="unstyled"
          classNames={{input: styles.cellInput, root: styles.inputRoot, wrapper: styles.inputWrapper}}
          ref={triggerInputRef}
          defaultValue={data.alias}
          onBlur={(e) => {
            const cleaned = e.target.value.trim().replace(/\s+/g, '');
            e.target.value = cleaned;
            onUpdate({alias: cleaned});
          }}
          placeholder={formatMessage({defaultMessage: 'trigger'})}
        />
      </TableTd>
      <TableTd className={styles.inputDataCell}>
        <TextInput
          variant="unstyled"
          classNames={{input: styles.cellInput, root: styles.inputRoot, wrapper: styles.inputWrapper}}
          defaultValue={data.replacement}
          onBlur={({target: {value}}) => onUpdate({replacement: value.trim()})}
          placeholder={formatMessage({defaultMessage: 'replacement'})}
        />
      </TableTd>
      <TableTd className={styles.actionsDataCell}>
        <ActionIcon
          color="gray"
          variant="transparent"
          className={styles.actionIcon}
          size="sm"
          classNames={{icon: styles.actionIconIcon}}
          onClick={onDelete}>
          <Icon icon={faTrash} />
        </ActionIcon>
      </TableTd>
    </TableTr>
  );
}

function createNewEntry() {
  return {id: crypto.randomUUID(), alias: '', replacement: ''};
}

function SettingTextReplacements({title, value, setValue}) {
  const entryList = useMemo(() => Object.entries(value ?? {}).reverse(), [value]);
  const pendingFocusRef = useRef(null);

  const newEntryHandler = useCallback(() => {
    const newEntry = createNewEntry();
    setValue((prev) => ({...prev, [newEntry.id]: newEntry}));
    pendingFocusRef.current = newEntry.id;
  }, [setValue]);

  const deleteHandler = useCallback(
    (id) => {
      setValue((prev) => {
        const next = {...prev};
        delete next[id];
        return next;
      });
    },
    [setValue]
  );

  const updateHandler = useCallback(
    (id, newData) => {
      setValue((prev) => {
        if (prev[id] == null) return prev;
        return {...prev, [id]: {...prev[id], ...newData}};
      });
    },
    [setValue]
  );

  const triggerInputRefCallback = useCallback((id, ref) => {
    if (pendingFocusRef.current !== id) return;
    ref?.focus();
    pendingFocusRef.current = null;
  }, []);

  return (
    <Panel
      title={title}
      rightContent={
        <Button size="lg" onClick={newEntryHandler}>
          {formatMessage({defaultMessage: 'New Entry'})}
        </Button>
      }
      className={styles.panelContent}>
      {entryList.length > 0 ? (
        <Table withColumnBorders className={styles.table}>
          <TableThead>
            <TableTr>
              <TableTh>{formatMessage({defaultMessage: 'Trigger'})}</TableTh>
              <TableTh>{formatMessage({defaultMessage: 'Replacement'})}</TableTh>
              <TableTh className={styles.actionsColumn} />
            </TableTr>
          </TableThead>
          <TableTbody>
            {entryList.map(([id, row]) => (
              <ReplacementRow
                key={id}
                id={id}
                data={row}
                updateHandler={updateHandler}
                deleteHandler={deleteHandler}
                triggerInputRefCallback={triggerInputRefCallback}
              />
            ))}
          </TableTbody>
        </Table>
      ) : (
        <Text className={styles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No replacements found, start by adding a new entry.'})}
        </Text>
      )}
    </Panel>
  );
}

export default SettingTextReplacements;
