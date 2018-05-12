const $ = require('jquery');
const settings = require('../../settings');

class HideAtMentionsModule {
    constructor() {
        settings.add({
            id: 'hideAtMentions',
            name: 'Hide hightlight \@mentions',
            defaultValue: false,
            description: 'Hides the random \@mentions highlighting in chat \(your name still highlights\)'
        });
        settings.on('changed.hideAtMentions', () => this.toggleAtMentions());

        this.toggleAtMentions();
    }

    toggleAtMentions() {
        if (settings.get('hideAtMentions') === false) return;
        const css = document.createElement('style');
        css.innerHTML = '.tw-theme--dark .mention-fragment.mention-fragment--recipient{background-color: #4b367c;color:inherit}.tw-theme--dark .mention-fragment:not(.mention-fragment--recipient){background-color: transparent;}.tw-theme--light .mention-fragment.mention-fragment--recipient{background-color: #dad8de;color:inherit}.tw-theme--light .mention-fragment:not(.mention-fragment--recipient){background-color: transparent;}.mention-fragment--recipient{background-color: #dad8de;color:inherit}.mention-fragment:not(.mention-fragment--recipient){background-color: transparent;}';
        $('body').append(css);
    }
}

module.exports = new HideAtMentionsModule();
