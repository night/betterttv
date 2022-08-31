import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ContextMenu from '../components/Menu.jsx';

let mountedNode;

export default class ChatContextMenu {
  constructor() {
    this.load();
  }

  load() {
    if ($('#bttvContextMenu').length) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvContextMenu');
    $('body').append(panel);
    if (mountedNode != null) {
      ReactDOM.unmountComponentAtNode(mountedNode);
    }
    ReactDOM.render(<ContextMenu />, panel);
    mountedNode = panel;
  }
}
