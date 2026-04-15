import {motion} from 'framer-motion';
import React from 'react';
import LogoIcon from '../../../common/components/LogoIcon.jsx';
import styles from './AnimatedLogo.module.css';
import classNames from 'classnames';

function AnimatedLogo({className, logoClassName, ...restProps}) {
  return (
    <div className={classNames(styles.logoContainer, className)} {...restProps}>
      <motion.div
        className={classNames(styles.logo, logoClassName)}
        whileHover={{scale: 1.2, rotate: 45, borderRadius: '100%'}}
        whileTap={{scale: 0.8}}>
        <LogoIcon width="100%" height="100%" />
      </motion.div>
    </div>
  );
}

export default AnimatedLogo;
