import {CloseButton, SegmentedControl, TextInput} from '@mantine/core';
import {useMergedRef} from '@mantine/hooks';
import classNames from 'classnames';
import React, {useCallback, useRef} from 'react';
import LogoIcon from '@/common/components/LogoIcon';
import {EmoteMenuModes} from '@/constants';
import formatMessage from '@/i18n/index';
import settings from '@/modules/settings/index';
import styles from './Header.module.css';
import Icons from './Icons';

const MODE_CONTROL_DATA = [
  {
    value: EmoteMenuModes.EMOTES,
    label: (
      <div className={styles.modeLabel} aria-label={formatMessage({defaultMessage: 'Emotes'})}>
        {Icons.SMILE}
      </div>
    ),
  },
  {
    value: EmoteMenuModes.GIFS,
    label: (
      <div className={styles.modeLabel} aria-label={formatMessage({defaultMessage: 'GIFs'})}>
        {Icons.GIF}
      </div>
    ),
  },
];

function Header({
  value,
  opened,
  onChange,
  toggleWhisper,
  selected,
  className,
  focusRef,
  mode,
  gifsAvailable,
  onModeChange,
  ...props
}) {
  const inputRef = useRef(null);
  const mergedInputRef = useMergedRef(focusRef, inputRef);

  const handleLogoClick = useCallback(() => {
    settings.openSettings();
    toggleWhisper();
  }, [toggleWhisper]);

  const handleModeChange = useCallback(
    (newMode) => {
      onModeChange(newMode);
      inputRef.current?.focus();
    },
    [onModeChange]
  );

  let placeholder = selected == null ? formatMessage({defaultMessage: 'Search for Emotes'}) : selected.code;
  if (mode === EmoteMenuModes.GIFS) {
    placeholder = formatMessage({defaultMessage: 'Search GIPHY'});
  }

  return (
    <div className={classNames(styles.header, className)} {...props}>
      <button color="primary" variant="subtle" className={styles.logoButton} onClick={handleLogoClick}>
        <LogoIcon className={styles.logoIcon} />
      </button>
      <TextInput
        ref={mergedInputRef}
        size="md"
        placeholder={placeholder}
        value={value}
        onChange={({target: {value}}) => onChange(value)}
        radius="md"
        classNames={{input: styles.input, root: styles.root}}
      />
      {gifsAvailable ? (
        <SegmentedControl
          size="xs"
          radius="md"
          value={mode}
          onChange={handleModeChange}
          classNames={{
            root: styles.modeControl,
            label: styles.modeControlLabel,
            indicator: styles.modeControlIndicator,
          }}
          data={MODE_CONTROL_DATA}
        />
      ) : null}
      <CloseButton className={styles.closeButton} size="lg" onClick={toggleWhisper} />
    </div>
  );
}

export default React.memo(
  Header,
  (oldProps, newProps) =>
    oldProps.value === newProps.value &&
    oldProps.selected === newProps.selected &&
    newProps.toggleWhisper === oldProps.toggleWhisper &&
    newProps.opened === oldProps.opened &&
    newProps.mode === oldProps.mode &&
    newProps.gifsAvailable === oldProps.gifsAvailable &&
    newProps.onModeChange === oldProps.onModeChange
);
