import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {
  ActionIcon,
  Button,
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
import ProBadge from '@/common/components/ProBadge';
import tableStyles from '@/common/styles/SettingEntryTable.module.css';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import formatMessage from '@/i18n/index';
import {TIMER_MIN_INTERVAL_MINUTES} from '@/modules/self_bot/timers';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import Panel from './Panel';
import styles from './SettingSelfBotTimers.module.css';

const DEFAULT_TIMER_INTERVAL_MINUTES = 5;
const DEFAULT_TIMER_CHAT_LINES = 2;

function TimerNumberInput({value, min, onCommit}) {
  const [inputValue, setInputValue] = useState(String(value));

  const handleChange = useCallback(({target: {value: newValue}}) => setInputValue(newValue.replace(/\D/g, '')), []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }, []);

  const handleBlur = useCallback(() => {
    const parsedNumber = Number.parseInt(inputValue, 10);
    const newNumber = Number.isNaN(parsedNumber) ? value : Math.max(parsedNumber, min);
    setInputValue(String(newNumber));
    onCommit(newNumber);
  }, [inputValue, value, min, onCommit]);

  return (
    <TextInput
      variant="unstyled"
      classNames={{
        input: tableStyles.textInput,
        root: classNames(tableStyles.textInputRoot, styles.numberRoot),
        wrapper: tableStyles.textInputWrapper,
      }}
      value={inputValue}
      inputMode="numeric"
      placeholder={String(min)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}

function TimerRow({id, data, updateHandler, deleteHandler, messageInputRefCallback, ...props}) {
  const onUpdate = useCallback((newData) => updateHandler(id, newData), [updateHandler, id]);
  const onDelete = useCallback(() => deleteHandler(id), [deleteHandler, id]);
  const onIntervalCommit = useCallback((intervalMinutes) => onUpdate({intervalMinutes}), [onUpdate]);
  const onLinesCommit = useCallback((lines) => onUpdate({lines}), [onUpdate]);
  const messageInputRef = useCallback((ref) => messageInputRefCallback(id, ref), [messageInputRefCallback, id]);

  return (
    <TableTr {...props}>
      <TableTd className={tableStyles.dataCellMiddle}>
        <TextInput
          variant="unstyled"
          classNames={{
            input: tableStyles.textInput,
            root: classNames(tableStyles.textInputRoot, styles.messageRoot),
            wrapper: tableStyles.textInputWrapper,
          }}
          ref={messageInputRef}
          defaultValue={data.message}
          onBlur={({target: {value}}) => onUpdate({message: value})}
          placeholder={formatMessage({defaultMessage: 'Timer message'})}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, styles.intervalColumn)}>
        <TimerNumberInput
          value={data.intervalMinutes ?? DEFAULT_TIMER_INTERVAL_MINUTES}
          min={TIMER_MIN_INTERVAL_MINUTES}
          onCommit={onIntervalCommit}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, styles.linesColumn)}>
        <TimerNumberInput value={data.lines ?? 0} min={0} onCommit={onLinesCommit} />
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
  return {id: nextId, message: '', intervalMinutes: DEFAULT_TIMER_INTERVAL_MINUTES, lines: DEFAULT_TIMER_CHAT_LINES};
}

function TimersTable({entryList, updateHandler, deleteHandler, messageInputRefCallback}) {
  return (
    <Table withColumnBorders className={tableStyles.table}>
      <TableThead>
        <TableTr>
          <TableTh>{formatMessage({defaultMessage: 'Message'})}</TableTh>
          <TableTh className={styles.intervalColumn}>{formatMessage({defaultMessage: 'Interval (minutes)'})}</TableTh>
          <TableTh className={styles.linesColumn}>{formatMessage({defaultMessage: 'Chat Lines'})}</TableTh>
          <TableTh className={tableStyles.actionsColumn} />
        </TableTr>
      </TableThead>
      <TableTbody>
        {entryList.map(([id, row]) => (
          <TimerRow
            id={id}
            key={id}
            data={row}
            updateHandler={updateHandler}
            deleteHandler={deleteHandler}
            messageInputRefCallback={messageInputRefCallback}
          />
        ))}
      </TableTbody>
    </Table>
  );
}

function SettingSelfBotTimers({value, setValue}) {
  const entryList = useMemo(() => Object.entries(value ?? {}).reverse(), [value]);
  const pendingMessageFocusRef = useRef(null);
  const bttvUser = useAuthStore(useShallow((state) => state.user));

  const isPro = isUserPro(bttvUser);

  const newEntryHandler = useCallback(() => {
    if (bttvUser == null) {
      openSignInModal({}, () => newEntryHandler());
      return;
    }

    if (!isUserPro(bttvUser)) {
      openSubscriptionUpgradeModal({}, () => newEntryHandler());
      return;
    }

    const newEntry = createNewEntry();

    setValue((prevTimers) => {
      const nextTimers = {...prevTimers};
      nextTimers[newEntry.id] = newEntry;
      return nextTimers;
    });

    pendingMessageFocusRef.current = newEntry.id;
  }, [setValue, bttvUser]);

  const deleteHandler = useCallback(
    (id) => {
      setValue((prevTimers) => {
        const nextTimers = {...prevTimers};

        if (nextTimers[id] == null) {
          return prevTimers;
        }

        delete nextTimers[id];
        return nextTimers;
      });
    },
    [setValue]
  );

  const updateHandler = useCallback(
    (id, newTimerData) => {
      setValue((prevTimers) => {
        const nextTimers = {...prevTimers};
        const existingTimer = nextTimers[id];

        if (existingTimer == null) {
          return prevTimers;
        }

        nextTimers[id] = {...existingTimer, ...newTimerData};
        return nextTimers;
      });
    },
    [setValue]
  );

  const messageInputRefCallback = useCallback((id, ref) => {
    if (pendingMessageFocusRef.current !== id) {
      return;
    }

    ref?.focus();
    pendingMessageFocusRef.current = null;
  }, []);

  return (
    <Panel
      title={formatMessage({defaultMessage: 'Timers'})}
      rightContent={
        <div className={tableStyles.headerActions}>
          {!isPro ? <ProBadge /> : null}
          <Button size="lg" className={tableStyles.newEntryButton} onClick={newEntryHandler}>
            {formatMessage({defaultMessage: 'New Entry'})}
          </Button>
        </div>
      }
      className={tableStyles.settingGroupContent}>
      {entryList.length > 0 ? (
        <TimersTable
          entryList={entryList}
          updateHandler={updateHandler}
          deleteHandler={deleteHandler}
          messageInputRefCallback={messageInputRefCallback}
        />
      ) : (
        <Text className={tableStyles.emptyText} c="dimmed">
          {formatMessage({defaultMessage: 'No timers found, start by adding a new entry.'})}
        </Text>
      )}
    </Panel>
  );
}

export default SettingSelfBotTimers;
