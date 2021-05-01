import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import BTTVWindow from './bttv-components/popout.js';
import domObserver from '../../observers/dom.js';
class SettingsModule {
  constructor() {
    this.renderSettings();
    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"]', () => {
      this.renderSettingsMenuOption();
    });
  }

  renderSettings() {
    if ($('#bttvSettings').length) return;

    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    $('body').append(panel);

    ReactDOM.render(
      <BTTVWindow open={false} setOpen={this.openSettings} />,
      document.getElementById('bttvSettingsPanel')
    );
  }

  renderSettingsMenuOption() {
    if ($('.bttvSettingsIconDropDown').length) return;

    $('a[data-a-target="settings-dropdown-link"]').parent('div.tw-full-width.tw-relative').after(`
            <div class="tw-full-width tw-relative">
                <a title="BetterTTV Settings" class="tw-block tw-border-radius-medium tw-full-width tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive bttvSettingsDropDown" href="#">
                    <div class="tw-align-items-center tw-flex tw-pd-05 tw-relative">
                        <div class="tw-align-items-center tw-flex tw-flex-shrink-0 tw-pd-r-05">
                            <div class="tw-align-items-center tw-drop-down-menu-item-figure tw-flex">
                                <div class="bttvSettingsIconContainer tw-align-items-center tw-icon tw-inline-flex">
                                    <div class="tw-aspect tw-aspect--align-top">
                                        <div class="tw-aspect__spacer"></div>
                                        <figure class="icon bttvSettingsIconDropDown"></figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tw-flex-grow-1">BetterTTV Settings</div>
                    </div>
                </a>
            </div>
        `);

    $('.bttvSettingsIconDropDown').closest('a').click(this.openSettings);
  }

  openSettings(e) {
    e.preventDefault();
    ReactDOM.render(<BTTVWindow open={true} />, document.getElementById('bttvSettingsPanel'));
  }
}

export default new SettingsModule();
