import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../components/Window.jsx';
// import domObserver from '../../../observers/dom.js';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedNode;

export default class SettingsModule {
  constructor() {
    this.renderSettings();
    this.renderSettingsMenuOption();
  }

  renderSettings() {
    if ($('#bttvSettings').length) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    $('body').append(panel);
    if (mountedNode != null) {
      ReactDOM.unmountComponentAtNode(mountedNode);
    }
    ReactDOM.render(<Modal setHandleOpen={setHandleOpen} />, panel);
    mountedNode = panel;
  }

  renderSettingsMenuOption() {
    console.log('rendering...');
  }

  openSettings(e) {
    e.preventDefault();
    handleOpen(true);
  }
}
