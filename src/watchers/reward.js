const domObserver = require('../observers/dom');

module.exports = () => {
    // Claim a bonus
    domObserver.on('.community-points-summary .tw-button.tw-button--success.tw-interactive', (node, isConnected) => {
        if (!isConnected) return;
        node.click();
    });
};
