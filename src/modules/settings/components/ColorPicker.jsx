import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {ActionIcon, ColorInput, ColorPicker as MantineColorPicker, Popover} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classNames from 'classnames';
import React from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n';
import styles from './ColorPicker.module.css';

function ColorPicker({value, defaultValue, placeholder, onChange, onChangeEnd, className, children, ...props}) {
  const [opened, {open, close}] = useDisclosure(false);
  const displayValue = value ?? defaultValue ?? '#000000';
  const portalRef = usePortalRef();
  const {refs, context} = useFloating({open: opened, onOpenChange: close});

  // This is required as we're rendering the popover in a shadow DOM
  const dismiss = useDismiss(context, {
    outsidePress: (event) => {
      const path = event.composedPath();
      return !path.includes(refs.floating.current) && !path.includes(refs.reference.current);
    },
  });

  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);

  const target =
    children != null ? (
      <div className={styles.customTarget} onClick={open}>
        {children}
      </div>
    ) : (
      <ActionIcon
        variant="default"
        radius="xl"
        size="xl"
        className={classNames(styles.swatchButton, className)}
        onClick={open}
        aria-label={formatMessage({defaultMessage: 'Pick Color'})}
        {...props}>
        <span className={styles.swatch} style={{backgroundColor: displayValue}} />
      </ActionIcon>
    );

  return (
    <Popover
      radius="lg"
      opened={opened}
      shadow="lg"
      onChange={(isOpen) => isOpen || close()}
      position="bottom-start"
      width={400}
      closeOnClickOutside={false}
      classNames={{dropdown: styles.popoverDropdown, root: styles.popoverRoot}}
      portalProps={{target: portalRef.current}}>
      <Popover.Target ref={refs.reference} {...getReferenceProps()}>
        {target}
      </Popover.Target>
      <Popover.Dropdown ref={refs.floating} {...getFloatingProps()}>
        <MantineColorPicker
          value={displayValue}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          format="hex"
          size="lg"
          fullWidth
          classNames={{body: styles.colorPickerBody, saturation: styles.saturation}}
        />
        <ColorInput
          value={displayValue}
          placeholder={placeholder}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          format="hex"
          size="xl"
          radius="md"
          withPicker={false}
          leftSection={
            <span
              className={classNames(styles.swatch, styles.swatchLeftSection)}
              style={{backgroundColor: displayValue}}
            />
          }
          classNames={{input: styles.colorInput}}
        />
      </Popover.Dropdown>
    </Popover>
  );
}

export default ColorPicker;
