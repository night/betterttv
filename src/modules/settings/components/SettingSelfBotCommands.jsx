import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {
  ActionIcon,
  Button,
  NativeSelect,
  Pill,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  TextInput,
} from '@mantine/core';
import classNames from 'classnames';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import tableStyles from '@/common/styles/SettingEntryTable.module.css';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import formatMessage from '@/i18n/index';
import {SelfBotUserLevels} from '@/modules/self_bot/commands';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import Panel from './Panel';
import styles from './SettingSelfBotCommands.module.css';

const FREE_COMMAND_LIMIT = 5;

function CommandRow({id, data, updateHandler, deleteHandler, commandInputRefCallback, ...props}) {
  const onUpdate = useCallback((newData) => updateHandler(id, newData), [updateHandler, id]);
  const onDelete = useCallback(() => deleteHandler(id), [deleteHandler, id]);
  const commandInputRef = useCallback((ref) => commandInputRefCallback(id, ref), [commandInputRefCallback, id]);

  const userLevel = data.userLevel ?? SelfBotUserLevels.EVERYONE;

  return (
    <TableTr {...props}>
      <TableTd className={classNames(tableStyles.dataCellMiddle, styles.commandColumn)}>
        <TextInput
          variant="unstyled"
          classNames={{
            input: tableStyles.textInput,
            root: classNames(tableStyles.textInputRoot, styles.commandRoot),
            wrapper: tableStyles.textInputWrapper,
          }}
          ref={commandInputRef}
          defaultValue={data.command}
          onBlur={({target: {value}}) => onUpdate({command: value})}
          placeholder={formatMessage({defaultMessage: '!command'})}
        />
      </TableTd>
      <TableTd className={tableStyles.dataCellMiddle}>
        <TextInput
          variant="unstyled"
          classNames={{
            input: tableStyles.textInput,
            root: classNames(tableStyles.textInputRoot, styles.responseRoot),
            wrapper: tableStyles.textInputWrapper,
          }}
          defaultValue={data.response}
          onBlur={({target: {value}}) => onUpdate({response: value})}
          placeholder={formatMessage({defaultMessage: 'Response message'})}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, tableStyles.selectColumn, styles.userLevelColumn)}>
        <NativeSelect
          variant="unstyled"
          classNames={{input: tableStyles.selectInput}}
          value={userLevel}
          data={[
            {label: formatMessage({defaultMessage: 'Everyone'}), value: SelfBotUserLevels.EVERYONE},
            {label: formatMessage({defaultMessage: 'VIP'}), value: SelfBotUserLevels.VIP},
            {label: formatMessage({defaultMessage: 'Subscriber'}), value: SelfBotUserLevels.SUBSCRIBER},
            {label: formatMessage({defaultMessage: 'Moderator'}), value: SelfBotUserLevels.MOD},
          ]}
          size="lg"
          onChange={({target: {value}}) => onUpdate({userLevel: Number.parseInt(value, 10)})}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, tableStyles.actionsColumn)}>
        <ActionIcon
          color="gray"
          variant="transparent"
          className={tableStyles.actionIcon}
          size="sm"
          classNames={{icon: tableStyles.actionIconIcon}}
          onClick={onDelete}>
          <Icon icon={faTrash} />
        </ActionIcon>
      </TableTd>
    </TableTr>
  );
}

function createNewEntry() {
  const nextId = crypto.randomUUID();
  return {id: nextId, command: '', response: '', userLevel: SelfBotUserLevels.EVERYONE};
}

function CommandsTable({entryList, updateHandler, deleteHandler, commandInputRefCallback}) {
  return (
    <Table withColumnBorders className={tableStyles.table}>
      <TableThead>
        <TableTr>
          <TableTh className={styles.commandColumn}>{formatMessage({defaultMessage: 'Command'})}</TableTh>
          <TableTh>{formatMessage({defaultMessage: 'Response'})}</TableTh>
          <TableTh className={styles.userLevelColumn}>{formatMessage({defaultMessage: 'User Level'})}</TableTh>
          <TableTh className={tableStyles.actionsColumn} />
        </TableTr>
      </TableThead>
      <TableTbody>
        {entryList.map(([id, row]) => (
          <CommandRow
            id={id}
            key={id}
            data={row}
            updateHandler={updateHandler}
            deleteHandler={deleteHandler}
            commandInputRefCallback={commandInputRefCallback}
          />
        ))}
      </TableTbody>
    </Table>
  );
}

