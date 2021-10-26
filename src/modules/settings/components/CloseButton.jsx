import React from 'react';
import {Icon} from '@rsuite/icons';
import IconButton from 'rsuite/IconButton';
import * as faTimes from '@fortawesome/free-solid-svg-icons/faTimes';
import FontAwesomeSvgIcon from '../../emote_menu/components/FontAwesomeSvgIcon.jsx';

export default function CloseButton(props) {
  const {onHide, ...restProps} = props;

  return (
    <div {...restProps}>
      <IconButton
        icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faTimes} />}
        onClick={onHide}
        appearance="subtle"
      />
    </div>
  );
}
