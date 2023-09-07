import classNames from 'classnames';
import React from 'react';
import {HexColorPicker, HexColorInput} from 'react-colorful';
import styles from './ColorPicker.module.css';

export default function ColorPicker({className, color, onChange}) {
  const popoutRef = React.useRef(null);
  const [isPopoutOpen, setIsPopoutOpen] = React.useState(false);

  React.useEffect(() => {
    function handleClickOutside(event) {
      const currentPopoutRef = popoutRef.current;
      if (currentPopoutRef == null || currentPopoutRef.contains(event.target)) {
        return;
      }
      setIsPopoutOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleTogglePopout() {
    setIsPopoutOpen(!isPopoutOpen);
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.swatchContainer}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={styles.swatch} style={{backgroundColor: color}} onClick={handleTogglePopout} />
        <HexColorInput className={styles.hexInput} color={color} onChange={onChange} />
      </div>
      {isPopoutOpen ? (
        <div className={styles.popout} ref={popoutRef}>
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
}
