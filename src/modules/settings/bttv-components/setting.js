import React, {useEffect, useState} from 'react';
import EditTable from './editTable.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import Dropdown from 'rsuite/lib/Dropdown/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import Checkbox from 'rsuite/lib/Checkbox/index.js';
import Slider from 'rsuite/lib/Slider/index.js';
import Radio from 'rsuite/lib/Radio/index.js';
import RadioGroup from 'rsuite/lib/RadioGroup/index.js';
import FormGroup from 'rsuite/lib/FormGroup/index.js';

function Setting({props}) {
  const {description} = props;
  return (
    <div>
      <p>{description}</p>
      <br />
      {getSetting(props)}
    </div>
  );
}

function getSetting(props) {
  console.log(props);
  const {type, options, data: d, headers, enabled, selected: s} = props;
  const [data, setData] = useState(d);
  const [enable, setEnabled] = useState(enabled);
  const [selected, setSelect] = useState(s);

  useEffect(() => {
    console.log('Shoot an update for setting');
  }, [data, enable, selected]);

  switch (type) {
    case 0:
      return <Toggle defaultChecked={enable} onChange={(state) => setEnabled(state)} />;
    case 1:
      const items = options.map((option, index) => (
        <Dropdown.Item key={index} onSelect={() => setSelect(index)}>
          {option}
        </Dropdown.Item>
      ));
      return (
        <Dropdown
          className="bttv-setting-dropdown"
          title={options[selected]}
          trigger={['click', 'hover']}
          renderTitle={(children) => {
            return (
              <IconButton appearance="primary" icon={<Icon icon="down" />}>
                {children}
              </IconButton>
            );
          }}>
          {items}
        </Dropdown>
      );
    case 2:
      const items2 = options.map((option, index) => (
        <Checkbox key={index} defaultChecked={selected.includes(index)}>
          {option}
        </Checkbox>
      ));
      return <div>{items2}</div>;
    case 3:
      return (
        <div>
          <EditTable headers={headers} data={data} setData={setData} />
        </div>
      );
    case 4:
      return (
        <div>
          <Slider min={data.min} max={data.max} defaultValue={data.current} progress></Slider>
        </div>
      );
    case 5:
      return (
        <FormGroup controlId="radioList">
          <RadioGroup
            name="radioList"
            defaultValue={selected}
            onChange={(value) => {
              setSelect(value);
            }}>
            {options.map((option, index) => (
              <Radio key={index} value={index} onChange={() => setSelect(index)}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
        </FormGroup>
      );
    default:
      throw new Error(`${type} is an unknown setting type.`);
  }
}

export default Setting;
