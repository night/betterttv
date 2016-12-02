var styleRule = '.ember-chat .chat-messages, .ember-chat .chat-messages .chat-line { <var> }';
var styleFontFamilyDeclaration = 'font-family: <var> !important; ';
var styleFontSizeDeclaration = 'font-size: <var> !important; ';
var fallbackFontFamily = 'sans-serif';

var styleNode = null;
var fontFamily = '';
var fontSize = 0;
var initFamilyCalled = false;
var initSizeCalled = false;

function createStyleSheet() {
    var styleElement = document.createElement('style');
    document.body.appendChild(styleElement);
    styleElement.appendChild(document.createTextNode('/* ChatFontSettings for BetterTTV */'));
    styleNode = document.createTextNode('');
    styleElement.appendChild(styleNode);
}

function update() {
    if (fontFamily === '' && fontSize === 0) {
        styleNode.nodeValue = '';
    } else {
        var styleDeclarations = '';
        if (fontFamily.length > 0) {
            var fontFamilyValue = (fontFamily.indexOf(' ') >= 0 ? '\"' + fontFamily + '\"' : fontFamily) + ', ' + fallbackFontFamily;
            styleDeclarations += styleFontFamilyDeclaration.replace('<var>', fontFamilyValue);
        }
        if (fontSize > 0) {
            styleDeclarations += styleFontSizeDeclaration.replace('<var>', fontSize + 'px');
        }
        styleNode.nodeValue = styleRule.replace('<var>', styleDeclarations);
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
    update();
    var message;
    if (fontFamily.length > 0) {
        message = message = 'Chat font is now set to: ' + fontFamily;
    } else {
        message = message = 'Chat font is now set to default.';
    }
    bttv.chat.helpers.serverMessage(message, true);
};

exports.setFontSize = function(size) {
    fontSize = size;
    update();
    var message;
    if (fontSize > 0) {
        message = 'Chat font size is now set to: ' + fontSize + 'px';
    } else {
        message = 'Chat font size is now set to default.';
    }
    bttv.chat.helpers.serverMessage(message, true);
};
