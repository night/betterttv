import React, {useCallback} from 'react';
import {Avatar, TagsInput, Text} from '@mantine/core';
import styles from './SettingTagInput.module.css';
import SettingWrapper from './SettingWrapper.jsx';
import usePortalRef from '../../../common/hooks/PortalRef.jsx';
import useCurrentChannel from '../../../common/hooks/CurrentChannel.jsx';

function SettingTagInput({name, description, value, onChange, placeholder, withCurrentChannel, ...props}) {
  const portalRef = usePortalRef();
  const currentChannel = useCurrentChannel();

  const renderOption = useCallback(
    () => (
      <div className={styles.channelOption}>
        <Avatar src={currentChannel.avatar} size={32} radius="xl" />
        <Text size="md">{currentChannel.displayName}</Text>
      </div>
    ),
    [currentChannel]
  );

  return (
    <SettingWrapper reverse wrap name={name} description={description} {...props}>
      <TagsInput
        size="lg"
        radius="lg"
        value={value || []}
        onChange={onChange}
        placeholder={placeholder}
        withAsterisk={false}
        className={styles.tagsInput}
        classNames={{input: styles.input, pill: styles.pill}}
        data={currentChannel && withCurrentChannel ? [currentChannel.displayName] : []}
        renderOption={renderOption}
        comboboxProps={{radius: 'lg', size: 'lg', portalProps: {target: portalRef.current}}}
      />
    </SettingWrapper>
  );
}

export default SettingTagInput;
