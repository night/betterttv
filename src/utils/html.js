const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#x60;'
};

function escape(string) {
    return string.replace(/[<>"'`]/g, s => htmlEntities[s]);
}

module.exports = {
    escape
};
