import {Anchor, Text, Title} from '@mantine/core';
import React, {useEffect, useMemo, useState} from 'react';
import reactStringReplace from 'react-string-replace';
import semver from 'semver';
import {EXT_VER} from '@/constants';
import formatMessage from '@/i18n/index';
import PageLoader from '@/modules/settings/components/PageLoader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import Panel from '@/modules/settings/components/Panel';
import api from '@/utils/api';
import debug from '@/utils/debug';
import styles from './Changelog.module.css';

function IssueLink({issueNumber}) {
  return (
    <React.Fragment>
      {' '}
      <Anchor
        className={styles.changelogText}
        href={`https://github.com/night/BetterTTV/issues/${issueNumber}`}
        target="_blank"
        rel="noreferrer">
        #{issueNumber}
      </Anchor>
    </React.Fragment>
  );
}

function ChangelogEntry({body, version, publishedAt}) {
  const formattedBody = useMemo(() => {
    let issueLinkIndex = 0;
    let lineBreakIndex = 0;

    let result = reactStringReplace(body, / #([0-9]+)/g, (match) => (
      <IssueLink key={`${version}-issue-${match}-${issueLinkIndex++}`} issueNumber={match} />
    ));

    result = reactStringReplace(result, /(\r\n)/g, () => <br key={`${version}-line-${lineBreakIndex++}`} />);

    return result;
  }, [body, version]);

  return (
    <Panel
      key={`${version}-${publishedAt}`}
      title={
        <div className={styles.changelogTitle}>
          <Title order={2}>{formatMessage({defaultMessage: 'Version {version}'}, {version})}</Title>
        </div>
      }
      rightContent={
        <Text c="dimmed" size="lg">
          {formatMessage({defaultMessage: '{publishedAt, date, medium}'}, {publishedAt: new Date(publishedAt)})}
        </Text>
      }>
      <Text className={styles.changelogText}>{formattedBody}</Text>
    </Panel>
  );
}

function ChangelogEntryList({changelogEntries: rawChangelogEntries}) {
  const changelogEntries = rawChangelogEntries
    .filter((entry) => entry.version != null && semver.valid(entry.version))
    .filter(({version}) => semver.lte(version, EXT_VER));

  return changelogEntries.map(({body, version, publishedAt}, index) => (
    <ChangelogEntry
      key={`${version}-${publishedAt}`}
      index={index}
      body={body}
      version={version}
      publishedAt={publishedAt}
    />
  ));
}

function Changelog() {
  // eslint-disable-next-line @eslint-react/use-state -- request state is intentionally destructured inline
  const [{loading, changelogEntries}, setRequestState] = useState({
    loading: true,
    changelogEntries: null,
  });

  useEffect(() => {
    api
      .get('cached/changelog')
      .then((body) => setRequestState({loading: false, changelogEntries: body}))
      .catch((err) => {
        debug.log(`Failed to load changelog: ${err}`);
        setRequestState({loading: false, changelogEntries: []});
      });
  }, []);

  return (
    <PageScrollBody>
      {loading ? <PageLoader /> : null}
      {!loading && changelogEntries == null ? (
        <Text>{formatMessage({defaultMessage: 'Failed to load Changelog.'})}</Text>
      ) : null}
      {!loading && changelogEntries != null ? <ChangelogEntryList changelogEntries={changelogEntries} /> : null}
      {!loading && changelogEntries.length === 0 ? (
        <Panel>
          <Text size="lg" className={styles.noChangelogText} c="dimmed">
            {formatMessage({defaultMessage: 'No changelog entries found.'})}
          </Text>
        </Panel>
      ) : null}
    </PageScrollBody>
  );
}

export default Changelog;
