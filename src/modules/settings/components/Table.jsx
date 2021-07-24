import React, {useRef, useEffect, useState} from 'react';

import Table from 'rsuite/lib/Table/index.js';
import Button from 'rsuite/lib/Button/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import Dropdown from 'rsuite/lib/Dropdown/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import Whisper from 'rsuite/lib/Whisper/index.js';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';

import classNames from 'classnames';
import styles from '../styles/table.module.css';

const {Column, HeaderCell, Cell} = Table;

export const Status = {
  HOVERING: 1,
  EDIT: 2,
};

export const Types = {
  STRING: 1,
  DROPDOWN: 2,
};

function Menu({onSelect, options}) {
  return (
    <Dropdown.Menu onSelect={onSelect}>
      {options.map((option) => (
        <Dropdown.Item key={option.value} eventKey={option.value}>
          {option.name}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );
}

function MenuPopover({options, onSelect, ...rest}) {
  return (
    <Popover {...rest} full>
      <Menu options={options} onSelect={onSelect} />
    </Popover>
  );
}

function CustomWhisper(props) {
  const trigger = useRef(null);

  function handleSelectMenu(eventKey) {
    const {onChange, rowData, dataKey} = props;
    onChange(rowData.id, dataKey, eventKey);
    trigger.current.hide();
  }

  const {children, options} = props;

  return (
    <Whisper
      placement="autoVerticalStart"
      trigger="click"
      triggerRef={trigger}
      speaker={<MenuPopover options={options} onSelect={handleSelectMenu} />}>
      {children}
    </Whisper>
  );
}

function useOutsideAlerter(ref, onClick, rowData) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClick(rowData.id);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
  }, [ref]);
}

function EditCell({rowData, dataKey, onChange, onMouseOver, onMouseLeave, onClick, ...props}) {
  switch (rowData.status) {
    case Status.HOVERING:
      return (
        <Cell {...props} onMouseLeave={() => onMouseLeave && onMouseLeave(rowData.id)}>
          <input
            className={classNames({'bttv-rs-input': true}, styles.tableContentHovering)}
            defaultValue={rowData[dataKey]}
            onClick={() => onClick(rowData.id)}
          />
        </Cell>
      );

    case Status.EDIT: {
      const wrapperRef = useRef(null);
      useOutsideAlerter(wrapperRef, onClick, rowData);
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

    default:
      return (
        <Cell {...props} onMouseOver={() => onMouseOver && onMouseOver(rowData.id)}>
          <p className={styles.text}>{rowData[dataKey]}</p>
        </Cell>
      );
  }
}

function ActionCell({rowData, dataKey, onClick, ...props}) {
  return (
    <Cell {...props} className={styles.actionCell}>
      <Button className={styles.action} appearance="link" onClick={() => onClick(rowData.id)}>
        <Icon>
          <FontAwesomeIcon icon={faTimes} />
        </Icon>
      </Button>
    </Cell>
  );
}

function EditTable({options, setValue, value, ...props}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // why we do this: https://github.com/rsuite/rsuite/issues/1543
    setTimeout(() => {
      setData(value || {});
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (loading) return;
    setValue(data);
  }, [data]);

  function handleChange(id, key, newValue) {
    data[id][key] = newValue;
    setData({...data});
  }

  function handleDeleteState(id) {
    delete data[id];
    setData({...data});
  }

  function handleHoveringState(id) {
    data[id].status = data[id].status ? null : Status.HOVERING;
    setData({...data});
  }

  function handleEditState(id) {
    data[id].status = data[id].status !== Status.EDIT ? Status.EDIT : null;
    setData({...data});
  }

  function nextId() {
    return parseInt(Object.keys(data)[Object.keys(data).length - 1], 10) + 1 || 0;
  }

  function addRow() {
    const id = nextId();
    const newRow = {id, status: Status.EDIT};
    for (const header of options) {
      switch (header.type) {
        case Types.STRING:
          newRow[header.name] = '';
          break;
        case Types.DROPDOWN:
          newRow[header.name] = header.defaultOption;
          break;
        default:
          break;
      }
    }
    data[id] = newRow;
    setData({...data});
  }

  return (
    <>
      {Object.values(data).length > 0 && (
        <Table data={Object.values(data)} {...props} loading={loading} className={styles.table}>
          {options.map((key) => {
            switch (key.type) {
              case Types.STRING:
                return (
                  <Column flexGrow={1} align="left" key={key.name}>
                    <HeaderCell className={styles.header}>{key.header}</HeaderCell>
                    <EditCell
                      dataKey={key.name}
                      onChange={handleChange}
                      onMouseOver={handleHoveringState}
                      onMouseLeave={handleHoveringState}
                      onClick={handleEditState}
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
                          onChange={handleChange}>
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
            <ActionCell dataKey="id" onClick={handleDeleteState} />
          </Column>
        </Table>
      )}
      <IconButton
        appearance="primary"
        onClick={addRow}
        loading={loading}
        className={styles.button}
        icon={
          <Icon>
            <FontAwesomeIcon icon={faPlus} />
          </Icon>
        }>
        Add New
      </IconButton>
    </>
  );
}

export default EditTable;
