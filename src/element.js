exports.remove = function (e) {
    // Removes all of an element
    $(e).each(function () {
        $(this).hide();
    });
};
exports.display = function (e) {
    // Displays all of an element
    $(e).each(function () {
        $(this).show();
    });
};