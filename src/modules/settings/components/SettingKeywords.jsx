import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Button,
  Kbd,
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
import {useDisclosure, useFocusTrap} from '@mantine/hooks';
import classNames from 'classnames';
import {Info, Trash2} from 'lucide-react';
import React, {useCallback, useMemo, useState} from 'react';
import SelectMenu from '@/common/components/SelectMenu';
import useBadgeOptions from '@/common/hooks/BadgeOptions';
import useCurrentChannel from '@/common/hooks/CurrentChannel';
import useEntryListState from '@/common/hooks/EntryListState';
import usePortalRef from '@/common/hooks/PortalRef';
import tableStyles from '@/common/styles/SettingEntryTable.module.css';
import {openModal, WIDE_MODAL_SIZE} from '@/common/utils/modal';
import formatMessage from '@/i18n/index';
import {KeywordTypes} from '@/utils/keywords';
import ColorPicker from './ColorPicker';
import Panel from './Panel';
import styles from './SettingKeywords.module.css';

const MAX_BADGE_SUGGESTIONS = 25;
const BADGE_SUGGESTIONS_MAX_DROPDOWN_HEIGHT = 220;

const REGEX_EXAMPLES = [
  {pattern: '~/(cat|dog)s?/i', description: formatMessage({defaultMessage: 'Matches cat, dogs, and similar'})},
  {pattern: '~/\\bgg\\b/i', description: formatMessage({defaultMessage: 'Matches "gg" on its own, not "eggs"'})},
  {
    pattern: '~/!(give|raffle)/i',
    description: formatMessage({defaultMessage: 'Matches the !give and !raffle commands'}),
  },
  {pattern: '~/[A-Z]{5,}/', description: formatMessage({defaultMessage: 'Matches 5 or more capitals in a row'})},
];

function RegexGuideModalBody() {
  return (
    <div className={styles.regexModalBody}>
      <Text size="md" c="dimmed">
        {formatMessage(
          {
            defaultMessage:
              'Wrap a pattern in {syntax} to match with a regular expression instead of plain text, with optional flags such as {flag} for case-insensitivity.',
          },
          {syntax: <Kbd>~/ /</Kbd>, flag: <Kbd>i</Kbd>}
        )}
      </Text>
      <div className={styles.regexTableWrapper}>
        <Table withColumnBorders className={styles.regexTable}>
          <TableThead>
            <TableTr>
              <TableTh>{formatMessage({defaultMessage: 'Pattern'})}</TableTh>
              <TableTh>{formatMessage({defaultMessage: 'Matches'})}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {REGEX_EXAMPLES.map(({pattern, description}) => (
              <TableTr key={pattern}>
                <TableTd>
                  <Kbd size="lg">{pattern}</Kbd>
                </TableTd>
                <TableTd>
                  <Text size="md" c="dimmed">
                    {description}
                  </Text>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </div>
      <Text size="md" c="dimmed">
        {formatMessage({defaultMessage: 'It works for the Message, Username, and Badge targets.'})}
      </Text>
    </div>
  );
}

function openRegexGuideModal() {
  return openModal({
    title: formatMessage({defaultMessage: 'Advanced Keywords'}),
    size: WIDE_MODAL_SIZE,
    children: <RegexGuideModalBody />,
  });
}

const KEYWORD_TYPE_OPTIONS = [
  {label: formatMessage({defaultMessage: 'Message'}), value: KeywordTypes.MESSAGE},
  {label: formatMessage({defaultMessage: 'Username'}), value: KeywordTypes.USER},
  {label: formatMessage({defaultMessage: 'Badge'}), value: KeywordTypes.BADGE},
];

function renderBadgeOption({option}) {
  return (
    <div className={styles.badgeOption}>
      <img src={option.imageURL} alt="" className={styles.badgeOptionImage} />
      <Text size="md">{option.title}</Text>
    </div>
  );
}

function KeywordRow({
  id,
  data,
  updateHandler,
  deleteHandler,
  colorColumn,
  keywordInputRefCallback,
  currentChannel,
  ...props
}) {
  const portalRef = usePortalRef();
  const onUpdate = useCallback((newKeywordData) => updateHandler(id, newKeywordData), [updateHandler, id]);
  const onDelete = useCallback(() => deleteHandler(id), [deleteHandler, id]);
  const handleTypeChange = useCallback((type) => onUpdate({type}), [onUpdate]);
  const keywordInputRef = useCallback((ref) => keywordInputRefCallback(id, ref), [keywordInputRefCallback, id]);
  const [opened, {open, close}] = useDisclosure(false);
  const channels = data?.channels ?? [];
  const focusRef = useFocusTrap(opened);

  const isBadgeKeyword = data.type === KeywordTypes.BADGE;
  const badgeOptions = useBadgeOptions(isBadgeKeyword);

  return (
    <TableTr {...props}>
      {colorColumn != null ? (
        <TableTd className={classNames(tableStyles.dataCell, tableStyles.colorColumn)}>
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
      <TableTd className={classNames(tableStyles.dataCell, tableStyles.selectColumn)}>
        <SelectMenu
          variant="transparent"
          className={tableStyles.selectTrigger}
          ariaLabel={formatMessage({defaultMessage: 'Keyword target'})}
          options={KEYWORD_TYPE_OPTIONS}
          value={data.type}
          onChange={handleTypeChange}
        />
      </TableTd>
      <TableTd className={tableStyles.dataCell}>
        {isBadgeKeyword ? (
          <Autocomplete
            variant="unstyled"
            classNames={{
              input: tableStyles.textInput,
              root: classNames(tableStyles.textInputRoot, styles.keywordRoot),
              wrapper: tableStyles.textInputWrapper,
            }}
            ref={keywordInputRef}
            defaultValue={data.keyword}
            data={badgeOptions}
            limit={MAX_BADGE_SUGGESTIONS}
            maxDropdownHeight={BADGE_SUGGESTIONS_MAX_DROPDOWN_HEIGHT}
            renderOption={renderBadgeOption}
            comboboxProps={{radius: 'lg', size: 'md', portalProps: {target: portalRef.current}}}
            onBlur={({target: {value}}) => onUpdate({keyword: value})}
            onOptionSubmit={(keyword) => onUpdate({keyword})}
          />
        ) : (
          <TextInput
            variant="unstyled"
            classNames={{
              input: tableStyles.textInput,
              root: classNames(tableStyles.textInputRoot, styles.keywordRoot),
              wrapper: tableStyles.textInputWrapper,
            }}
            ref={keywordInputRef}
            defaultValue={data.keyword}
            onBlur={({target: {value}}) => onUpdate({keyword: value})}
          />
        )}
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
                <Avatar src={currentChannel?.avatar} size={28} radius="xl" />
                <Text size="md">{currentChannel?.displayName}</Text>
              </div>
            )}
            classNames={{root: styles.channelsInputRoot, input: styles.channelsInput, pill: styles.channelsPill}}
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
      <TableTd className={classNames(tableStyles.dataCell, tableStyles.actionsColumn)}>
        <ActionIcon
          color="gray"
          variant="transparent"
          className={tableStyles.actionIcon}
          size="sm"
          classNames={{icon: tableStyles.actionIconIcon}}
          onClick={onDelete}>
          <Trash2 size={16} />
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
  currentChannel,
  onPaste,
}) {
  return (
    <Table withColumnBorders className={tableStyles.table} onPaste={onPaste}>
      <TableThead>
        <TableTr>
          {showColorColumn ? <TableTh className={tableStyles.colorColumn} /> : null}
          <TableTh className={styles.targetColumn}>{formatMessage({defaultMessage: 'Target'})}</TableTh>
          <TableTh className={styles.keywordColumn}>
            <div className={styles.keywordHeader}>
              {formatMessage({defaultMessage: 'Keyword'})}
              <ActionIcon
                size="sm"
                variant="transparent"
                className={styles.infoButton}
                aria-label={formatMessage({defaultMessage: 'Advanced keywords'})}
                onClick={openRegexGuideModal}>
                <Info size={16} />
              </ActionIcon>
            </div>
          </TableTh>
          <TableTh>{formatMessage({defaultMessage: 'Channels'})}</TableTh>
          <TableTh className={tableStyles.actionsColumn} />
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
            currentChannel={currentChannel}
          />
        ))}
      </TableTbody>
    </Table>
  );
}

