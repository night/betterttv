var styleRule = '.chat-messages, .chat-messages .chat-line { <declarations> }';
var styleFontFamilyDeclaration = 'font-family: <family> !important; ';
var styleFontSizeDeclaration = 'font-size: <size> !important; ';
var stylePaddingDeclaration = 'padding: <padding> !important; ';
// Defaults from BTTV 6.8R55, fetching dynamically takes too long
var defaultFontSize = 13.33333;
var defaultTopPadding = 5;
var defaultBottomPadding = 6;
var defaultLeftPadding = 10;
var defaultRightPadding = 10;

var topPaddingRatio = defaultTopPadding / defaultFontSize;
var bottomPaddingRatio = defaultBottomPadding / defaultFontSize;
var leftPaddingRatio = defaultLeftPadding / defaultFontSize;
var rightPaddingRatio = defaultRightPadding / defaultFontSize;
var styleNode = null;
var fontFamily = '';
var fontSize = defaultFontSize;
var initFamilyCalled = false;
var initSizeCalled = false;

function createStyleSheet() {
    var styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleElement.appendChild(document.createTextNode('/* ChatFontSettings for BetterTTV */'));
    styleNode = document.createTextNode('');
    styleElement.appendChild(styleNode);
}

function getPadding(ratioToFont) {
    return (Math.round(ratioToFont * fontSize * 100) / 100) + 'px';
}

function update() {
    if (fontSize > 0) {
        if (fontFamily === '' && fontSize === defaultFontSize) {
            styleNode.nodeValue = '';
        } else {
            var styleDeclarations = '';
            if (fontFamily.length > 0) {
                var fontFamilyValue = (fontFamily.indexOf(' ') >= 0 ? '\"' + fontFamily + '\"' : fontFamily);
                styleDeclarations = styleFontFamilyDeclaration.replace('<family>', fontFamilyValue);
            }
            if (fontSize !== defaultFontSize) {
                var fontSizeValue = fontSize + 'px';
                var paddingValue = getPadding(topPaddingRatio) + ' ' + getPadding(rightPaddingRatio) + ' ' + getPadding(bottomPaddingRatio) + ' ' + getPadding(leftPaddingRatio);
                styleDeclarations = styleDeclarations + styleFontSizeDeclaration.replace('<size>', fontSizeValue) + stylePaddingDeclaration.replace('<padding>', paddingValue);
            }
            styleNode.nodeValue = styleRule.replace('<declarations>', styleDeclarations);
        }
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
