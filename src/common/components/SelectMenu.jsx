import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {Button, Menu} from '@mantine/core';
import {Check, ChevronDown} from 'lucide-react';
import React, {useCallback, useState} from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import {flatButtonVars} from '@/modules/shadow_dom/vars';
import isPressOn from '@/utils/press';
import styles from './SelectMenu.module.css';

function SelectMenuOption({option, active, onPick}) {
  const handleClick = useCallback(() => onPick(option.value), [onPick, option.value]);

  return (
    <Menu.Item
      aria-current={active || undefined}
      rightSection={active ? <Check size={16} /> : null}
      onClick={handleClick}>
      {option.label}
    </Menu.Item>
  );
}

// a select drawn as the website's menus: a button showing the pick, over a ticked list of options
function SelectMenu({value, options, onChange, disabled = false, variant = 'filled', className, ariaLabel}) {
  const portalRef = usePortalRef();
  const [opened, setOpened] = useState(false);
  const {refs, context} = useFloating({open: opened, onOpenChange: setOpened});
  // the press is seen on the document, where the closed shadow root hides its path, so it's placed by
  // position; otherwise the trigger's press would close the menu and its click reopen it
  const dismiss = useDismiss(context, {
    outsidePress: (event) => !isPressOn(refs.floating.current, event) && !isPressOn(refs.reference.current, event),
  });
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);
  const current = options.find((option) => option.value === value);

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={8}
      disabled={disabled}
      trapFocus={false}
      closeOnClickOutside={false}
      portalProps={{target: portalRef?.current}}>
      <Menu.Target>
        <Button
          ref={refs.setReference}
          {...getReferenceProps()}
          variant={variant}
          color="dark.8"
          size="lg"
          radius="lg"
          vars={flatButtonVars}
          disabled={disabled}
          className={className}
          classNames={{inner: styles.triggerInner}}
          rightSection={<ChevronDown size={16} className={styles.triggerIcon} />}
          aria-label={ariaLabel}>
          {current?.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown ref={refs.setFloating} {...getFloatingProps()}>
        {options.map((option) => (
          <SelectMenuOption key={option.value} option={option} active={option.value === value} onPick={onChange} />
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export default SelectMenu;
