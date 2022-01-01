import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import Button from './Button.jsx';

const CHAT_BUTTON_CONTAINER_SELECTOR = '#picker-buttons';
const BTTV_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-settings-button-container"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedNode;

export default class SettingsModule {
  constructor() {
    this.renderSettings();
    domObserver.on(CHAT_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadButton();
    });
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

  loadButton() {
    const bttvContainer = document.querySelector(BTTV_BUTTON_CONTAINER_SELECTOR);

    if (bttvContainer == null) {
      const nativeButtonContainer = document.querySelector(CHAT_BUTTON_CONTAINER_SELECTOR);
      if (nativeButtonContainer == null) {
        return;
      }
      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'bttv-button-container');
      nativeButtonContainer.insertBefore(buttonContainer, nativeButtonContainer.firstChild);

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <Button
          onClick={() => {
            console.log('here');
            handleOpen(true);
          }}
        />,
        buttonContainer
      );

      mountedNode = buttonContainer;
    }
  }

  openSettings(e) {
    e.preventDefault();
    handleOpen(true);
  }
}
