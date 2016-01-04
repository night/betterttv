var vars = require('../vars');
var debug = require('../helpers/debug');
var escapeRegExp = require('../helpers/regex').escapeRegExp;

exports.blacklistFilter = function(data) {
    var blacklistKeywords = [];
    var blacklistUsers = [];

    var keywords = bttv.settings.get('blacklistKeywords').toString();
    var phraseRegex = /\{.+?\}/g;

    var testCases;
    try {
        testCases = keywords.match(phraseRegex);
    } catch (e) {
        debug.log(e);
        return false;
    }

    var i;
    if (testCases) {
        for (i = 0; i < testCases.length; i++) {
            var testCase = testCases[i];
            keywords = keywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
            blacklistKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }
    if (keywords !== '') {
        keywords = keywords.split(' ');
        keywords.forEach(function(keyword) {
            if (/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                blacklistUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                blacklistKeywords.push(keyword);
            }
        });
    }

    for (i = 0; i < blacklistKeywords.length; i++) {
        var keyword = escapeRegExp(blacklistKeywords[i]).replace(/\*/g, '[^ ]*');
        var blacklistRegex = new RegExp(keyword, 'i');
        if (blacklistRegex.test(data.message) && vars.userData.name !== data.from) {
            return true;
        }
    }

    for (i = 0; i < blacklistUsers.length; i++) {
        var user = escapeRegExp(blacklistUsers[i]).replace(/\*/g, '[^ ]*');
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    return false;
};

exports.highlighting = function(data) {
    var audibleFeedback = require('../features/audible-feedback');

    var highlightKeywords = [];
    var highlightUsers = [];
    var i;

    var extraKeywords = bttv.settings.get('highlightKeywords');
    var useRegex = bttv.settings.get('regexHighlights');

    var highlightRegex = [];
    if (useRegex) {
        // Pull the regular expressions out first so curly braces
        // in the expression won't double count as phrases
        var regexPhrase = /;.+?;/g;
        var regexStrings;
        try {
            regexStrings = extraKeywords.match(regexPhrase);
        } catch (e) {
            debug.log(e);
            return false;
        }
        if (regexStrings) {
            for (i = 0; i < regexStrings.length; i++) {
                var regexString = regexStrings[i];
                debug.log(regexString);
                extraKeywords = extraKeywords.replace(regexString, '')
                    .replace(/s\s\s+/g, ' ').trim();
                highlightRegex.push(regexString.replace(/(^;|;$)/g, '')
                                    .trim());
            }
        }
    }

    var phraseRegex = /\{.+?\}/g;
    var testCases;
    try {
        testCases = extraKeywords.match(phraseRegex);
    } catch (e) {
        debug.log(e);
        return false;
    }

    if (testCases) {
        for (i = 0; i < testCases.length; i++) {
            var testCase = testCases[i];
            extraKeywords = extraKeywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
            highlightKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }

    if (extraKeywords !== '') {
        extraKeywords = extraKeywords.split(' ');
        extraKeywords.forEach(function(keyword) {
            if (/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                highlightUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                highlightKeywords.push(keyword);
            }
        });
    }

    for (i = 0; i < highlightKeywords.length; i++) {
        var hlKeyword = escapeRegExp(highlightKeywords[i]).replace(/\*/g, '[^ ]*');
        var wordRegex = new RegExp('(\\s|^|@)' + hlKeyword + '([!.,:\';?/]|\\s|$)', 'i');
        if (vars.userData.isLoggedIn && vars.userData.name !== data.from && wordRegex.test(data.message)) {
            if (bttv.chat.store.activeView === false) {
                if (bttv.settings.get('highlightFeedback') === true) {
                    audibleFeedback.play();
                }

                if (bttv.settings.get('desktopNotifications') === true) {
                    bttv.notify('You were mentioned by {{name}} in {{channel}}\'s channel: {{message}}'
                        .replace('{{name}}', data.from)
                        .replace('{{channel}}', bttv.chat.helpers.lookupDisplayName(bttv.getChannel()))
                        .replace('{{message}}', data.message.substr(0, 100)));
                }
            }
            return true;
        }
    }

    for (i = 0; i < highlightUsers.length; i++) {
        var user = escapeRegExp(highlightUsers[i]).replace(/\*/g, '[^ ]*');
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    if (useRegex) {
        for (i = 0; i < highlightRegex.length; i++) {
            debug.log('Testing' + highlightRegex);
            regex = new RegExp(highlightRegex[i], 'g');
            if (regex.test(data.message)) {
                return true;
            }
        }
    }


    return false;
};
