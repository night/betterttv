var debounce = require('lodash.debounce');

exports.enablePreview = function() {
    var enter = debounce(function() {
        var url = this.href;

        $.get('https://api.betterttv.net/2/image_embed/' + encodeURIComponent(url)).done(function(data) {
            $(this).tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return data; }
            });
            $(this).tipsy('show');
        }.bind(this));
    }, 250);

    var leave = function() {
        enter.cancel();
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    };

    $(document).on({
        mouseenter: enter,
        mouseleave: leave
    }, 'a.chat-preview');
};

exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.chat-preview');
};
