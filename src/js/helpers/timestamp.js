exports.timestamp = function(date) {
    var timestamp;
    try {
        timestamp = date.toLocaleTimeString();
    } catch (e) {
        timestamp = date.toISOString().split('.')[0].split('T')[1];
    }
    return timestamp ? timestamp.replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2') : '';
};
