var styleRule = '.ember-chat .chat-messages, .ember-chat .chat-messages .chat-line { <var> }';
var styleFontFamilyDeclaration = 'font-family: <var>; ';
var styleFontSizeDeclaration = 'font-size: <var>; ';
var styleLineHeightDeclaration = 'line-height: <var>; ';
var stylePaddingDeclaration = 'padding: <var>; ';
var defaultCheckingInterval = 200;
var styleSheetBttvFileName = 'betterttv.css';

var defaultFontFamily = '';
var defaultFontSize = 0;
var defaultLineHeight = 0;
var defaultTopPadding = 0;
var defaultRightPadding = 0;
var defaultBottomPadding = 0;
var defaultLeftPadding = 0;

var styleSheetBttvLoaded = false;
var defaultsLoaded = false;
var styleSheetCreated = false;
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

function getLineHeight() {
    return (Math.round(defaultLineHeight / defaultFontSize * fontSize * 100) / 100) + 'px';
}

function getPaddingSide(ratioToFont) {
    return (Math.round(ratioToFont * fontSize * 100) / 100) + 'px';
}

function getPadding() {
    var topPadding = getPaddingSide(defaultTopPadding / defaultFontSize);
    var rightPadding = getPaddingSide(defaultRightPadding / defaultFontSize);
    var bottomPadding = getPaddingSide(defaultBottomPadding / defaultFontSize);
    var leftPadding = getPaddingSide(defaultLeftPadding / defaultFontSize);
    return topPadding + ' ' + rightPadding + ' ' + bottomPadding + ' ' + leftPadding;
}

function update() {
    if (!defaultsLoaded) {
    } else if (fontSize >= 0) {
        if (!styleSheetCreated) {
            // Create after defaults are loaded, so that it's placed after defaults in DOM.
            createStyleSheet();
            styleSheetCreated = true;
        }
        if (fontFamily === '' && fontSize === 0) {
            styleNode.nodeValue = '';
        } else {
            var styleDeclarations = '';
            if (fontFamily.length > 0) {
                var fontFamilyValue = (fontFamily.indexOf(' ') >= 0 ? '\"' + fontFamily + '\"' : fontFamily);
                styleDeclarations += styleFontFamilyDeclaration.replace('<var>', fontFamilyValue);
            }
            if (fontSize > 0) {
                styleDeclarations += styleFontSizeDeclaration.replace('<var>', fontSize + 'px');
                styleDeclarations += styleLineHeightDeclaration.replace('<var>', getLineHeight());
                styleDeclarations += stylePaddingDeclaration.replace('<var>', getPadding());
            }
            styleNode.nodeValue = styleRule.replace('<var>', styleDeclarations);
        }
        return true;
    } else {
        fontSize = 0;
        bttv.settings.save('chatFontSize', 0);
        return false;
    }
}

function loadDefaults(style) {
    defaultFontFamily = style.fontFamily.split(',')[0].replace('\"', '').replace('\"', '');
    defaultFontSize = parseFloat(style.fontSize);
    defaultLineHeight = parseFloat(style.lineHeight);
    defaultTopPadding = parseFloat(style.paddingTop);
    defaultRightPadding = parseFloat(style.paddingRight);
    defaultBottomPadding = parseFloat(style.paddingBottom);
    defaultLeftPadding = parseFloat(style.paddingLeft);
}

function checkDefaults() {
    if (!styleSheetBttvLoaded) {
        var sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
            if (sheets[i].href && sheets[i].href.toLowerCase().indexOf(styleSheetBttvFileName)) {
                styleSheetBttvLoaded = true;
                break;
            }
        }
    }
    if (styleSheetBttvLoaded) {
        var firstChatLine = document.querySelector('.chat-messages .chat-line');
        if (firstChatLine !== null) {
            var style = window.getComputedStyle(firstChatLine);
            loadDefaults(style);
            defaultsLoaded = true;
            update();
        }
    }
    if (!defaultsLoaded) {
        setTimeout(checkDefaults, defaultCheckingInterval);
    }
}

function init() {
    if (initFamilyCalled && initSizeCalled) {
        checkDefaults();
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
        var message = 'Chat font is now set to: ';
        if (fontFamily.length > 0) {
            message += fontFamily;
        } else {
            message += defaultFontFamily + ' (default)';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};

exports.setFontSize = function(size) {
    fontSize = size;
    if (update()) {
        var message = 'Chat font size is now set to: ';
        if (fontSize > 0) {
            message += fontSize + 'px';
        } else {
            message += defaultFontSize + 'px (default)';
        }
        bttv.chat.helpers.serverMessage(message, true);
    }
};
