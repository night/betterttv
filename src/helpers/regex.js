function escapeRegExp(text) {
    return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}

function stripAll(haystack, needle) {
    while (haystack.indexOf(needle) > -1) {
        haystack = haystack.replace(needle, '');
    }
    return haystack;
}

module.exports = {
    escapeRegExp,
    stripAll
};
