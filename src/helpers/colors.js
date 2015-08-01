/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
var rgbToHsl = exports.rgbToHsl = function(r, g, b) {
    // Convert RGB to HSL, not ideal but it's faster than HCL or full YIQ conversion
    // based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s,
        l = Math.min(Math.max(0, (max + min) / 2), 1),
        d = Math.min(Math.max(0, max - min), 1);

    if (d === 0) {
        h = s = d; // achromatic
    } else {
        s = l > 0.5 ? d / (2 * (1 - l)) : d / (2 * l);
        s = Math.min(Math.max(0, s), 1);
        switch (max) {
            case r: h = Math.min(Math.max(0, (g - b) / d + (g < b ? 6 : 0)), 6); break;
            case g: h = Math.min(Math.max(0, (b - r) / d + 2), 6); break;
            case b: h = Math.min(Math.max(0, (r - g) / d + 4), 6); break;
        }
        h /= 6;
    }
    return [h, s, l];
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set of integers [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
var hslToRgb = exports.hslToRgb = function(h, s, l) {
    // Convert HSL to RGB, again based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    var r, g, b, hueToRgb, q, p;

    if (s === 0) {
        r = g = b = Math.round(Math.min(Math.max(0, 255 * l), 255)); // achromatic
    } else {
        hueToRgb = function(pp, qq, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
            if (t < 1 / 2) return qq;
            if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
            return pp;
        };
        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h + 1 / 3)), 255));
        g = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h)), 255));
        b = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h - 1 / 3)), 255));
    }
    return [r, g, b];
};

exports.calculateColorBackground = function(color) {
    // Converts HEX to YIQ to judge what color background the color would look best on
    color = String(color).replace(/[^0-9a-f]/gi, '');
    if (color.length < 6) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    var r = parseInt(color.substr(0, 2), 16);
    var g = parseInt(color.substr(2, 2), 16);
    var b = parseInt(color.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'dark' : 'light';
};

exports.calculateColorReplacement = function(color, background) {
    // Modified from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
    // Modified further to use HSL as an intermediate format, to avoid hue-shifting
    // toward primaries when darkening and toward secondaries when lightening
    var rgb, hsl, light = (background === 'light'), factor = (light ? 0.1 : -0.1), r, g, b, l;

    color = String(color).replace(/[^0-9a-f]/gi, '');
    if (color.length < 6) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    r = parseInt(color.substr(0, 2), 16);
    g = parseInt(color.substr(2, 2), 16);
    b = parseInt(color.substr(4, 2), 16);
    hsl = rgbToHsl(r, g, b);

    // more thoroughly lightens dark colors, with no problems at black
    l = (light ? 1 - (1 - factor) * (1 - hsl[2]) : (1 + factor) * hsl[2]);
    l = Math.min(Math.max(0, l), 1);

    rgb = hslToRgb(hsl[0], hsl[1], l);
    r = rgb[0].toString(16);
    g = rgb[1].toString(16);
    b = rgb[2].toString(16);

    // note to self: .toString(16) does NOT zero-pad
    return '#' + ('00' + r).substr(r.length) +
                 ('00' + g).substr(g.length) +
                 ('00' + b).substr(b.length);
};

exports.getRgb = function(color) {
    // Convert HEX to RGB
    var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return regex ? {
        r: parseInt(regex[1], 16),
        g: parseInt(regex[2], 16),
        b: parseInt(regex[3], 16)
    } : {
        r: 0,
        g: 0,
        b: 0
    };
};

exports.getHex = function(color) {
    // Convert RGB object to HEX String
    var convert = function(c) {
        return ('0' + parseInt(c, 10).toString(16)).slice(-2);
    };
    return '#' + convert(color.r) + convert(color.g) + convert(color.b);
};
