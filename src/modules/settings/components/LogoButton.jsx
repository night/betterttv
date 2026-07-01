import {Anchor, Text, UnstyledButton} from '@mantine/core';
import React from 'react';
import LogoIcon from '@/common/components/LogoIcon';
import {openModal} from '@/common/utils/modal';
import {EXT_VER, ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import AnimatedLogo from './AnimatedLogo';
import styles from './LogoButton.module.css';

const OTHER_LINKS = [
  {href: ExternalLinks.TERMS, label: formatMessage({defaultMessage: 'Terms of Service'})},
  {href: ExternalLinks.PRIVACY, label: formatMessage({defaultMessage: 'Privacy Policy'})},
  {href: ExternalLinks.DEVELOPER_API, label: formatMessage({defaultMessage: 'Developer API'})},
];

const VERSION_TEXT = formatMessage({defaultMessage: 'Version {version}'}, {version: EXT_VER});

function AboutModalBody() {
  return (
    <div className={styles.about}>
      <LogoIcon width={56} height={56} />
      <Text c="dimmed" className={styles.version}>
        {VERSION_TEXT}
      </Text>
      <div className={styles.links}>
        {OTHER_LINKS.map(({href, label}) => (
          <Anchor key={href} href={href} target="_blank" rel="noreferrer" size="md" className={styles.link}>
            {label}
          </Anchor>
        ))}
      </div>
    </div>
  );
}

function openAboutModal() {
  openModal({
    title: formatMessage({defaultMessage: 'BetterTTV'}),
    size: 'sm',
    children: <AboutModalBody />,
  });
}

function LogoButton({logoClassName}) {
  return (
    <UnstyledButton
      className={styles.trigger}
      onClick={openAboutModal}
      aria-label={formatMessage({defaultMessage: 'About BetterTTV'})}>
      <AnimatedLogo className={logoClassName} />
    </UnstyledButton>
  );
}

export default LogoButton;
