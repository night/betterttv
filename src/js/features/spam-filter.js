function checkRepetition(pattern, message, count) {
    if (count > 1) return pattern.trim();

    var x = message.substr(0, pattern.length),
        xs = message.substr(pattern.length);

    if (pattern === x) {
        return checkRepetition(pattern, xs, count + 1);
    } else {
        return false;
    }
}

function isSpamRecursive(current, next) {
    if (next.length === 0) {
        return false;
    }
    var repeat = checkRepetition(current, next, 0);
    return repeat || isSpamRecursive(current + next[0], next.substr(1));
}

function traverse(msg, count) {
    if (count > 30) return false;
    var check = isSpamRecursive(msg[0], msg.substr(1));
    return check || traverse(msg.substr(1), count + 1);
}

exports.filterRepetitive = function(msg) {
    var repetitive = traverse(msg.replace(/\s+/g, ' '), 0);
    return repetitive || msg;
};
