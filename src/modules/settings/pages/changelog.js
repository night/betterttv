import React, {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import Loader from 'rsuite/lib/Loader/index.js';
import api from '../../../utils/api.js';
import debug from '../../../utils/debug.js';
import Panel from 'rsuite/lib/Panel/index.js';
import Divider from 'rsuite/lib/Divider/index.js';
import Header from '../bttv-components/header.js';

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
    <Panel key={index} style={{marginLeft: 0}}>
      <Divider />
      <h4>{'Version ' + version + ' • ' + dayjs(publishedAt).format('MMM D, YYYY')}</h4>
      <br />
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
    <div className="bttv-popout-page">
      <Panel>
        <Header heading={'Changelog'} description={'A list of recent updates and patches to Betterttv.'} />
      </Panel>
      {logs}
    </div>
  );
}

export default changelog;
