var debug = require('../debug');
var pollTemplate = require('../templates/embedded-poll');

var frameTimeout = null;

module.exports = function (pollId) {
    if(!bttv.settings.get('embeddedPolling')) return;

    var $poll = $('#bttv-poll-contain');
    
    // If poll exists and there's an iframe open, don't do anything.
    if($poll.length && $poll.children('.frame').is(':visible')) return;

    // Otherwise, if the poll exists delete the poll
    if($poll.length) $poll.remove();

    // Push new poll to DOM
    $('.ember-chat .chat-room').append(pollTemplate({ pollId: pollId }));

    // Reset $poll to newly created poll
    $poll = $('#bttv-poll-contain');
    
    // If timeout exists already, clear it
    if(frameTimeout !== null) {
        clearTimeout(frameTimeout);
    }
    
    // After 30 seconds, remove poll if user doesn't open it
    frameTimeout = setTimeout(function() {
        if($poll && !$poll.children('.frame').is(':visible')) $poll.remove();
    }, 30000);

    // User manually closes the poll
    $poll.children('.close').on('click', function() {
        $poll.remove();
    });

    // User opens the poll
    $poll.children('.title').on('click', function() {
        $poll.children('.frame').show();
        $poll.children('.title').text('Thanks!');
        $poll.css('height', '450px');
    });

    $poll.slideDown(200);
}
