/* eslint-disable indent */
import React from 'react';
import Table from 'rsuite/lib/Table/index.js';
import Button from 'rsuite/lib/Button/index.js';
import Icon from 'rsuite/lib/Icon/index.js';

const {Column, HeaderCell, Cell} = Table;

const EditCell = ({rowData, dataKey, onChange, ...props}) => {
  const editing = rowData.status === 'EDIT';
  return (
    <Cell {...props} className={editing ? 'table-content-editing' : ''}>
      {editing ? (
        <input
          className="rs-input"
          defaultValue={rowData[dataKey]}
          onChange={(event) => {
            onChange && onChange(rowData.id, dataKey, event.target.value);
          }}
        />
      ) : (
        <span className="table-content-edit-span">{rowData[dataKey]}</span>
      )}
    </Cell>
  );
};

const ActionCell = ({rowData, dataKey, onClick, ...props}) => {
  return (
    <Cell {...props} style={{padding: '6px 0'}}>
      <Button
        appearance="link"
        onClick={() => {
          onClick && onClick('edit', rowData.id);
        }}>
        {rowData.status === 'EDIT' ? <Icon icon="check-square" /> : <Icon icon="pencil" />}
      </Button>
      {rowData.status !== 'EDIT' && (
        <Button
          appearance="link"
          onClick={() => {
            onClick && onClick('delete', rowData.id);
          }}>
          <Icon icon="minus-square"></Icon>
        </Button>
      )}
    </Cell>
  );
};

function editTable({data, setData, headers}) {
  const handleChange = (id, key, value) => {
    const nextData = Object.assign([], data);
    nextData.find((item) => item.id === id)[key] = value;
    setData(nextData);
  };

  const handleDeleteState = (id) => {
    const nextData = Object.assign([], data).filter((item) => item.id !== id);
    setData(nextData);
  };

  const handleEditState = (id) => {
    const nextData = Object.assign([], data);
    const activeItem = nextData.find((item) => item.id === id);
    activeItem.status = activeItem.status ? null : 'EDIT';
    setData(nextData);
  };

  const addRow = () => {
    const newRow = {id: data.length + 1, status: 'EDIT'};
    for (const header of headers) {
      newRow[header] = '';
    }
    data.push(newRow);
    setData([...data]);
  };

  return (
    <div>
      <Table data={data} bordered style={{borderRadius: 10}} height={400}>
        {headers.map((key, index) => (
          <Column flexGrow={1} align="left" key={index}>
            <HeaderCell>{key}</HeaderCell>
            <EditCell dataKey={key} onChange={handleChange} />
          </Column>
        ))}
        <Column flexGrow={1}>
          <HeaderCell>Action</HeaderCell>
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
        Add New
      </Button>
    </div>
  );
}

export default editTable;
