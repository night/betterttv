module.exports = function handleBackground(tiled) {
    var tiled = tiled || false;
    if($("#custom-bg").length === 0 && $("#custom_bg").length === 0) return;

    var canvasID = ($("#custom-bg").length) ? 'custom-bg' : 'custom_bg';

    if(tiled) {
        $("#"+canvasID).addClass('tiled');
    } else {
        if($("#"+canvasID).attr("image")) {
            var img = new Image();
            img.onload = function() {
                if(img.naturalWidth < $('#main_col').width()) {
                    setTimeout(function(){
                        handleBackground(true);
                    }, 2000);
                }
            }
            img.src = $("#"+canvasID).attr("image");
        }
    }

    var g = $("#"+canvasID),
        d = g[0];
    if (d && d.getContext) {
        var c = d.getContext("2d"),
            h = $("#"+canvasID).attr("image");
        if (!h) {
            $(d).css("background-image", "");
            c.clearRect(0, 0, d.width, d.height);
        } else if (g.css({
            width: "100%",
            "background-position": "center top"
        }), g.hasClass("tiled")) {
            g.css({
                "background-image": 'url("' + h + '")'
            }).attr("width", 200).attr("height", 200);
            d = c.createLinearGradient(0, 0, 0, 200);
            if (bttv.settings.get("darkenedMode") === true) {
                d.addColorStop(0, "rgba(20,20,20,0.4)");
                d.addColorStop(1, "rgba(20,20,20,1)");
            } else {
                d.addColorStop(0, "rgba(245,245,245,0.65)");
                d.addColorStop(1, "rgba(245,245,245,1)");
            }
            c.fillStyle = d;
            c.fillRect(0, 0, 200, 200);
        } else {
            var i = document.createElement("IMG");
            i.onload = function () {
                var a = this.width,
                    d = this.height,
                    h;
                g.attr("width", a).attr("height", d);
                c.drawImage(i, 0, 0);
                if (bttv.settings.get("darkenedMode") === true) {
                    d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(20,20,20)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                } else {
                    d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(245,245,245)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                }
            };
            i.src = h;
        }
    }
}