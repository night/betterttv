import {Anchor, Text, Tooltip} from '@mantine/core';
import {
  Bot,
  Bug,
  CircleUserRound,
  CodeXml,
  CreditCard,
  Globe,
  History,
  Languages,
  Lightbulb,
  Link,
  Lock,
  Mail,
  PaintbrushVertical,
  Scale,
  Smile,
  Upload,
  Users,
} from 'lucide-react';
import React, {use} from 'react';
import {ChannelPointsGlyph, DiscordMark, GithubMark, XMark} from '@/common/components/BrandMarks';
import usePortalRef from '@/common/hooks/PortalRef';
import {EXT_VER, ExternalLinks, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import styles from './Footer.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_EXPLORE_LINKS = [
  {
    href: ExternalLinks.WEBSITE,
    keywords: ['home', 'betterttv.com'],
    icon: Globe,
    label: formatMessage({defaultMessage: 'Website'}),
  },
  {
    href: ExternalLinks.GITHUB_ISSUES,
    keywords: ['issue', 'problem', 'support'],
    icon: Bug,
    label: formatMessage({defaultMessage: 'Report Bugs'}),
  },
  {
    href: ExternalLinks.GITHUB_DISCUSSIONS,
    keywords: ['feature', 'request', 'suggestion'],
    icon: Lightbulb,
    label: formatMessage({defaultMessage: 'Submit Ideas'}),
  },
  {
    href: ExternalLinks.TRANSLATE,
    keywords: ['language', 'localization'],
    icon: Languages,
    label: formatMessage({defaultMessage: 'Submit Translations'}),
  },
];

const FOOTER_COMMUNITY_LINKS = [
  {
    href: ExternalLinks.DISCORD,
    keywords: ['community', 'help', 'support'],
    icon: DiscordMark,
    label: formatMessage({defaultMessage: 'Discord'}),
  },
  {
    href: ExternalLinks.EMAIL,
    keywords: ['contact', 'support'],
    icon: Mail,
    label: formatMessage({defaultMessage: 'Email Us'}),
  },
  {
    href: ExternalLinks.TWITTER,
    keywords: ['x', 'social'],
    icon: XMark,
    label: formatMessage({defaultMessage: 'Twitter'}),
  },
  {
    href: ExternalLinks.GITHUB,
    keywords: ['source', 'code', 'open source'],
    icon: GithubMark,
    label: formatMessage({defaultMessage: 'GitHub'}),
  },
];

const FOOTER_OTHER_LINKS = [
  {
    href: ExternalLinks.TERMS,
    keywords: ['tos', 'legal'],
    icon: Scale,
    label: formatMessage({defaultMessage: 'Terms of Service'}),
  },
  {
    href: ExternalLinks.PRIVACY,
    keywords: ['data', 'legal', 'gdpr'],
    icon: Lock,
    label: formatMessage({defaultMessage: 'Privacy Policy'}),
  },
  {
    href: ExternalLinks.DEVELOPER_API,
    keywords: ['docs', 'developers'],
    icon: CodeXml,
    label: formatMessage({defaultMessage: 'Developer API'}),
  },
];

// the website's dashboard pages, which are only reached through search
const DASHBOARD_LINKS = [
  {
    href: ExternalLinks.DASHBOARD_CHANNEL_EMOTES,
    icon: Smile,
    label: formatMessage({defaultMessage: 'Channel Emotes'}),
    description: formatMessage({defaultMessage: 'Manage the emotes in your channel.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_PERSONAL_EMOTES,
    icon: CircleUserRound,
    label: formatMessage({defaultMessage: 'Personal Emotes'}),
    description: formatMessage({defaultMessage: 'Manage your emotes for every chat.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_UPLOADS,
    icon: Upload,
    label: formatMessage({defaultMessage: 'Emote Uploads'}),
    description: formatMessage({defaultMessage: 'Upload and manage your emotes.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_APPEARANCE,
    icon: PaintbrushVertical,
    label: formatMessage({defaultMessage: 'Appearance'}),
    description: formatMessage({defaultMessage: 'Your badge, effects and font.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_CONNECTIONS,
    icon: Link,
    label: formatMessage({defaultMessage: 'Connections'}),
    description: formatMessage({defaultMessage: 'Your linked accounts and apps.'}),
  },
  {
    href: ExternalLinks.PRO,
    icon: CreditCard,
    label: formatMessage({defaultMessage: 'Subscription'}),
    description: formatMessage({defaultMessage: 'Manage your Pro subscription.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_EDITORS,
    icon: Users,
    label: formatMessage({defaultMessage: 'Editors'}),
    description: formatMessage({defaultMessage: 'Choose who manages your emotes.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_BOTS,
    icon: Bot,
    label: formatMessage({defaultMessage: 'Chat Bots'}),
    description: formatMessage({defaultMessage: 'Badge the bots on your channel.'}),
  },
  {
    href: ExternalLinks.DASHBOARD_CHANNEL_POINTS,
    icon: ChannelPointsGlyph,
    label: formatMessage({defaultMessage: 'Channel Points'}),
    description: formatMessage({defaultMessage: 'Let viewers redeem emotes.'}),
  },
];

for (const {href, icon, label, description} of DASHBOARD_LINKS) {
  registerSearchEntry({query: label, description, keywords: ['dashboard'], href, icon});
}

for (const {href, keywords, icon, label} of [
  ...FOOTER_EXPLORE_LINKS,
  ...FOOTER_COMMUNITY_LINKS,
  ...FOOTER_OTHER_LINKS,
]) {
  registerSearchEntry({query: label, keywords, href, icon});
}

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Changelog'}),
  description: formatMessage({defaultMessage: "What's new in BetterTTV."}),
  icon: History,
  onAccept: ({setPage}) => setPage(PageTypes.CHANGELOG),
});

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

  function handleVersionClick() {
    setPage(PageTypes.CHANGELOG);
  }

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
          <Anchor component="button" type="button" c="dimmed" onClick={handleVersionClick}>
            {VERSION_TEXT}
          </Anchor>
        </Tooltip>
      </div>
    </div>
  );
}

export default Footer;
