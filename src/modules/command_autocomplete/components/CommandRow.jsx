import React, {useMemo} from 'react';
import classNames from 'classnames';
import AutocompleteRow from '@/common/components/AutocompleteRow';
import NightbotLogoIcon from '@/common/components/NightbotLogoIcon';
import styles from './CommandRow.module.css';
import {CommandProviders, CommandAutocompleteArgumentTypes} from '@/constants';
import cdn from '@/utils/cdn';

const LogoByCommandProvider = {
  [CommandProviders.FOSSABOT]: cdn.url('/assets/logos/fossabot_logo.png'),
  [CommandProviders.MOOBOT]: cdn.url('/assets/logos/moobot_logo.png'),
  [CommandProviders.STREAMELEMENTS]: cdn.url('/assets/logos/streamelements_logo.png'),
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

  // Combine the command name and its argument placeholders into a single string,
  // then split on whitespace so the word positions line up with the caret's
  // focusedWordIndex (which is measured against the chat input the same way).
  // This handles multi-word command names like "!commands add" — each word is
  // highlighted only while the caret sits on it.
  const titleWords = useMemo(() => {
    const argumentText = item.arguments.map((argument) => `[${argument.name.toLowerCase()}]`).join(' ');
    const fullText = argumentText.length > 0 ? `${item.name} ${argumentText}` : item.name;
    return fullText.split(/\s+/);
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
