import React, {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import api from '../../../utils/api.js';
import debug from '../../../utils/debug.js';
import Header from '../bttv-components/header.jsx';

import Loader from 'rsuite/lib/Loader/index.js';
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
      <Panel>
        <Loader content="Loading Changelog..." />
      </Panel>
    );

  if (error)
    return (
      <Panel>
        <Header heading={'Something went wrong'} description={'Failed to load changelog.'} />
      </Panel>
    );

  const logs = changelog.map(({body, version, publishedAt}, index) => (
    <Panel
      header={'Version ' + version + ' • ' + dayjs(publishedAt).format('MMM D, YYYY')}
      key={index}
      style={{marginLeft: 0}}>
      <p
        className="bttv-muted-text"
        dangerouslySetInnerHTML={{
          __html: body
            .replace(/\r\n/g, '<br />')
            .replace(/ #([0-9]+)/g, ' <a href="https://github.com/night/BetterTTV/issues/$1" target="_blank">#$1</a>'),
        }}
      />
    </Panel>
  ));

  return (
    <PanelGroup className="bttv-popout-page">
      <Panel>
        <Header heading={'Changelog'} description={'A list of recent updates and patches to Betterttv.'} />
      </Panel>
      {logs}
    </PanelGroup>
  );
}

export default changelog;
