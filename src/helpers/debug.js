module.exports = {
    log: function(string) {
        if(window.console && console.log && bttv.settings.get('consoleLog') === true) console.log("BTTV: " + string);
    }
};