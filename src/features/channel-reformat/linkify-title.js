var debug = require('../../debug'),
    vars = require('../../vars');

module.exports = function () {
    if($('#broadcast-meta .title .real').length && !$('.archive_info').length) {
        if(vars.linkifyTimer) clearInterval(vars.linkifyTimer);

        var $title = $('#broadcast-meta .title .real');

        var linkifyTitle = function() {
            var originalTitle = $title.text().replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var linkifiedTitle = bttv.chat.templates.linkify(originalTitle);

            $('#broadcast-meta .title span').each(function() {
                $(this).html(linkifiedTitle);
            });
        }

        linkifyTitle();

        vars.linkifyTimer = setInterval(function() {
            if(!vars.channelTitle) vars.channelTitle = "";
            if($title.html() !== vars.channelTitle) {
                vars.channelTitle = $title.html();
                linkifyTitle();
            }
        }, 1000);
    }
}