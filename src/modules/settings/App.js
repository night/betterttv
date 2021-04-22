import React from 'react';
import {useState} from 'react';
import Button from 'rsuite/lib/Button/index.js';
import BTTVWindow from './bttv-components/popout.js';

function App() {
  const [open, setOpen] = useState(false);
  const text = open ? 'Close Popout' : 'Open Popout';

  return (
    <div className="App">
      <BTTVWindow open={open} setOpen={setOpen} />
      <Button onClick={() => setOpen(!open)}>{text}</Button>
    </div>
  );
}

export default App;
