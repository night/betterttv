module.exports = {
    log: function (string) {
        if (window.console && console.log) console.log("BTTV: " + string);
    },
    warn: function (string) {
        if (window.console && console.warn) console.warn("BTTV: " + string);
    },
    error: function (string) {
        if (window.console && console.error) console.error("BTTV: " + string);
    },
    info: function (string) {
        if (window.console && console.info) console.info("BTTV: " + string);
    }
};