function SettingSelfBotCommands({value, setValue}) {
  const [search, setSearch] = useState('');
  const entryList = useMemo(() => Object.entries(value ?? {}).reverse(), [value]);
  const pendingCommandFocusRef = useRef(null);
  const bttvUser = useAuthStore(useShallow((state) => state.user));

  const commandCount = entryList.length;
  const isPro = isUserPro(bttvUser);

  const filteredEntryList = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) {
      return entryList;
    }
    return entryList.filter(([, row]) => row.command.toLowerCase().includes(query));
  }, [entryList, search]);

  const newEntryHandler = useCallback(() => {
    const commandCount = Object.keys(value ?? {}).length;

    if (commandCount >= FREE_COMMAND_LIMIT) {
      if (bttvUser == null) {
        openSignInModal({}, () => newEntryHandler());
        return;
      }

      if (!isUserPro(bttvUser)) {
        openSubscriptionUpgradeModal({}, () => newEntryHandler());
        return;
      }
    }

    setSearch('');
    const newEntry = createNewEntry();

    setValue((prevCommands) => {
      const nextCommands = {...prevCommands};
      nextCommands[newEntry.id] = newEntry;
      return nextCommands;
    });

    pendingCommandFocusRef.current = newEntry.id;
  }, [setValue, value, bttvUser]);

  const deleteHandler = useCallback(
    (id) => {
      setValue((prevCommands) => {
        const nextCommands = {...prevCommands};

        if (nextCommands[id] == null) {
          return prevCommands;
        }

        delete nextCommands[id];
        return nextCommands;
      });
    },
    [setValue]
  );

  const updateHandler = useCallback(
    (id, newCommandData) => {
      setValue((prevCommands) => {
        const nextCommands = {...prevCommands};
        const existingCommand = nextCommands[id];

        if (existingCommand == null) {
          return prevCommands;
        }

        nextCommands[id] = {...existingCommand, ...newCommandData};
        return nextCommands;
      });
    },
    [setValue]
  );

  const commandInputRefCallback = useCallback((id, ref) => {
    if (pendingCommandFocusRef.current !== id) {
      return;
    }

    ref?.focus();
    pendingCommandFocusRef.current = null;
  }, []);

  return (
    <Panel
      title={
        <TextInput
          size="lg"
          value={search}
          placeholder={formatMessage({defaultMessage: 'Search commands...'})}
          onChange={({target: {value: searchValue}}) => setSearch(searchValue)}
          classNames={{input: styles.searchInput, root: styles.searchInputRoot}}
          radius="lg"
        />
      }
      rightContent={
        <div className={styles.headerActions}>
          {!isPro ? (
            <Pill size="lg" className={styles.limitPill}>
              {formatMessage(
                {defaultMessage: 'Entry {count} / {limit}'},
                {count: commandCount, limit: FREE_COMMAND_LIMIT}
              )}
            </Pill>
          ) : null}
          <Button size="lg" className={tableStyles.newEntryButton} onClick={newEntryHandler}>
            {formatMessage({defaultMessage: 'New Entry'})}
          </Button>
        </div>
      }
      className={tableStyles.settingGroupContent}>
      {filteredEntryList.length > 0 ? (
        <CommandsTable
          entryList={filteredEntryList}
          updateHandler={updateHandler}
          deleteHandler={deleteHandler}
          commandInputRefCallback={commandInputRefCallback}
        />
      ) : entryList.length > 0 ? (
        <Text className={tableStyles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No commands match your search.'})}
        </Text>
      ) : (
        <Text className={tableStyles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No commands found, start by adding a new entry.'})}
        </Text>
      )}
    </Panel>
  );
}

export default SettingSelfBotCommands;
