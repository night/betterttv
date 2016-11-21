var styleRule = '.chat-messages, .chat-messages .chat-line { padding: <padding> !important; font-family: <family> !important; font-size: <size>px !important; }';
var defaultFontFamily = 'inherit'; // Inherit from parent
// Fetching these defaults dynamically takes too long since some style sheets load late
var defaultFontSize = 13.33333; // Fallback value (from BTTV 6.8R55)
var defaultTopPadding = 5; // Fallback value (from BTTV 6.8R55)
var defaultBottomPadding = 6; // Fallback value (from Twitch nov 2016)
var defaultLeftPadding = 10; // Fallback value (from BTTV 6.8R55)
var defaultRightPadding = 10; // Fallback value (from BTTV 6.8R55)
var topPaddingRatio = defaultTopPadding / defaultFontSize;
var bottomPaddingRatio = defaultBottomPadding / defaultFontSize;
var leftPaddingRatio = defaultLeftPadding / defaultFontSize;
var rightPaddingRatio = defaultRightPadding / defaultFontSize;
var fontFamily = '';
var fontSize = defaultFontSize;
var initFamilyCalled = false;
var initSizeCalled = false;

var styleSheetTextNode = (function() {
	  var styleElement = document.createElement('style');
	  document.head.appendChild(styleElement);
	  styleElement.appendChild(document.createTextNode('/* ChatFontSettings for BetterTTV */'));
    var styleTextNode = document.createTextNode('');
	  styleElement.appendChild(styleTextNode);
    return styleTextNode;
})();

function update() {
    if (fontFamily === '' && fontSize === defaultFontSize) {
        styleSheetTextNode.nodeValue = '';
        return true;
    } else if (fontSize > 0) {
        var padding = topPaddingRatio * fontSize + 'px ' + rightPaddingRatio * fontSize + 'px ' + bottomPaddingRatio * fontSize + 'px ' + leftPaddingRatio * fontSize + 'px';
        var font = (fontFamily.length > 0 ? fontFamily : defaultFontFamily);
        var cssText = styleRule.replace('<padding>', padding).replace('<family>', font).replace('<size>', fontSize);
        styleSheetTextNode.nodeValue = cssText;
        return true;
    } else {
        fontSize = defaultFontSize;
        bttv.settings.save('chatFontSize', defaultFontSize);
        return false;
    }
}

function init() {
    if (initFamilyCalled && initSizeCalled) {
        fontFamily = bttv.settings.get('chatFontFamily');
        fontSize = bttv.settings.get('chatFontSize');
        update();
    }
}

exports.initFontFamily = function() {
    initFamilyCalled = true;
    init();
};

exports.initFontSize = function() {
    initSizeCalled = true;
    init();
};

exports.setFontFamily = function(font) {
    fontFamily = font;
    if (update()) {
        var message = 'Chat font is now set to: ' + fontFamily;
        if (fontFamily.length === 0) {
            message = message + '(default)';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};

exports.setFontSize = function(size) {
    fontSize = size;
    if (update()) {
        var message = 'Chat font size is now set to: ' + fontSize + 'px';
        if (fontSize === defaultFontSize) {
            message = message + ' (default)';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};
