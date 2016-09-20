/*
* filter-repetitive.js
* by Gustavo Abranches (http://github.com/gabranches)
*
* This feature detects messages which have a repetitive pattern, and returns the pattern only once.
* Also detects attempts to avoid r9k mode.
* A repetitive message is a message that repeats the same pattern more than three times.
*
* Example 1:
* Input: SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa
* Output: SPAM Kappa
*
* Example 2:
* Input: 123 SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa
* Output: SPAM Kappa
*
* Example 3:
* Input: SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa SPAM Kappa 123
* Output: SPAM Kappa
*
* Example 4:
* Input: Kappa Kappa
* Output: Kappa Kappa
*
* Example 5:
* Input: Kappa\sKappa\sKappa\sKappa\s
* Output: Kappa
*/

/*
* Function: checkRepetition
* Checks if a pattern repeats immediately at the beginning of a given string.
* If it repeats more than 3 times, return the trimmed pattern.
*/

function checkRepetition(pattern, message, count) {
    if (count > 2) return pattern.trim();

    var x = message.substr(0, pattern.length),
        xs = message.substr(pattern.length);

    if (pattern === x) {
        return checkRepetition(pattern, xs, count + 1);
    } else {
        return false;
    }
}

/*
* Function: isSpamRecursive
* A recursive function that checks if the current pattern repeats using checkRepetition.
* If it does not repeat, append the first character from 'next' to 'current' and repeat until base case.
*/

function isSpamRecursive(current, next) {
    if (next.length === 0) {
        return false;
    }
    var repeat = checkRepetition(current, next, 0);
    return repeat || isSpamRecursive(current + next[0], next.substr(1));
}

/*
* Function: traverse
* A recursive function that iterates through a string from left to right and passes the current
* string to isSpamRecursive.
*/

function traverse(msg, count) {
    if (count > 50) return false;
    return isSpamRecursive(msg[0], msg.substr(1)) || traverse(msg.substr(1), count + 1);
}

/*
* Call this module by passing in the message to be checked.
* If there is repetition, the pattern is returned.
* If not, the original message is returned.
*/

module.exports = function(msg) {
    return traverse(msg.replace(/\s+/g, ' '), 0) || msg;
};
