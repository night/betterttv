var debug = require('../helpers/debug');

module.exports = function() {
    if (
        bttv.settings.get('showDirectoryLiveTab') === true &&
        $('h2.title:contains("Following")').length &&
        $('a.active:contains("Overview")').length
    ) {
        debug.log('Changing Directory View');

        $('a[href="/directory/following/live"]').click();
    }
};
