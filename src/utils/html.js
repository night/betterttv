const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#x60;'
};

function escape(string) {
    return String(string).replace(/[<>"'`]/g, s => htmlEntities[s]);
}

module.exports = {
    escape
};
