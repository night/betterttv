import classNames from 'classnames';
import React from 'react';
import SelectMenu from '@/common/components/SelectMenu';
import useStorageState from '@/common/hooks/StorageState';
import {openConfirmModal} from '@/common/utils/modal';
import {SettingIds, EmoteProviders as EmoteProviderIds, EmoteTypeFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {EmoteProviderMetadata} from '@/utils/emote';
import {hasFlag, setFlag} from '@/utils/flags';
import styles from './Emotes.module.css';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Providers'});
const PROVIDER_FLAGS = [EmoteTypeFlags.BTTV_EMOTES, EmoteTypeFlags.FFZ_EMOTES, EmoteTypeFlags.SEVENTV_EMOTES];
const SEVENTV_LISTED = 'listed';
const SEVENTV_UNLISTED = 'unlisted';
const SEVENTV_LISTING_OPTIONS = [
  {label: formatMessage({defaultMessage: 'Approved only'}), value: SEVENTV_LISTED},
  {label: formatMessage({defaultMessage: 'Include explicit'}), value: SEVENTV_UNLISTED},
];

// the title names the provider, so the logo is only there for scanning the list
function ProviderLogo({provider}) {
  return (
    <img
      className={classNames(styles.providerLogo, {[styles.ffzLogo]: provider === EmoteProviderIds.FRANKERFACEZ})}
      src={EmoteProviderMetadata[provider].logoUrl}
      alt=""
    />
  );
}

function searchIconFor(provider) {
  return function ProviderSearchIcon() {
    return <ProviderLogo provider={provider} className={styles.providerSearchLogo} />;
  };
}

function EmoteProviders({ref, ...props}) {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);

  function handleSeventvListingChange(listing) {
    if (listing === SEVENTV_LISTED) {
      setEmotes(setFlag(emotes, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES, false));
      return;
    }

    openConfirmModal({
      confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
      onConfirm: () => setEmotes(setFlag(emotes, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES, true)),
      title: formatMessage({defaultMessage: 'Warning'}),
      description: formatMessage({
        defaultMessage:
          'This content has been flagged by the community for its poor moderation standards. Content from this extension is not reviewed by BetterTTV, and you may encounter unsavory content. Are you sure you want to proceed?',
      }),
      labels: {
        confirm: formatMessage({defaultMessage: 'Enable Anyway'}),
        cancel: formatMessage({defaultMessage: 'Cancel'}),
      },
    });
  }

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={emotes}
      onChange={setEmotes}
      flags={PROVIDER_FLAGS}>
      <SettingCheckbox
        value={EmoteTypeFlags.BTTV_EMOTES}
        icon={<ProviderLogo provider={EmoteProviderIds.BETTERTTV} />}
        name={formatMessage({defaultMessage: 'Show BetterTTV emotes'})}
        description={formatMessage({defaultMessage: 'Adds extra cool emotes for you to use.'})}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.FFZ_EMOTES}
        icon={<ProviderLogo provider={EmoteProviderIds.FRANKERFACEZ} />}
        name={formatMessage({defaultMessage: 'Show FrankerFaceZ emotes'})}
        description={formatMessage({
          defaultMessage: 'Adds emotes from this third party extension.',
        })}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.SEVENTV_EMOTES}
        icon={<ProviderLogo provider={EmoteProviderIds.SEVENTV} />}
        rightSection={
          <SelectMenu
            className={styles.seventvListing}
            ariaLabel={formatMessage({defaultMessage: 'Which 7TV emotes to show'})}
            options={SEVENTV_LISTING_OPTIONS}
            value={hasFlag(emotes, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES) ? SEVENTV_UNLISTED : SEVENTV_LISTED}
            onChange={handleSeventvListingChange}
            disabled={!hasFlag(emotes, EmoteTypeFlags.SEVENTV_EMOTES)}
          />
        }
        name={formatMessage({defaultMessage: 'Show 7TV emotes'})}
        description={formatMessage({
          defaultMessage: 'Adds emotes from this third party extension.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Show BetterTTV emotes'}),
  description: formatMessage({defaultMessage: 'Adds extra cool emotes for you to use.'}),
  icon: searchIconFor(EmoteProviderIds.BETTERTTV),
  settingPanelId: SettingPanelIds.EMOTES,
});

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Show FrankerFaceZ emotes'}),
  description: formatMessage({defaultMessage: 'Adds emotes from this third party extension.'}),
  icon: searchIconFor(EmoteProviderIds.FRANKERFACEZ),
  settingPanelId: SettingPanelIds.EMOTES,
});

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Show 7TV emotes'}),
  description: formatMessage({defaultMessage: 'Adds emotes from this third party extension.'}),
  icon: searchIconFor(EmoteProviderIds.SEVENTV),
  settingPanelId: SettingPanelIds.EMOTES,
});

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Include explicit 7TV emotes'}),
  keywords: ['unlisted', 'approved', 'nsfw'],
  settingPanelId: SettingPanelIds.EMOTES,
});

SettingStore.registerSetting(EmoteProviders, {
  settingPanelId: SettingPanelIds.EMOTES,
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteProviders;
