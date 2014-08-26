var debug = require('debug'),
    vars = require('vars');

module.exports = function () {
    if($('#broadcast-meta .title .real').length) {
        if(vars.linkifyTimer) clearInterval(vars.linkifyTimer);

        var linkifyTitle = function() {
            var linkifiedTitle = bttv.chat.templates.linkify($('#broadcast-meta .title .real').text());

            $('#broadcast-meta .title span').each(function() {
                $(this).html(linkifiedTitle);
            });
        }

        linkifyTitle();

        vars.linkifyTimer = setInterval(function() {
            if(!vars.channelTitle) vars.channelTitle = "";
            if($('#broadcast-meta .title .real').html() !== vars.channelTitle) {
                vars.channelTitle = $('#broadcast-meta .title .real').html();
                linkifyTitle();
            }
        }, 1000);
    }
}