var styleRule = '.chat-messages, .chat-messages .chat-line { <declarations> }';
var styleFontFamilyDeclaration = 'font-family: <family> !important; ';
var styleFontSizeDeclaration = 'font-size: <size> !important; ';

var styleNode = null;
var fontFamily = '';
var fontSize = 0;
var initFamilyCalled = false;
var initSizeCalled = false;

function createStyleSheet() {
    var styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleElement.appendChild(document.createTextNode('/* ChatFontSettings for BetterTTV */'));
    styleNode = document.createTextNode('');
    styleElement.appendChild(styleNode);
}

function update() {
    if (fontSize >= 0) {
        if (fontFamily === '' && fontSize === 0) {
            styleNode.nodeValue = '';
        } else {
            var styleDeclarations = '';
            if (fontFamily.length > 0) {
                var fontFamilyValue = (fontFamily.indexOf(' ') >= 0 ? '\"' + fontFamily + '\"' : fontFamily);
                styleDeclarations = styleFontFamilyDeclaration.replace('<family>', fontFamilyValue);
            }
            if (fontSize > 0) {
                var fontSizeValue = fontSize + 'px';
                styleDeclarations = styleFontSizeDeclaration.replace('<size>', fontSizeValue);
            }
            styleNode.nodeValue = styleRule.replace('<declarations>', styleDeclarations);
        }
        return true;
    } else {
        fontSize = 0;
        bttv.settings.save('chatFontSize', 0);
        return false;
    }
}

function init() {
    if (initFamilyCalled && initSizeCalled) {
        fontFamily = bttv.settings.get('chatFontFamily');
        fontSize = bttv.settings.get('chatFontSize');
        createStyleSheet();
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
        var message;
        if (fontFamily.length > 0) {
            message = 'Chat font is now set to: ' + fontFamily;
        } else {
            message = 'Chat font is now set to default.';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};

exports.setFontSize = function(size) {
    fontSize = size;
    if (update()) {
        var message;
        if (fontSize > 0) {
            message = 'Chat font size is now set to: ' + fontSize + 'px';
        } else {
            message = 'Chat font size is now set to default.';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};
