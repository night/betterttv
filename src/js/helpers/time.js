exports.secondsToLength = function(s) {
    var days = Math.floor(s / 86400);
    var hours = Math.floor(s / 3600) - (days * 24);
    var minutes = Math.floor(s / 60) - (days * 1440) - (hours * 60);
    var seconds = s - (days * 86400) - (hours * 3600) - (minutes * 60);

    return (days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ', ' : '') +
        (hours > 0 ? hours + ' hour' + (hours === 1 ? '' : 's') + ', ' : '') +
        (minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') + ', ' : '') +
        seconds + ' second' + (seconds === 1 ? '' : 's');
};
