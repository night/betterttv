exports.enablePreview = function() {
    $(document).on({
        mouseenter: function() {
            var url = this.href;

            $(this).tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return '<iframe id="chat_preview" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" width="200px" scrolling="no" src="https://api.betterttv.net/2/image_embed/' + encodeURIComponent(url) + '"></iframe>'; }
            });
            $(this).tipsy('show');
        }, mouseleave: function() {
            $(this).tipsy('hide');
            $('div.tipsy').remove();
        }
    }, 'a.chat-preview');
};

exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.chat-preview');
};
