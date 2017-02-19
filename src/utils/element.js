function remove(e) {
    $(e).each(() => $(this).hide());
}

function display(e) {
    $(e).each(() => $(this).show());
}

module.exports = {
    remove,
    display
};
