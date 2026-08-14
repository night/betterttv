import {Anchor, Text, Tooltip} from '@mantine/core';
import React, {use} from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import {EXT_VER, ExternalLinks, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import styles from './Footer.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_EXPLORE_LINKS = [
  {href: ExternalLinks.WEBSITE, label: formatMessage({defaultMessage: 'Website'})},
  {href: ExternalLinks.GITHUB_ISSUES, label: formatMessage({defaultMessage: 'Report Bugs'})},
  {href: ExternalLinks.GITHUB_DISCUSSIONS, label: formatMessage({defaultMessage: 'Submit Ideas'})},
  {href: ExternalLinks.CROWDIN, label: formatMessage({defaultMessage: 'Submit Translations'})},
];

const FOOTER_COMMUNITY_LINKS = [
  {href: ExternalLinks.DISCORD, label: formatMessage({defaultMessage: 'Discord'})},
  {href: ExternalLinks.EMAIL, label: formatMessage({defaultMessage: 'Email Us'})},
  {href: ExternalLinks.TWITTER, label: formatMessage({defaultMessage: 'Twitter'})},
  {href: ExternalLinks.GITHUB, label: formatMessage({defaultMessage: 'GitHub'})},
];

const FOOTER_OTHER_LINKS = [
  {href: ExternalLinks.TERMS, label: formatMessage({defaultMessage: 'Terms of Service'})},
  {href: ExternalLinks.PRIVACY, label: formatMessage({defaultMessage: 'Privacy Policy'})},
  {href: ExternalLinks.DEVELOPER_API, label: formatMessage({defaultMessage: 'Developer API'})},
];

const EXPLORE_TITLE = formatMessage({defaultMessage: 'Explore'});
const COMMUNITY_TITLE = formatMessage({defaultMessage: 'Community'});
const OTHER_TITLE = formatMessage({defaultMessage: 'Other'});
const VERSION_TEXT = formatMessage({defaultMessage: 'Version {version}'}, {version: EXT_VER});

function LinkColumn({title, links}) {
  return (
    <div className={styles.column}>
      <Text c="dimmed" className={styles.heading} order={4}>
        {title}
      </Text>
      {links.map(({href, label}) => (
        <Anchor key={href} href={href} target="_blank" rel="noreferrer" size="md" className={styles.link}>
          {label}
        </Anchor>
      ))}
    </div>
  );
}

function Footer() {
  const {setPage} = use(PageContext);
  const portalRef = usePortalRef();

  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <LinkColumn title={EXPLORE_TITLE} links={FOOTER_EXPLORE_LINKS} />
        <LinkColumn title={COMMUNITY_TITLE} links={FOOTER_COMMUNITY_LINKS} />
        <LinkColumn title={OTHER_TITLE} links={FOOTER_OTHER_LINKS} />
      </div>
      <div className={styles.copyright}>
        <Text c="dimmed">
          {formatMessage(
            {defaultMessage: 'Copyright © {year} NightDev, LLC. All Rights Reserved.'},
            {year: CURRENT_YEAR}
          )}
        </Text>
        <Tooltip
          openDelay={200}
          withArrow
          arrowSize={8}
          radius="md"
          label={<Text size="md">{formatMessage({defaultMessage: 'Read Changelog'})}</Text>}
          portalProps={{target: portalRef.current}}>
          <Anchor component="button" type="button" c="dimmed" onClick={() => setPage(PageTypes.CHANGELOG)}>
            {VERSION_TEXT}
          </Anchor>
        </Tooltip>
      </div>
    </div>
  );
}

export default Footer;
