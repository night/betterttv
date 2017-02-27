function escape(text) {
    return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}

function stripAll(haystack, needle) {
    while (haystack.indexOf(needle) > -1) {
        haystack = haystack.replace(needle, '');
    }
    return haystack;
}

function mustacheFormat(string, replacements) {
    return string.replace(/\{\{(.*?)\}\}/g, (_, key) => replacements[key]);
}

module.exports = {
    escape,
    stripAll,
    mustacheFormat
};
