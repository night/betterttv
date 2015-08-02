// Add an event listener to the "copy" event that fires when text is copied to
// the clipboard to convert any emoticons within the text selection to the
// corresponding text that will create the emoticon. This allows copy/pasted
// text to preserve emoticons within the Twitch chat (issue #234).
module.exports = function() {
    if (!('oncopy' in document)) {
        // Copy event is not supported.
        return;
    }

    var onCopy = function(e) {
        if (!e.clipboardData || !e.clipboardData.setData) {
            // Setting clipboard data is not possible. This is not currently
            // possible to detect without actually firing a real copy event.
            document.removeEventListener('copy', onCopy);
            return;
        }

        var emoticonSelector = 'img.emoticon';

        // Iterator to replace an element matching an emoticon image with its text.
        var replaceEmoticon = function(i, el) {
            var regex = decodeURIComponent($(el).data('regex'));
            $(el).after(regex).remove();
        };

        var selection = $(window.getSelection().getRangeAt(0).cloneContents());

        // The selection is a html fragment, so some of the jquery functions will
        // not work, so we work with the children.
        if (selection.children().is(emoticonSelector) || selection.children().find(emoticonSelector).length) {
            // The text contains an emoticon, so replace them with text that will
            // create the emoticon if possible.
            selection.children().filter(emoticonSelector).each(replaceEmoticon);
            selection.children().find(emoticonSelector).each(replaceEmoticon);
            // Get replaced selection text, and cleanup extra spacing
            selection = selection.text().replace(/\s+/g, ' ').trim();
            e.clipboardData.setData('text/plain', selection);
            // We want our data, not data from any selection, to be written to the clipboard
            e.preventDefault();
        }
    };

    document.addEventListener('copy', onCopy);
};

