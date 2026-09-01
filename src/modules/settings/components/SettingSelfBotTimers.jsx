import {faCircleInfo, faTrash} from '@fortawesome/free-solid-svg-icons';
import {
  ActionIcon,
  Button,
  Checkbox,
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
import {openModal, openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import formatMessage from '@/i18n/index';
import {TIMER_MAX_INTERVAL_MINUTES, TIMER_MIN_CHAT_LINES, TIMER_MIN_INTERVAL_MINUTES} from '@/modules/self_bot/timers';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import Panel from './Panel';
import styles from './SettingSelfBotTimers.module.css';

const DEFAULT_TIMER_INTERVAL_MINUTES = 5;
const DEFAULT_TIMER_CHAT_LINES = 2;

function ChatLinesGuideModalBody() {
  return (
    <div className={styles.chatLinesModalBody}>
      <Text size="md" c="dimmed">
        {formatMessage({
          defaultMessage:
            'Chat lines sets how many messages other people must send between timer posts. It keeps a timer from posting into a dead chat.',
        })}
      </Text>
      <Text size="md" c="dimmed">
        {formatMessage({
          defaultMessage:
            'If the interval passes without enough messages, the timer waits and posts once chat picks back up.',
        })}
      </Text>
    </div>
  );
}

function openChatLinesGuideModal() {
  return openModal({
    title: formatMessage({defaultMessage: 'Chat Lines'}),
    children: <ChatLinesGuideModalBody />,
  });
}

function formatIntervalDisplay(intervalMinutes) {
  if (intervalMinutes % 60 === 0) {
    return formatMessage(
      {defaultMessage: 'Every {hours, plural, one {hour} other {# hours}}'},
      {hours: intervalMinutes / 60}
    );
  }

  return formatMessage(
    {defaultMessage: 'Every {minutes, plural, one {minute} other {# minutes}}'},
    {minutes: intervalMinutes}
  );
}

function TimerNumberInput({value, min, max = Infinity, onCommit, formatValue, unitLabel}) {
  const [inputValue, setInputValue] = useState(String(value));
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(({target: {value: newValue}}) => setInputValue(newValue.replace(/\D/g, '')), []);

  const handleFocus = useCallback(() => setFocused(true), []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }, []);

  const handleBlur = useCallback(() => {
    const parsedNumber = Number.parseInt(inputValue, 10);
    const newNumber = Number.isNaN(parsedNumber) ? value : Math.min(Math.max(parsedNumber, min), max);
    setInputValue(String(newNumber));
    setFocused(false);
    onCommit(newNumber);
  }, [inputValue, value, min, max, onCommit]);

  const displayValue = !focused && formatValue != null ? formatValue(Number.parseInt(inputValue, 10)) : inputValue;

  return (
    <TextInput
      variant="unstyled"
      classNames={{
        input: tableStyles.textInput,
        root: classNames(tableStyles.textInputRoot, styles.numberRoot),
        wrapper: tableStyles.textInputWrapper,
      }}
      value={displayValue}
      inputMode="numeric"
      placeholder={String(min)}
      rightSection={
        focused && unitLabel != null ? (
          <Text size="md" c="dimmed">
            {unitLabel}
          </Text>
        ) : null
      }
      rightSectionWidth={64}
      rightSectionPointerEvents="none"
      rightSectionProps={{className: styles.unitSection}}
      onChange={handleChange}
      onFocus={handleFocus}
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
  const handleEnabledChange = useCallback(({target: {checked}}) => onUpdate({enabled: checked}), [onUpdate]);
  const messageInputRef = useCallback((ref) => messageInputRefCallback(id, ref), [messageInputRefCallback, id]);

  return (
    <TableTr {...props}>
      <TableTd className={classNames(tableStyles.dataCellMiddle, tableStyles.toggleColumn)}>
        <label className={tableStyles.toggleCell}>
          <Checkbox
            classNames={{root: tableStyles.toggleCheckbox, body: tableStyles.toggleCheckboxBody}}
            radius="md"
            checked={data.enabled !== false}
            onChange={handleEnabledChange}
          />
        </label>
      </TableTd>
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
          placeholder={formatMessage({defaultMessage: 'Join our discord! discord.gg/nightdev'})}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, styles.intervalColumn)}>
        <TimerNumberInput
          value={data.intervalMinutes ?? DEFAULT_TIMER_INTERVAL_MINUTES}
          min={TIMER_MIN_INTERVAL_MINUTES}
          max={TIMER_MAX_INTERVAL_MINUTES}
          formatValue={formatIntervalDisplay}
          unitLabel={formatMessage({defaultMessage: 'minutes'})}
          onCommit={onIntervalCommit}
        />
      </TableTd>
      <TableTd className={classNames(tableStyles.dataCellMiddle, styles.linesColumn)}>
        <TimerNumberInput
          value={data.lines ?? DEFAULT_TIMER_CHAT_LINES}
          min={TIMER_MIN_CHAT_LINES}
          onCommit={onLinesCommit}
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
  return {
    id: nextId,
    message: '',
    intervalMinutes: DEFAULT_TIMER_INTERVAL_MINUTES,
    lines: DEFAULT_TIMER_CHAT_LINES,
    enabled: true,
  };
}

function TimersTable({entryList, updateHandler, deleteHandler, messageInputRefCallback}) {
  return (
    <Table withColumnBorders className={tableStyles.table}>
      <TableThead>
        <TableTr>
          <TableTh className={tableStyles.toggleColumn} />
          <TableTh>{formatMessage({defaultMessage: 'Message'})}</TableTh>
          <TableTh className={styles.intervalColumn}>{formatMessage({defaultMessage: 'Interval'})}</TableTh>
          <TableTh className={styles.linesColumn}>
            <div className={styles.linesHeader}>
              {formatMessage({defaultMessage: 'Chat Lines'})}
              <ActionIcon
                size="sm"
                variant="transparent"
                className={styles.infoButton}
                aria-label={formatMessage({defaultMessage: 'About chat lines'})}
                onClick={openChatLinesGuideModal}>
                <Icon icon={faCircleInfo} />
              </ActionIcon>
            </div>
          </TableTh>
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
