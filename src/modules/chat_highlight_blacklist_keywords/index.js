const watcher = require('../../watcher');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');
const {escape: escapeRegExp} = require('../../utils/regex');

const PHRASE_REGEX = /\{.+?\}/g;
const USER_REGEX = /\(.+?\)/g;
const REPEATING_SPACE_REGEX = /\s\s+/g;

const BLACKLIST_KEYWORD_PROMPT = `Type some blacklist keywords. Messages containing keywords will be filtered from your chat.
        
Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, <> inside the {} to use exact search, and () around a single word to specify a username. Wildcards (*) are supported.`;
const HIGHLIGHT_KEYWORD_PROMPT = `Type some highlight keywords. Messages containing keywords will turn red to get your attention.
        
Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, <> inside the {} to use exact search, and () around a single word to specify a username. Wildcards (*) are supported.`;

function changeKeywords(promptBody, settingID) {
    let keywords = prompt(promptBody, settings.get(settingID) || '');
    if (keywords !== null) {
        keywords = keywords.trim().replace(REPEATING_SPACE_REGEX, ' ');
        settings.set(settingID, keywords);
    }
}

function computeKeywords(keywords) {
    const computedKeywords = [];
    const computedUsers = [];

    const phrases = keywords.match(PHRASE_REGEX);
    if (phrases) {
        phrases.forEach(phrase => {
            keywords = keywords.replace(phrase, '');
            computedKeywords.push(phrase.slice(1, -1).trim());
        });
    }

    const users = keywords.match(USER_REGEX);
    if (users) {
        users.forEach(user => {
            keywords = keywords.replace(user, '');
            computedUsers.push(user.slice(1, -1).trim());
        });
    }

    keywords.split(' ').forEach(keyword => {
        if (!keyword) return;
        computedKeywords.push(keyword);
    });

    return {
        computedKeywords,
        computedUsers
    };
}


let blacklistKeywords = [];
let blacklistUsers = [];
function computeBlacklistKeywords() {
    const keywords = settings.get('blacklistKeywords');
    if (typeof keywords !== 'string') return;

    const {computedKeywords, computedUsers} = computeKeywords(keywords);
    blacklistKeywords = computedKeywords;
    blacklistUsers = computedUsers;
}

let highlightKeywords = [];
let highlightUsers = [];
function computeHighlightKeywords() {
    const keywords = settings.get('highlightKeywords');
    if (typeof keywords !== 'string') return;

    const {computedKeywords, computedUsers} = computeKeywords(keywords);
    highlightKeywords = computedKeywords;
    highlightUsers = computedUsers;
}

function wildcard(keyword) {
    return keyword.replace(/\*/g, '[^ ]*');
}

function exactMatch(keyword) {
    return keyword.replace(/^<(.*)>$/g, '^$1$$');
}

function keywordRegEx(keyword) {
    return new RegExp(`(\\s|^|@)${keyword}([!.,:';?/]|\\s|\$)`, 'i');
}

function fromContainsKeyword(keywords, from) {
    for (const user of keywords) {
        if (user.toLowerCase() !== from) continue;
        return true;
    }
    return false;
}

function messageContainsKeyword(keywords, from, message) {
    for (let keyword of keywords) {
        keyword = escapeRegExp(keyword);
        keyword = wildcard(keyword);
        keyword = exactMatch(keyword);

        const currentUser = twitch.getCurrentUser();
        const filterCurrentUser = (currentUser && from !== currentUser.name) || !currentUser;
        if (filterCurrentUser && keywordRegEx(keyword).test(message)) return true;
    }
    return false;
}

class ChatHighlightBlacklistKeywordsModule {
    constructor() {
        watcher.on('load.chat', () => {
            computeBlacklistKeywords();
            computeHighlightKeywords();
        });
        watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));
        settings.on('changed.blacklistKeywords', computeBlacklistKeywords);
        settings.on('changed.highlightKeywords', computeHighlightKeywords);
    }

    setBlacklistKeywords() {
        changeKeywords(BLACKLIST_KEYWORD_PROMPT, 'blacklistKeywords');
    }

    setHighlightKeywords() {
        changeKeywords(HIGHLIGHT_KEYWORD_PROMPT, 'highlightKeywords');
    }

    onMessage($message, {from, message}) {
        if (fromContainsKeyword(blacklistUsers, from) || messageContainsKeyword(blacklistKeywords, from, message)) {
            this.markBlacklisted($message);
        }

        if (fromContainsKeyword(highlightUsers, from) || messageContainsKeyword(highlightKeywords, from, message)) {
            this.markHighlighted($message);
        }
    }

    markHighlighted($message) {
        $message.addClass('highlight');
    }

    markBlacklisted($message) {
        $message.hide();
    }
}

module.exports = new ChatHighlightBlacklistKeywordsModule();