function SettingKeywords({value, setValue, colorColumn = null}) {
  const currentChannel = useCurrentChannel();
  const [search, setSearch] = useState('');
  const {entryList, addEntry, updateHandler, deleteHandler, focusInputRefCallback} = useEntryListState(value, setValue);

  const filteredEntryList = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (query.length === 0) {
      return entryList;
    }

    return entryList.filter(([, row]) => row.keyword.toLowerCase().includes(query));
  }, [entryList, search]);

  const showColorColumn = colorColumn != null;

  const newEntryHandler = useCallback(() => {
    setSearch('');
    addEntry(createNewEntry());
  }, [addEntry]);

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

  return (
    <Panel
      title={
        <TextInput
          size="lg"
          value={search}
          placeholder={formatMessage({defaultMessage: 'Search keywords...'})}
          onChange={({target: {value: searchValue}}) => setSearch(searchValue)}
          classNames={{input: styles.searchInput, root: styles.searchInputRoot}}
          radius="lg"
        />
      }
      rightContent={
        <Button size="lg" className={tableStyles.newEntryButton} onClick={newEntryHandler}>
          {formatMessage({defaultMessage: 'New Entry'})}
        </Button>
      }
      className={tableStyles.settingGroupContent}>
      {filteredEntryList.length > 0 ? (
        <KeywordsTable
          entryList={filteredEntryList}
          showColorColumn={showColorColumn}
          colorColumn={colorColumn}
          updateHandler={updateHandler}
          deleteHandler={deleteHandler}
          keywordInputRefCallback={focusInputRefCallback}
          currentChannel={currentChannel}
          onPaste={handlePaste}
        />
      ) : entryList.length > 0 ? (
        <Text className={tableStyles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No keywords match your search.'})}
        </Text>
      ) : (
        <Text className={tableStyles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No keywords found, start by adding a new entry.'})}
        </Text>
      )}
    </Panel>
  );
}

export default SettingKeywords;
