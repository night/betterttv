import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Header from '../bttv-components/header.js';

function Home() {
  return (
    <Panel>
      <Header heading={'Home'} description={'Enjoying this extension?'} />
    </Panel>
  );
}

export default Home;
