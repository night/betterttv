import React from 'react';
import IconButton from 'rsuite/IconButton';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

export default function CloseButton(props) {
  const {onHide, ...restProps} = props;

  return (
    <div {...restProps}>
      <IconButton icon={<FontAwesomeIcon icon={faTimes} />} onClick={onHide} appearance="subtle" />
    </div>
  );
}
