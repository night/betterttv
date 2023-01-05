import React, {useRef, useEffect, useState} from 'react';

import Table from 'rsuite/Table';
import Button from 'rsuite/Button';
import IconButton from 'rsuite/IconButton';
import {Icon} from '@rsuite/icons';
import Dropdown from 'rsuite/Dropdown';
import Popover from 'rsuite/Popover';
import Whisper from 'rsuite/Whisper';

import * as faTimes from '@fortawesome/free-solid-svg-icons/faTimes';
import * as faPlus from '@fortawesome/free-solid-svg-icons/faPlus';

import classNames from 'classnames';
import styles from '../styles/table.module.css';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import formatMessage from '../../../i18n/index.js';

const {Column, HeaderCell, Cell} = Table;

export const Status = {
  HOVERING: 1,
  EDIT: 2,
};

export const Types = {
  STRING: 1,
  DROPDOWN: 2,
};

const MenuPopover = React.forwardRef(({options, onSelect, ...props}, ref) => (
  <Popover {...props} ref={ref} full>
    <Dropdown.Menu onSelect={onSelect}>
      {options.map((option) => (
        <Dropdown.Item key={option.value} eventKey={option.value}>
          {option.name}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Popover>
));

function CustomWhisper(props) {
  const triggerRef = useRef(null);

  function handleSelectMenu(eventKey) {
    const {onChange, rowData, dataKey} = props;
    onChange(rowData.id, dataKey, eventKey);

    const currentTriggerRef = triggerRef.current;
    if (currentTriggerRef != null) {
      currentTriggerRef.hide();
    }
  }

  const {children, options} = props;

  return (
    <Whisper
      placement="autoVerticalStart"
      trigger="click"
      triggerRef={triggerRef}
      speaker={<MenuPopover options={options} onSelect={(...args) => handleSelectMenu(...args)} />}>
      {children}
    </Whisper>
  );
}

function EditCell({rowData, dataKey, onChange, onMouseOver, onMouseLeave, onClick, onPaste, ...props}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    wrapperRef.current.focus();

    function handleClickOutside(event) {
      const currentWrapperRef = wrapperRef.current;
      if (currentWrapperRef == null || currentWrapperRef.contains(event.target)) {
        return;
      }
      onClick(rowData.id);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handlePasteCallback(event) {
      onPaste(event, rowData.id, dataKey);
    }
    const currentWrapperRef = wrapperRef.current;
    if (currentWrapperRef == null) {
      return null;
    }
    currentWrapperRef.addEventListener('paste', handlePasteCallback);
    return () => currentWrapperRef.removeEventListener('paste', handlePasteCallback);
  }, [wrapperRef.current]);

  return (
    <Cell {...props}>
      <input
        ref={wrapperRef}
        className={classNames({'bttv-rs-input': true}, styles.tableContentEditing)}
        defaultValue={rowData[dataKey]}
        onChange={(event) => onChange(rowData.id, dataKey, event.target.value)}
      />
    </Cell>
  );
}

function CustomCell(props) {
  const {rowData, dataKey, onChange, onMouseOver, onMouseLeave, onClick, onPaste, ...restProps} = props;

  switch (rowData.status) {
    case Status.HOVERING:
      return (
        <Cell {...restProps} onMouseLeave={() => onMouseLeave && onMouseLeave(rowData.id)}>
          <input
            className={classNames({'bttv-rs-input': true}, styles.tableContentHovering)}
            defaultValue={rowData[dataKey]}
            onClick={() => onClick(rowData.id)}
          />
        </Cell>
      );

    case Status.EDIT: {
      return <EditCell {...props} />;
    }

    default:
      return (
        <Cell {...restProps} onMouseOver={() => onMouseOver && onMouseOver(rowData.id)}>
          <p className={styles.text}>{rowData[dataKey]}</p>
        </Cell>
      );
  }
}

function ActionCell({rowData, dataKey, onClick, ...props}) {
  return (
    <Cell {...props} className={styles.actionCell}>
      <Button className={styles.action} appearance="link" onClick={() => onClick(rowData.id)}>
        <Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faTimes} />
      </Button>
    </Cell>
  );
}

function EditTable({options, setValue, value, ...props}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // why we do this: https://github.com/rsuite/rsuite/issues/1543
    setTimeout(() => {
      setData(value || {});
      setLoading(false);
    }, 300);
  }, []);

  function handleUpdateData() {
    const newData = {...data};
    setData(newData);
    setValue(newData);
  }

  function handleChange(id, key, newValue) {
    data[id][key] = newValue;
    handleUpdateData();
  }

  function handleDeleteState(id, update = true) {
    delete data[id];
    if (update) {
      handleUpdateData();
    }
  }

  function handleHoveringState(id) {
    data[id].status = data[id].status ? null : Status.HOVERING;
    handleUpdateData();
  }

  function handleEditState(id) {
    data[id].status = data[id].status !== Status.EDIT ? Status.EDIT : null;
    handleUpdateData();
  }

  function nextId() {
    const dataKeys = Object.keys(data);
    return parseInt(dataKeys[dataKeys.length - 1], 10) + 1 || 0;
  }

  function createRow() {
    const id = nextId();
    const row = {id, status: Status.EDIT};

    for (const option of options) {
      switch (option.type) {
        case Types.STRING:
          row[option.name] = '';
          break;
        case Types.DROPDOWN:
          row[option.name] = option.defaultOption;
          break;
        default:
          break;
      }
    }

    return row;
  }

  function handleAddEmptyRow() {
    const newRow = createRow();
    data[newRow.id] = newRow;
    handleUpdateData();
  }

  function handlePaste(event, id, dataKey) {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    const lines = paste
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) return;

    handleDeleteState(id, false);

    for (const line of lines) {
      const row = createRow();
      row[dataKey] = line;
      data[row.id] = row;
    }

    handleUpdateData();
  }

  const dataValues = Object.values(data);

  return (
    <>
      {dataValues.length > 0 ? (
        <Table data={dataValues} {...props} loading={loading} className={styles.table}>
          {options.map((key) => {
            switch (key.type) {
              case Types.STRING:
                return (
                  <Column flexGrow={1} align="left" key={key.name}>
                    <HeaderCell className={styles.header}>{key.header}</HeaderCell>
                    <CustomCell
                      dataKey={key.name}
                      onChange={(...args) => handleChange(...args)}
                      onMouseOver={(...args) => handleHoveringState(...args)}
                      onMouseLeave={(...args) => handleHoveringState(...args)}
                      onClick={(...args) => handleEditState(...args)}
                      onPaste={(...args) => handlePaste(...args)}
                    />
                  </Column>
                );
              case Types.DROPDOWN:
                return (
                  <Column key={key.name}>
                    <HeaderCell className={styles.header}>{key.header}</HeaderCell>
                    <Cell className={styles.dropdown}>
                      {(rowData) => (
                        <CustomWhisper
                          dataKey={key.name}
                          rowData={rowData}
                          options={key.options}
                          onChange={(...args) => handleChange(...args)}>
                          <Button appearance="subtle">
                            {key.options.find((option) => option.value === rowData.type).name}
                          </Button>
                        </CustomWhisper>
                      )}
                    </Cell>
                  </Column>
                );
              default:
                return null;
            }
          })}
          <Column>
            <HeaderCell />
            <ActionCell dataKey="id" onClick={(...args) => handleDeleteState(...args)} />
          </Column>
        </Table>
      ) : null}
      <IconButton
        appearance="primary"
        onClick={() => handleAddEmptyRow()}
        loading={loading}
        className={styles.button}
        icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faPlus} />}>
        {formatMessage({defaultMessage: 'Add New'})}
      </IconButton>
    </>
  );
}

export default EditTable;
