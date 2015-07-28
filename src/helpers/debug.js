module.exports = {
    log: function() {
        if(!window.console || !console.log || !bttv.settings.get('consoleLog') === true) return;
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console.log, ['BTTV:'].concat(args));
    }
};