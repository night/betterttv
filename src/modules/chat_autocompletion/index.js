// const watcher = require('../../watcher');
// const settings = require('../../settings');

// const CustomInputModule = require('./custom-input-module');
// const InputPatcherModule = require('./input-patcher-module');

class ChatAutocompletionModule {
    constructor() {
        // settings.add({
        //     id: 'tabAutocomplete',
        //     name: 'Tab Based Autocompletion',
        //     defaultValue: false,
        //     description: 'Autocomplete with Tab key'
        // });

        // this.customInput = new CustomInputModule();
        // this.patchedInput = new InputPatcherModule();

        // watcher.on('load.chat', () => this.load());
        // settings.on('changed.tabAutocomplete', () => this.load());
    }

    load() {
        if (settings.get('tabAutocomplete')) {
            this.customInput.enable();
            this.patchedInput.disable();
        } else {
            this.customInput.disable();
            this.patchedInput.enable();
        }
    }
}

module.exports = new ChatAutocompletionModule();
