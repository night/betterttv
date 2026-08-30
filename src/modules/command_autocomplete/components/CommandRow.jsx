import {faGem, faShieldHalved, faStar, faUserCheck, faVideo} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import React, {useMemo} from 'react';
import AutocompleteRow from '@/common/components/AutocompleteRow';
import Icon from '@/common/components/Icon';
import NightbotLogoIcon from '@/common/components/NightbotLogoIcon';
import {CommandProviders, CommandAutocompleteArgumentTypes, UserLevels} from '@/constants';
import formatMessage from '@/i18n/index';
import {getMinimumUserLevel} from '@/modules/command_autocomplete/utils';
import cdn from '@/utils/cdn';
import styles from './CommandRow.module.css';

const LogoByCommandProvider = {
  [CommandProviders.FOSSABOT]: cdn.url('/assets/logos/fossabot_logo.png'),
  [CommandProviders.MOOBOT]: cdn.url('/assets/logos/moobot_logo.png'),
  [CommandProviders.STREAMELEMENTS]: cdn.url('/assets/logos/streamelements_logo.png'),
};

// UserLevels.EVERYONE is intentionally absent — commands anyone can use don't need a badge.
const UserLevelBadges = {
  [UserLevels.SUBSCRIBER]: {
    icon: faStar,
    className: styles.subscriberBadge,
    label: formatMessage({defaultMessage: 'Subscriber'}),
  },
  [UserLevels.REGULAR]: {
    icon: faUserCheck,
    className: styles.regularBadge,
    label: formatMessage({defaultMessage: 'Regular'}),
  },
  [UserLevels.TWITCH_VIP]: {
    icon: faGem,
    className: styles.vipBadge,
    label: formatMessage({defaultMessage: 'VIP'}),
  },
  [UserLevels.MODERATOR]: {
    icon: faShieldHalved,
    className: styles.moderatorBadge,
    label: formatMessage({defaultMessage: 'Moderator'}),
  },
  [UserLevels.OWNER]: {
    icon: faVideo,
    className: styles.ownerBadge,
    label: formatMessage({defaultMessage: 'Broadcaster'}),
  },
};

function CommandRow({item, active, selected, focusedWordIndex, onMouseOver, onClick}) {
  const leadingElement = useMemo(() => {
    if (item.provider === CommandProviders.NIGHTBOT) {
      return <NightbotLogoIcon className={styles.nightbotLogo} />;
    }

    const logoUrl = LogoByCommandProvider[item.provider];
    if (logoUrl != null) {
      return <img src={logoUrl} alt={item.provider} className={styles.providerLogo} />;
    }

    return null;
  }, [item.provider]);

  const trailingElement = useMemo(() => {
    const badge = UserLevelBadges[getMinimumUserLevel(item.userLevel)];
    if (badge == null) {
      return null;
    }

    return (
      <span title={badge.label} aria-label={badge.label} className={classNames(styles.userLevelBadge, badge.className)}>
        <Icon icon={badge.icon} size={12} />
      </span>
    );
  }, [item.userLevel]);

  // Combine the command name and its argument placeholders into a word list where the positions
  // line up with the caret's focusedWordIndex (which is measured against whitespace-delimited
  // words in the chat input). The name splits into one word per typed word (multi-word names like
  // "!commands add" occupy one slot each), but each argument placeholder stays a single unit even
  // when its display name contains spaces ("[game name]") — the user fills it at one word position.
  const titleWords = useMemo(() => {
    const argumentWords = item.arguments.map((argument) => `[${argument.name.toLowerCase()}]`);
    return [...item.name.split(/\s+/), ...argumentWords];
  }, [item.name, item.arguments]);

  // A phrase argument soaks up the rest of the message, so it's always the last
  // argument (and therefore the last word). Once the caret reaches or passes it,
  // pin the highlight to it instead of letting the focus fall off the end as the
  // user keeps typing words into the phrase.
  const highlightedWordIndex = useMemo(() => {
    const lastArgument = item.arguments[item.arguments.length - 1];
    if (lastArgument?.type !== CommandAutocompleteArgumentTypes.PHRASE) {
      return focusedWordIndex;
    }

    const phraseWordIndex = titleWords.length - 1;
    return Math.min(focusedWordIndex, phraseWordIndex);
  }, [item.arguments, titleWords, focusedWordIndex]);

  const title = useMemo(
    () =>
      titleWords.map((word, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- static word list, never reordered
        <React.Fragment key={index}>
          {index > 0 ? ' ' : null}
          <span className={classNames(styles.word, {[styles.focusedWord]: index === highlightedWordIndex})}>
            {word}
          </span>
        </React.Fragment>
      )),
    [titleWords, highlightedWordIndex]
  );

  return (
    <AutocompleteRow
      leading={leadingElement}
      trailing={trailingElement}
      title={title}
      active={active}
      selected={selected}
      onMouseOver={onMouseOver}
      onClick={onClick}
    />
  );
}

export default React.memo(CommandRow, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.selected === next.selected &&
    prev.active === next.active &&
    prev.index === next.index &&
    prev.focusedWordIndex === next.focusedWordIndex
  );
});
