import {
  ActionIcon,
  Avatar,
  Button,
  NativeSelect,
  Pill,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core';
import React, {useCallback, useMemo, useRef} from 'react';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import styles from './SettingKeywords.module.css';
import {KeywordTypes} from '../../../utils/keywords.js';
import formatMessage from '../../../i18n/index.js';
import ColorPicker from './ColorPicker.jsx';
import {useDisclosure, useFocusTrap} from '@mantine/hooks';
import classNames from 'classnames';
import Panel from './Panel.jsx';
import Icon from '../../../common/components/Icon.jsx';
import usePortalRef from '../../../common/hooks/PortalRef.jsx';
import useCurrentChannel from '../../../common/hooks/CurrentChannel.jsx';

function KeywordRow({id, data, updateHandler, deleteHandler, colorColumn, keywordInputRefCallback, ...props}) {
  const portalRef = usePortalRef();
  const currentChannel = useCurrentChannel();
  const onUpdate = useCallback((newKeywordData) => updateHandler(id, newKeywordData), [updateHandler, id]);
  const onDelete = useCallback(() => deleteHandler(id), [deleteHandler, id]);
  const keywordInputRef = useCallback((ref) => keywordInputRefCallback(id, ref), [keywordInputRefCallback, id]);
  const [opened, {open, close}] = useDisclosure(false);
  const channels = data?.channels ?? [];
  const focusRef = useFocusTrap(opened);

  return (
    <TableTr {...props}>
      {colorColumn != null ? (
        <TableTd className={styles.colorDataCell}>
          <ColorPicker
            size="sm"
            variant="transparent"
            value={data.color}
            defaultValue={colorColumn.defaultValue}
            placeholder={colorColumn.defaultValue}
            className={styles.colorPicker}
            onChange={(color) => onUpdate({color})}
          />
        </TableTd>
      ) : null}
      <TableTd className={styles.targetDataCell}>
        <NativeSelect
          variant="unstyled"
          classNames={{input: styles.targetSelectInput}}
          value={data.type}
          data={[
            {label: formatMessage({defaultMessage: 'Message'}), value: KeywordTypes.MESSAGE},
            {label: formatMessage({defaultMessage: 'Username'}), value: KeywordTypes.USER},
            {label: formatMessage({defaultMessage: 'Badge'}), value: KeywordTypes.BADGE},
          ]}
          size="lg"
          onChange={({target: {value}}) => onUpdate({type: value})}
        />
      </TableTd>
      <TableTd className={styles.keywordDataCell}>
        <TextInput
          variant="unstyled"
          classNames={{
            input: styles.keywordInput,
            root: styles.keywordRoot,
            wrapper: styles.keywordWrapper,
          }}
          ref={keywordInputRef}
          defaultValue={data.keyword}
          onBlur={({target: {value}}) => onUpdate({keyword: value})}
        />
      </TableTd>
      <TableTd className={styles.channelsDataCell}>
        <div className={classNames(styles.channelsInputContainer, {[styles.channelsInputHidden]: !opened})}>
          <TagsInput
            size="xl"
            ref={focusRef}
            value={channels}
            onChange={(channels) => onUpdate({channels})}
            placeholder={formatMessage({defaultMessage: 'channel, etc..'})}
            withAsterisk={false}
            onBlur={close}
            variant="unstyled"
            renderOption={() => (
              <div className={styles.channelOption}>
                <Avatar src={currentChannel.avatar} size={28} radius="xl" />
                <Text size="md">{currentChannel.displayName}</Text>
              </div>
            )}
            classNames={{input: styles.channelsInput, pill: styles.channelsPill}}
            comboboxProps={{radius: 'lg', size: 'md', portalProps: {target: portalRef.current}}}
            data={currentChannel ? [currentChannel.displayName] : []}
          />
        </div>
        <button
          type="button"
          className={classNames(styles.channelsContainer, {[styles.channelsContainerHidden]: opened})}
          onClick={open}>
          {channels.length > 0 ? (
            channels.map((channelName) => (
              <Pill size="xl" key={channelName}>
                {channelName}
              </Pill>
            ))
          ) : (
            <Text c="dimmed">{formatMessage({defaultMessage: 'Every Channel'})}</Text>
          )}
        </button>
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

function createNewEntry(defaultKeyword = '') {
  const nextKeywordId = crypto.randomUUID();
  return {keyword: defaultKeyword, id: nextKeywordId, type: KeywordTypes.MESSAGE};
}

function KeywordsTable({
  entryList,
  showColorColumn,
  colorColumn,
  updateHandler,
  deleteHandler,
  keywordInputRefCallback,
  onPaste,
}) {
  return (
    <Table withColumnBorders className={styles.table} onPaste={onPaste}>
      <TableThead>
        <TableTr>
          {showColorColumn ? <TableTh className={styles.colorColumn} /> : null}
          <TableTh className={styles.targetColumn}>{formatMessage({defaultMessage: 'Target'})}</TableTh>
          <TableTh className={styles.keywordColumn}>{formatMessage({defaultMessage: 'Keyword'})}</TableTh>
          <TableTh className={styles.channelsColumn}>{formatMessage({defaultMessage: 'Channels'})}</TableTh>
          <TableTh className={styles.actionsColumn} />
        </TableTr>
      </TableThead>
      <TableTbody>
        {entryList.map(([id, row]) => (
          <KeywordRow
            id={id}
            key={id}
            data={row}
            colorColumn={colorColumn}
            updateHandler={updateHandler}
            deleteHandler={deleteHandler}
            keywordInputRefCallback={keywordInputRefCallback}
          />
        ))}
      </TableTbody>
    </Table>
  );
}

// TODO: Down the line we could explore virtualizing this list, as some user's have thousands of entries, and possibly adding a search
function SettingKeywords({title, value, setValue, colorColumn = null}) {
  const entryList = useMemo(() => Object.entries(value ?? {}).reverse(), [value]);
  const showColorColumn = colorColumn != null;
  const pendingKeywordFocusRef = useRef(null);

  const newEntryHandler = useCallback(() => {
    const newEntry = createNewEntry();

    setValue((prevKeywords) => {
      const nextKeywords = {...prevKeywords};
      nextKeywords[newEntry.id] = newEntry;
      return nextKeywords;
    });

    pendingKeywordFocusRef.current = newEntry.id;
  }, [setValue]);

  const deleteHandler = useCallback(
    (id) => {
      setValue((prevKeywords) => {
        const nextKeywords = {...prevKeywords};

        if (nextKeywords[id] == null) {
          return prevKeywords;
        }

        delete nextKeywords[id];
        return nextKeywords;
      });
    },
    [setValue]
  );

  const updateHandler = useCallback(
    (id, newKeywordData) => {
      setValue((prevKeywords) => {
        const nextKeywords = {...prevKeywords};
        const existingKeyword = nextKeywords[id];

        if (existingKeyword == null) {
          return prevKeywords;
        }

        nextKeywords[id] = {...existingKeyword, ...newKeywordData};
        return nextKeywords;
      });
    },
    [setValue]
  );

  const handlePaste = useCallback(
    (event) => {
      const lines = (event.clipboardData ?? window.clipboardData)
        .getData('text')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length <= 1) {
        return;
      }

      setValue((prevKeywords = {}) => {
        const newKeywords = {...prevKeywords};

        for (const line of lines) {
          const newEntry = createNewEntry(line);
          newKeywords[newEntry.id] = newEntry;
        }

        return newKeywords;
      });
    },
    [setValue]
  );

  const keywordInputRefCallback = useCallback((id, ref) => {
    if (pendingKeywordFocusRef.current !== id) {
      return;
    }

    ref.focus();
    pendingKeywordFocusRef.current = null;
  }, []);

  return (
    <Panel
      title={title}
      rightContent={
        <Button size="lg" onClick={newEntryHandler}>
          {formatMessage({defaultMessage: 'New Entry'})}
        </Button>
      }
      className={styles.settingGroupContent}>
      {entryList.length > 0 ? (
        <KeywordsTable
          entryList={entryList}
          showColorColumn={showColorColumn}
          colorColumn={colorColumn}
          updateHandler={updateHandler}
          deleteHandler={deleteHandler}
          keywordInputRefCallback={keywordInputRefCallback}
          onPaste={handlePaste}
        />
      ) : (
        <Text className={styles.noKeywordsText} c="dimmed">
          {formatMessage({defaultMessage: 'No keywords found, start by adding a new entry.'})}
        </Text>
      )}
    </Panel>
  );
}

export default SettingKeywords;
