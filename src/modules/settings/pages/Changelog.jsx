import React, {useEffect, useState} from 'react';
import PanelGroup from 'rsuite/PanelGroup';
import Panel from 'rsuite/Panel';
import Loader from 'rsuite/Loader';
import reactStringReplace from 'react-string-replace';
import api from '../../../utils/api.js';
import debug from '../../../utils/debug.js';
import styles from '../styles/header.module.css';
import CloseButton from '../components/CloseButton.jsx';
import formatMessage from '../../../i18n/index.js';

const EXTENSION_VERSION = process.env.EXT_VER;

function Changelog({onClose}) {
  const [{loading, changelogEntries}, setRequestState] = useState({
    loading: true,
    changelogEntries: null,
  });

  useEffect(() => {
    api
      .get('cached/changelog')
      .then((body) => {
        setRequestState({
          loading: false,
          changelogEntries: body,
        });
      })
      .catch((err) => {
        debug.log(`Failed to load changelog: ${err}`);
        setRequestState({
          loading: false,
          changelogEntries: null,
        });
      });
  }, []);

  let renderedChangelogEntries = null;

  if (loading) {
    renderedChangelogEntries = (
      <div className={styles.center}>
        <Loader content={formatMessage({defaultMessage: 'Loading Changelog...'})} />
      </div>
    );
  } else if (changelogEntries == null) {
    renderedChangelogEntries = <div className={styles.center}>Failed to load Changelog.</div>;
  } else {
    const versionIndex = changelogEntries.findIndex(({version}) => version === EXTENSION_VERSION) || 0;

    renderedChangelogEntries = changelogEntries
      .filter((_, index) => index >= versionIndex)
      .map(({body, version, publishedAt}) => {
        let keyCount = 0;
        let formattedBody = reactStringReplace(body, / #([0-9]+)/g, (match) => (
          <React.Fragment key={`${version}-issue-${match}-${keyCount++}`}>
            {' '}
            <a href={`https://github.com/night/BetterTTV/issues/${match}`} target="_blank" rel="noreferrer">
              #{match}
            </a>
          </React.Fragment>
        ));
        formattedBody = reactStringReplace(formattedBody, /(\r\n)/g, (match) => (
          <br key={`${version}-line-${match}-${keyCount++}`} />
        ));

        return (
          <Panel
            header={formatMessage(
              {defaultMessage: 'Version {version} • {publishedAt, date, medium}'},
              {version, publishedAt: new Date(publishedAt)}
            )}
            key={version}>
            <p className={styles.settingDescription}>{formattedBody}</p>
          </Panel>
        );
      });
  }

  return (
    <>
      <div className={styles.content}>
        <PanelGroup>
          <Panel header={<h3>{formatMessage({defaultMessage: 'Changelog'})}</h3>}>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'A list of recent updates and patches to BetterTTV.'})}
            </p>
          </Panel>
          {renderedChangelogEntries}
        </PanelGroup>
      </div>
      <div className={styles.header}>
        <CloseButton onClose={onClose} className={styles.closeButton} />
      </div>
    </>
  );
}

export default Changelog;
