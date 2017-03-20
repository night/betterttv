const $ = require('jquery');

const BTTV_SETTINGS_PROMPT_CLASS  = 'bttvChatSettingsPrompt';
// could add icons if desired
const chatSettingsPromptTemplate = ({title, text, currentValue}) => `
<div class="${BTTV_SETTINGS_PROMPT_CLASS}">
    <div class="promptHead">${title}</div>
    <div class="promptBody">
        ${text}
        <input type="text" class="promptValue" value="${currentValue}">
        <div style="display:block;text-align:right;width:100%">
            <button class="promptSave">Save</button>
            <button class="promptCancel">Cancel</button>
        </div>
    </div>
</div>
`;

function showPrompt(config, currentValue, callback) {
    const promptSelector = '.' + BTTV_SETTINGS_PROMPT_CLASS;
    $(promptSelector).remove(); // clear current prompt

    config.currentValue = currentValue;
    const $prompt = $(chatSettingsPromptTemplate(config));

    $prompt.find('.promptCancel').on('click', () => {
        $(promptSelector).remove();
    });
    $prompt.find('.promptSave').on('click', () => {
        const value = $prompt.find('.promptValue').val();
        callback(value);
        $(promptSelector).remove();
    });

    $('body').append($prompt);
    $prompt.css('margin-top', -($prompt.outerHeight() / 2)); // center based on computed height
}

module.exports = showPrompt;
