/* eslint-disable indent */
import React from 'react';
import Table from 'rsuite/lib/Table/index.js';
import Button from 'rsuite/lib/Button/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import Dropdown from 'rsuite/lib/Dropdown/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import Whisper from 'rsuite/lib/Whisper/index.js';

import check from '../../../assets/icons/check-square-solid.svg';
import minus from '../../../assets/icons/minus-square-solid.svg';

let tableBody;
const {Column, HeaderCell, Cell} = Table;

const Menu = ({onSelect, options}) => (
  <Dropdown.Menu onSelect={onSelect}>
    {options.map((option, index) => (
      <Dropdown.Item key={index} eventKey={index}>
        {option}
      </Dropdown.Item>
    ))}
  </Dropdown.Menu>
);

const MenuPopover = ({options, onSelect, ...rest}) => (
  <Popover {...rest} full>
    <Menu options={options} onSelect={onSelect} />
  </Popover>
);

class CustomWhisper extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelectMenu = this.handleSelectMenu.bind(this);
  }
  handleSelectMenu(eventKey, event) {
    const {onChange, rowData, dataKey} = this.props;
    onChange(rowData.id, dataKey, eventKey);
    this.trigger.hide();
  }
  render() {
    return (
      <Whisper
        placement="autoVerticalStart"
        trigger="click"
        triggerRef={(ref) => {
          this.trigger = ref;
        }}
        container={() => {
          return tableBody;
        }}
        speaker={<MenuPopover options={this.props.options} onSelect={this.handleSelectMenu} />}>
        {this.props.children}
      </Whisper>
    );
  }
}

const EditCell = ({rowData, dataKey, onChange, onMouseOver, onMouseLeave, onClick, ...props}) => {
  const editing = rowData.status === 'EDIT';

  if (rowData.status === 'HOVERING')
    return (
      <Cell {...props} className={'table-content-editing'}>
        <input
          className="rs-input"
          style={{top: 7, height: 30, opacity: 0.5}}
          defaultValue={rowData[dataKey]}
          onMouseLeave={() => onMouseLeave && onMouseLeave('hovering', rowData.id)}
          onClick={() => {
            onClick && onClick('edit', rowData.id);
          }}
        />
      </Cell>
    );

  return (
    <Cell {...props} className={editing ? 'table-content-editing' : ''}>
      {editing ? (
        <input
          className="rs-input"
          style={{top: 7, height: 30}}
          defaultValue={rowData[dataKey]}
          onChange={(event) => {
            onChange && onChange(rowData.id, dataKey, event.target.value);
          }}
        />
      ) : (
        <span
          className="table-content-edit-span"
          style={{width: '100%'}}
          onMouseOver={() => onMouseOver && onMouseOver('hovering', rowData.id)}>
          {rowData[dataKey]}
        </span>
      )}
    </Cell>
  );
};

const ActionCell = ({rowData, dataKey, onClick, ...props}) => {
  return (
    <Cell {...props} style={{padding: '6px 0'}}>
      {rowData.status === 'EDIT' ? (
        <Button
          appearance="link"
          onClick={() => {
            onClick && onClick('edit', rowData.id);
          }}>
          <Icon icon={check} />
        </Button>
      ) : (
        <Button
          appearance="link"
          onClick={() => {
            onClick && onClick('delete', rowData.id);
          }}>
          <Icon icon={minus} />
        </Button>
      )}
    </Cell>
  );
};

function editTable({options, setData, data}) {
  const handleChange = (id, key, value) => {
    const nextData = Object.assign([], data);
    nextData.find((item) => item.id === id)[key] = value;
    setData(nextData);
  };

  const handleDeleteState = (id) => {
    const nextData = Object.assign([], data).filter((item) => item.id !== id);
    setData(nextData);
  };

  const handleHoveringState = (id) => {
    const nextData = Object.assign([], data);
    const activeItem = nextData.find((item) => item.id === id);
    activeItem.status = activeItem.status ? null : 'HOVERING';
    setData(nextData);
  };

  const handleEditState = (id) => {
    const nextData = Object.assign([], data);
    const activeItem = nextData.find((item) => item.id === id);
    activeItem.status = activeItem.status !== 'EDIT' ? 'EDIT' : null;
    setData(nextData);
  };

  const addRow = () => {
    const newRow = {id: data.length + 2, status: 'EDIT'};
    for (const header of options.headers) {
      switch (header.type) {
        case 'string':
          newRow[header.name] = '';
          break;
        case 'dropdown':
          newRow[header.name] = header.defaultOption;
          break;
        default:
          break;
      }
    }
    data.push(newRow);
    setData([...data]);
  };

  return (
    <div>
      <Table
        data={data}
        bordered
        autoHeight
        style={{borderRadius: 10}}
        height={46}
        showHeader={false}
        renderEmpty={() => null}>
        {options.headers.map((key, index) => {
          if (key.type === 'string')
            return (
              <Column flexGrow={1} align="left" key={index}>
                <HeaderCell>{key.name}</HeaderCell>
                <EditCell
                  dataKey={key.name}
                  onChange={handleChange}
                  onMouseOver={(type, id) => handleHoveringState(id)}
                  onMouseLeave={(type, id) => handleHoveringState(id)}
                  onClick={(type, id) => handleEditState(id)}
                />
              </Column>
            );

          return (
            <Column flexGrow={1} style={{padding: 4}} key={index}>
              <HeaderCell />
              <Cell>
                {(rowData) => (
                  <CustomWhisper dataKey={key.name} rowData={rowData} options={key.options} onChange={handleChange}>
                    <Button appearance="subtle">{key.options[rowData[key.name]]}</Button>
                  </CustomWhisper>
                )}
              </Cell>
            </Column>
          );
        })}

        <Column flexGrow={1}>
          <HeaderCell />
          <ActionCell
            dataKey="id"
            onClick={(type, id) => {
              switch (type) {
                case 'delete':
                  handleDeleteState(id);
                  break;
                case 'edit':
                  handleEditState(id);
                  break;
              }
            }}
          />
        </Column>
      </Table>
      <br />
      <Button appearance="primary" active onClick={addRow}>
        Add Row
      </Button>
    </div>
  );
}

export default editTable;
