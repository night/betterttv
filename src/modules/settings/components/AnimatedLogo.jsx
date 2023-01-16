import React from 'react';
import {motion} from 'framer-motion';
import styles from '../styles/sidenav.module.css';
import LogoIcon from '../../../common/components/LogoIcon.jsx';

export default function AnimatedLogo() {
  return (
    <div className={styles.logoContainer}>
      <motion.div
        className={styles.logo}
        whileHover={{scale: 1.2, rotate: 45, borderRadius: '100%'}}
        whileTap={{scale: 0.8}}>
        <LogoIcon width="100%" height="100%" />
      </motion.div>
    </div>
  );
}
