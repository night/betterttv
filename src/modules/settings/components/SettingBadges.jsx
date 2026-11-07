import {Badge, Text, Tooltip} from '@mantine/core';
import React, {use} from 'react';
import ProBadge from '@/common/components/ProBadge';
import usePortalRef from '@/common/hooks/PortalRef';
import {PageTypes} from '@/constants';
import formatMessage from '@/i18n';
import {PageContext} from '@/modules/settings/contexts/PageContext';

// the Pro and New badges beside a setting's title, or a section's when it's the only title
function SettingBadges({showProBadge = false, showNewBadge = false}) {
  const {setPage, setSidenavOpen} = use(PageContext);
  const portalRef = usePortalRef();

  function handleProBadgeClick(event) {
    event.stopPropagation();
    setPage(PageTypes.PRO_HOME);
    setSidenavOpen(false);
  }

  return (
    <React.Fragment>
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
          label={<Text size="md">{formatMessage({defaultMessage: 'This feature is new, and may be changed.'})}</Text>}
          portalProps={{target: portalRef.current}}>
          <Badge color="red" variant="elevated" size="lg">
            {formatMessage({defaultMessage: 'New'})}
          </Badge>
        </Tooltip>
      ) : null}
    </React.Fragment>
  );
}

export default SettingBadges;
