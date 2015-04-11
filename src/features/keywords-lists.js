var vars = require('../vars');
var escapeRegExp = require('../helpers/regex').escapeRegExp;

exports.blacklistFilter = function (data) {
    var blacklistKeywords = [];
    var blacklistUsers = [];

    var keywords = bttv.settings.get("blacklistKeywords");
    var phraseRegex = /\{.+?\}/g;
    var testCases =  keywords.match(phraseRegex);
    if(testCases) {
        for (var i=0;i<testCases.length;i++) {
            var testCase = testCases[i];
            keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
            blacklistKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }
    if(keywords !== "") {
        keywords = keywords.split(" ");
        keywords.forEach(function (keyword) {
            if(/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                blacklistUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                blacklistKeywords.push(keyword);
            }
        });
    }

    for (var i = 0; i < blacklistKeywords.length; i++) {
        var keyword = escapeRegExp(blacklistKeywords[i]).replace(/\*/g, "[^ ]*");
        var blacklistRegex = new RegExp(keyword, 'i');
        if (blacklistRegex.test(data.message) && vars.userData.login !== data.from) {
            return true;
        }
    }

    for (var i = 0; i < blacklistUsers.length; i++) {
        var user = escapeRegExp(blacklistUsers[i]).replace(/\*/g, "[^ ]*");
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    return false;
}

exports.highlighting = function (data) {
    var highlightFeedback = require('../features/highlight-feedback');

    var highlightKeywords = [];
    var highlightUsers = [];

    var extraKeywords = bttv.settings.get("highlightKeywords");
    var phraseRegex = /\{.+?\}/g;
    var testCases =  extraKeywords.match(phraseRegex);
    if(testCases) {
        for (var i=0;i<testCases.length;i++) {
            var testCase = testCases[i];
            extraKeywords = extraKeywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
            highlightKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }
    if(extraKeywords !== "") {
        extraKeywords = extraKeywords.split(" ");
        extraKeywords.forEach(function (keyword) {
            if(/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                highlightUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                highlightKeywords.push(keyword);
            }
        });
    }

    for (var i = 0; i < highlightKeywords.length; i++) {
        var hlKeyword = escapeRegExp(highlightKeywords[i]).replace(/\*/g, "[^ ]*");
        var wordRegex = new RegExp('(\\s|^|@)' + hlKeyword + '([!.,:\';?/]|\\s|$)', 'i');
        if (vars.userData.isLoggedIn && vars.userData.login !== data.from && wordRegex.test(data.message)) {
            if(bttv.settings.get("desktopNotifications") === true && bttv.chat.store.activeView === false) {
                bttv.notify("You were mentioned in "+bttv.chat.helpers.lookupDisplayName(bttv.getChannel())+"'s channel.");
                highlightFeedback();
            }
            return true;
        }
    }

    for (var i = 0; i < highlightUsers.length; i++) {
        var user = escapeRegExp(highlightUsers[i]).replace(/\*/g, "[^ ]*");
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    return false;
}