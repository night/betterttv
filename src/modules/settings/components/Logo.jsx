import React from 'react';
import {motion} from 'framer-motion';
import styles from '../styles/sidenav.module.css';
import cdn from '../../../utils/cdn.js';

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <motion.div
        className={styles.logo}
        whileHover={{scale: 1.2, rotate: 45, borderRadius: '100%'}}
        whileTap={{scale: 0.8}}>
        <img alt="" src={cdn.url('/assets/logos/mascot.svg')} />
      </motion.div>
    </div>
  );
}
