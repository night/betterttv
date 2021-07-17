import React, {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import Panel from 'rsuite/lib/Panel/index.js';
import Loader from 'rsuite/lib/Loader/index.js';
import reactStringReplace from 'react-string-replace';
import api from '../../../utils/api.js';
import debug from '../../../utils/debug.js';
import styles from '../styles/header.module.css';
import CloseButton from '../components/CloseButton.jsx';

function changelogPage({onHide}) {
  const [req, setReq] = useState({
    loading: true,
    error: false,
    changelog: null,
  });

  useEffect(() => {
    api
      .get('cached/changelog')
      .then((res) => {
        setReq({
          loading: false,
          changelog: res,
        });
      })
      .catch((err) => {
        debug.log(`Failed to load changelog: ${err}`);
        setReq({
          loading: false,
          error: true,
        });
      });
  }, []);

  const {loading, changelog, error} = req;

  if (loading)
    return (
      <>
        <div className={styles.center}>
          <Panel>
            <Loader content="Loading Changelog..." />
          </Panel>
        </div>
        <div className={styles.header}>
          <CloseButton onHide={onHide} className={styles.closeButton} />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Panel header={<h3>Something went Wrong.</h3>}>
          <p className={styles.description}>Failed to load changelog.</p>
        </Panel>
        <div className={styles.header}>
          <CloseButton onHide={onHide} className={styles.closeButton} />
        </div>
      </>
    );

  const logs = changelog.map(({body, version, publishedAt}) => {
    let text = reactStringReplace(body, /\r\n/g, () => <br />);
    text = reactStringReplace(text, / #([0-9]+)/g, (match) => (
      <>
        <span> </span>
        <a href={`https://github.com/night/BetterTTV/issues/${match}`} target="_blank" rel="noreferrer">
          #{match}
        </a>
      </>
    ));

    return (
      <Panel header={`Version ${version} • ${dayjs(publishedAt).format('MMM D, YYYY')}`} key={version}>
        <p>{text}</p>
      </Panel>
    );
  });

  return (
    <>
      <div className={styles.content}>
        <PanelGroup>
          <Panel header={<h3>Changelogs</h3>}>
            <p className={styles.description}>A list of recent updates and patches to Betterttv.</p>
          </Panel>
          {logs}
        </PanelGroup>
      </div>
      <div className={styles.header}>
        <CloseButton onHide={onHide} className={styles.closeButton} />
      </div>
    </>
  );
}

export default changelogPage;
