import React, {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import Loader from 'rsuite/lib/Loader/index.js';
import api from '../../../utils/api.js';
import debug from '../../../utils/debug.js';
import Panel from 'rsuite/lib/Panel/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';

function changelog() {
  const [req, setReq] = useState({
    loading: true,
    error: false,
    changelog: null,
  });

  useEffect(() => {
    api
      .get('cached/changelog')
      .then((changelog) => {
        setReq({
          loading: false,
          changelog,
        });
      })
      .catch(() => {
        debug.log(`Failed to load changelog`);
        setReq({
          loading: false,
          error: true,
        });
      });
  }, []);

  const {loading, changelog, error} = req;

  if (loading)
    return (
      <Panel className="bttv-popout-page">
        <Loader content="Loading Changelog..." />
      </Panel>
    );

  if (error)
    return (
      <Panel className="bttv-popout-page">
        <h4>Something went wrong!</h4>
        <p>Failed to load changelog.</p>
      </Panel>
    );

  const logs = changelog.map(({body, version, publishedAt}, index) => (
    <Panel
      header={'Version ' + version + ' • ' + dayjs(publishedAt).format('MMM D, YYYY')}
      key={index}
      style={{marginLeft: 0}}>
      <p>{body}</p>
    </Panel>
  ));

  return (
    <div className="bttv-popout-page">
      <Panel>
        <h4>Changelog</h4>
        <p>A list of recent updates and patches to Betterttv.</p>
      </Panel>
      <PanelGroup className="bttv-settings-panel">{logs}</PanelGroup>
    </div>
  );
}

export default changelog;
