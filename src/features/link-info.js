
/* CONFIG */
var refreshTime = 60 * 1000;
var refreshTimeTwitch = 10 * 1000;

/* END CONFIG */

var lookup = {
    'youtube': function(link, data, callback) {
        $.getJSON('https://www.youtube.com/oembed?url=' + data + '&format=json').done(function(d) { /// REQUIRES ATTENTION: change to BTTV API
            (typeof d === 'object' && typeof d.title === 'string') ? callback(d.title) : callback(false);
        }).error(function() {
            callback(false);
            setTimeout(function() {cache[link] = undefined;} , refreshTime);
        });
    },
    'tiny': function(link, data, callback) {
        $.getJSON('http://api.unshorten.it?shortURL=' + data + '&responseFormat=json&apiKey=' + 'YOUR_API_KEY').done(function(d) { /// REQUIRES ATTENTION: insert API key
            (typeof d === 'object' && typeof d.fullurl === 'string') ? callback(d.fullurl) : callback(false);
        }).error(function() {
            callback(false);
            setTimeout(function() {cache[link] = undefined;} , refreshTime);
        });
    },
    'twitch': function(link, data, callback) {
        bttv.TwitchAPI.get('streams/' + data).done(function(d) {
            (typeof d === 'object' && d.stream !== null) ? callback('This channel is:<br><div style="color: rgb(0, 255, 0);">LIVE NOW</div>') : callback('This channel is:<br><div style="color: rgb(255, 0, 0);">OFFLINE</div>');
            setTimeout(function() {cache[link] = undefined;} , refreshTimeTwitch);
        }).fail(function() {
            callback(false);
            setTimeout(function() {cache[link] = undefined;} , refreshTimeTwitch);
        });
    },
};

var enableLinkInfo = exports.enableLinkInfo = function() {
    /* CONFIG */
    var xOffset = 0,
        yOffset = -23;

    /* END CONFIG */
    $(document).on({
        mouseenter: function (e) {
            var type = $(this).attr('link-type')
            var data = decodeURIComponent($(this).attr('link-data'));
            var link = this.href
            currentTarget = link;
            if (typeof cache[link] === 'undefined') {
                cache[link] = false;
                $("body").append('<div id="info-link-box" style="display: block; visibility: visible; opacity: 0.8;"><div class="tipsy-inner"><div style="color: rgb(127, 127, 127);">Loading...</div></div></div>');
                lookup[type](link, data, function(returned) {
                    cache[link] = returned || '<div style="color: rgb(127, 127, 127);">Failed to load.</div>';
                    if (link === currentTarget) $("#info-link-box div.tipsy-inner").html(cache[link]);
                });
            } else if (cache[link]) {
                $("body").append('<div id="info-link-box" style="display: block; visibility: visible; opacity: 0.8;"><div class="tipsy-inner">' + cache[link] + '</div></div>');
            } else {
                $("body").append('<div id="info-link-box" style="display: block; visibility: visible; opacity: 0.8;"><div class="tipsy-inner"><div style="color: rgb(127, 127, 127);">Loading...</div></div></div>');
            }
            $("#info-link-box")
                .css("top",(e.pageY - yOffset) + "px")
                .css("left", (e.pageX - xOffset) + "px")
                .css("position", "absolute")
                .css("z-index", '100')
                .fadeIn("fast");
        }, mouseleave: function (e) {
            currentTarget = false;
            $("#info-link-box").remove();
        }, mousemove: function (e) {
            $("#info-link-box")
            .css("top",(e.pageY - yOffset) + "px")
            .css("left",(e.pageX + xOffset) + "px");
        }
    }, 'a.info-link');
};

var disableLinkInfo = exports.disableLinkInfo = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.info-link');
};

var cache = {};

var currentTarget = false;
