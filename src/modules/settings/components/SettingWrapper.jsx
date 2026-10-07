import {Badge, Text, Title, Tooltip} from '@mantine/core';
import classNames from 'classnames';
import React, {use, useEffect} from 'react';
import ProBadge from '@/common/components/ProBadge';
import usePortalRef from '@/common/hooks/PortalRef';
import {PageTypes} from '@/constants';
import formatMessage from '@/i18n';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import SearchSettingContext from '@/modules/settings/contexts/SearchSettingContext';
import useSettingsSearchStore, {searchableText, settingsSearchMatches} from '@/modules/settings/stores/settings-search';
import styles from './SettingWrapper.module.css';

function SettingWrapper({
  name,
  description,
  children,
  showProBadge = false,
  showNewBadge = false,
  reverse = false,
  wrap = false,
  controlClassName = '',
}) {
  const portalRef = usePortalRef();
  const {setPage, setSidenavOpen} = use(PageContext);
  const settingPanelId = use(SearchSettingContext);
  const query = useSettingsSearchStore((state) => state.query);
  const registerEntry = useSettingsSearchStore((state) => state.registerEntry);

  useEffect(() => {
    const searchEntryId = `${settingPanelId}:${searchableText(name)}:${searchableText(description)}`;
    registerEntry(searchEntryId, {settingPanelId, name, description});
  }, [description, name, registerEntry, settingPanelId]);

  if (!settingsSearchMatches(query, name, description)) {
    return null;
  }

  function handleProBadgeClick(event) {
    event.stopPropagation();
    setPage(PageTypes.PRO_HOME);
    setSidenavOpen(false);
  }

  return (
    <div className={classNames(styles.root, {[styles.shouldWrap]: wrap})}>
      {!reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
      <div className={styles.text}>
        {name != null ? (
          <Title order={3} className={styles.title}>
            {name}
            {showProBadge ? (
              <Tooltip
                withArrow
                label={
                  <Text size="md">
                    {formatMessage({defaultMessage: 'This feature is only available to BetterTTV Pro users.'})}
                  </Text>
                }
                portalProps={{target: portalRef.current}}>
                <ProBadge onClick={handleProBadgeClick} />
              </Tooltip>
            ) : null}
            {showNewBadge ? (
              <Tooltip
                withArrow
                label={
                  <Text size="md">{formatMessage({defaultMessage: 'This feature is new, and may be changed.'})}</Text>
                }
                portalProps={{target: portalRef.current}}>
                <Badge color="red" variant="elevated" size="lg">
                  {formatMessage({defaultMessage: 'New'})}
                </Badge>
              </Tooltip>
            ) : null}
          </Title>
        ) : null}
        {description != null ? (
          <Text c="dimmed" size="lg" className={styles.description}>
            {description}
          </Text>
        ) : null}
      </div>
      {reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
    </div>
  );
}

export default SettingWrapper;
