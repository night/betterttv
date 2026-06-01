import React, {useMemo} from 'react';
import AutocompleteRow from '../../../common/components/AutocompleteRow.jsx';
import NightbotLogoIcon from '../../../common/components/NightbotLogoIcon.jsx';
import styles from './CommandRow.module.css';
import {CommandAutocompleteArgumentTypes, CommandProviders} from '../../../constants.js';
import cdn from '../../../utils/cdn.js';
import formatMessage from '../../../i18n/index.js';

const LogoByCommandProvider = {
  [CommandProviders.FOSSABOT]: cdn.url('/assets/logos/fossabot_logo.png'),
  [CommandProviders.MOOBOT]: cdn.url('/assets/logos/moobot_logo.png'),
  [CommandProviders.STREAMELEMENTS]: cdn.url('/assets/logos/streamelements_logo.png'),
};

export const ArgumentDisplayTextByArgumentType = {
  [CommandAutocompleteArgumentTypes.WORD]: formatMessage({defaultMessage: '[word]'}),
  [CommandAutocompleteArgumentTypes.PHRASE]: formatMessage({defaultMessage: '[phrase]'}),
  [CommandAutocompleteArgumentTypes.USER]: formatMessage({defaultMessage: '[user]'}),
};

function CommandRow({item, active, selected, onMouseOver, onClick}) {
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

  const subtitle = useMemo(() => {
    if (item.arguments.length > 0) {
      return item.arguments.map((argument) => ArgumentDisplayTextByArgumentType[argument.type]).join(' ');
    }

    return null;
  }, [item.arguments]);

  return (
    <AutocompleteRow
      leading={leadingElement}
      title={item.name}
      subtitle={subtitle}
      active={active}
      selected={selected}
      onMouseOver={onMouseOver}
      onClick={onClick}
    />
  );
}

export default React.memo(CommandRow, (prev, next) => {
  return prev.item === next.item && prev.selected === next.selected && prev.active === next.active;
});
