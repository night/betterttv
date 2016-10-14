module.exports = function() {
    if (!window.Ember || !window.App) return;
    if (bttv.settings.get('disableChannelHeader') !== true) return;

    var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
    if (routeName.substr(0, 8) !== 'channel.') return;

    var channelDiv = $('.cn-content').parent();
    if (channelDiv.length === 0) return;

    var viewRegistry = App.__container__.lookup('-view-registry:main');
    var channelRedesign = viewRegistry[channelDiv[0].id];
    channelRedesign.set('channelCoverHeight', 0);
    $('.cn-cover.ember-view').height(0);
    $('.js-main-col-scroll-content').scrollTop(0);
};
