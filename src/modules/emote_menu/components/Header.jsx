import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Input from 'rsuite/lib/Input/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';

export default function Header({value, onChange, onHide, ...restProps}) {
  return (
    <div {...restProps}>
      <InputGroup inside>
        <InputGroup.Addon>
          <Icon icon="search" />
        </InputGroup.Addon>
        <Input placeholder="Search for Emotes" value={value} onChange={onChange} />
      </InputGroup>
      <IconButton icon={<Icon icon="close" />} appearance="subtle" onClick={onHide} />
    </div>
  );
}
