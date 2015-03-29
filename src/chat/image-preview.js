
// Add mouseover image preview to image links
module.exports = function(imgUrl) {
    return '<a href="' + imgUrl + '" class="preview" target="_blank">' + imgUrl + '</a>';
};
