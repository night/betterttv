const html = require('../../utils/html');
const twitch = require('../../utils/twitch');
const nicknames = require('../chat_nicknames');

const DEFAULT_AVATAR = 'https://www-cdn.jtvnw.net/images/xarth/404_user_300x300.png';
const channelURL = name => `https://www.twitch.tv/${encodeURIComponent(name)}`;

module.exports = function moderatorCard(user, top, left) {
    const nickname = nicknames.get(user.name);
    const currentUser = twitch.getCurrentUser();

    let realName = '';
    if (nickname || user.display_name.toLowerCase() !== user.name) {
        realName = `<h4 class="real-name">${html.escape(user.name)}</h4>`;
    }

    let background = '';
    if (user.profileBanner) {
        background = `<img class="channel_background" src="${html.escape(user.profile_banner)}" />`;
    }

    let controls = '';
    if (currentUser && user.id !== currentUser.id) {
        const ownerControls = twitch.getCurrentUserIsOwner() ? (
            `<button title="Add/Remove this user as a moderator" class="button-simple dark mod-card-mod">
                <svg height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-add-mod">
                    <path clip-rule="evenodd" fill-rule="evenodd" d="M15,7L1,16l4.666-7H1l14-9l-4.667,7H15z"></path>
                </svg>
                <svg style="display: none;" height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-remove-mod">
                    <path clip-rule="evenodd" fill-rule="evenodd" d="M 1.7692223,7.3226542 14.725057,7.3226542 14.725057,8.199533 1.7692223,8.199533 z M 15,0 5.4375,6.15625 10.90625,6.15625 15,0 z M 5.375,9.40625 1,16 11.25,9.40625 5.375,9.40625 z"></path>
                </svg>
            </button>`
        ) : '';
        const modControls = twitch.getUserIsModerator(user.name) ? (
            `<span class="mod-controls">
                <button title="!permit this user" class="permit button-simple light">
                    <svg height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-permit">
                        <path clip-rule="evenodd" fill-rule="evenodd" d="M 13.71875,3.75 A 0.750075,0.750075 0 0 0 13.28125,4 L 5.71875,11.90625 3.59375,9.71875 A 0.750075,0.750075 0 1 0 2.53125,10.75 L 5.21875,13.53125 A 0.750075,0.750075 0 0 0 6.28125,13.5 L 14.34375,5.03125 A 0.750075,0.750075 0 0 0 13.71875,3.75 z M 4.15625,5.15625 C 2.1392444,5.1709094 0.53125,6.2956115 0.53125,7.6875 0.53125,8.1957367 0.75176764,8.6679042 1.125,9.0625 A 1.60016,1.60016 0 0 1 2.15625,8.25 C 2.0893446,8.0866555 2.0625,7.9078494 2.0625,7.71875 2.0625,6.9200694 2.7013192,6.25 3.5,6.25 L 7.15625,6.25 C 7.1438569,5.1585201 6.6779611,5.1379224 4.15625,5.15625 z M 9.625,5.15625 C 8.4334232,5.1999706 8.165545,5.4313901 8.15625,6.25 L 9.96875,6.25 11.03125,5.15625 C 10.471525,5.1447549 9.9897684,5.1428661 9.625,5.15625 z M 14.28125,6.40625 13.3125,7.40625 C 13.336036,7.5094042 13.34375,7.6089314 13.34375,7.71875 13.34375,8.5174307 12.67368,9.125 11.875,9.125 L 11.65625,9.125 10.65625,10.1875 C 10.841425,10.189327 10.941084,10.186143 11.15625,10.1875 13.17327,10.200222 14.78125,9.0793881 14.78125,7.6875 14.78125,7.2160918 14.606145,6.7775069 14.28125,6.40625 z M 4.40625,7.1875 C 4.0977434,7.1875 3.84375,7.4414933 3.84375,7.75 3.84375,8.0585065 4.0977434,8.3125 4.40625,8.3125 L 8,8.3125 9.0625,7.1875 4.40625,7.1875 z M 4.125,9.125 5.15625,10.1875 C 5.5748133,10.180859 5.9978157,10.155426 6.25,10.125 L 7.15625,9.1875 C 7.1572971,9.1653754 7.1553832,9.1481254 7.15625,9.125 L 4.125,9.125 z"></path>
                    </svg>
                </button>
                <button data-time="1" title="Clear this user's chat" class="timeout button-simple light">1s</button>
                <button data-time="600" title="Temporary 10 minute ban" class="timeout button-simple light">10m</button>
                <button data-time="3600" title="Temporary 1 hour ban" class="timeout button-simple light">1h</button>
                <button data-time="28800" title="Temporary 8 hour ban" class="timeout button-simple light">8h</button>
                <button data-time="86400" title="Temporary 24 hour ban" class="timeout button-simple light">24h</button>
                <button title="Permanent Ban" class="ban button-simple light">&infin;</button>
            </span>`
        ) : '';

        controls = `
            <div class="interface">
                <div class="btn-wrapper">
                    <button class="button-simple primary mod-card-follow">Follow</button>
                    <button style="height: 30px;" title="Send user a whisper" class="button-simple dark mod-card-whisper">
                        <svg height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-conversations">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M15,11H8.6L4,15v-4H2V2h13V11z"></path>
                        </svg>
                    </button>
                    <button title="Add/Remove user from ignores" class="button-simple dark mod-card-ignore">
                        <svg height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-ignore">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z M11,7H5v1h6V7z"></path>
                        </svg>
                        <svg style="display: none;" height="16px" width="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-unignore">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z"></path>
                        </svg>
                    </button>
                    ${ownerControls}
                    ${modControls}
                </div>
            </div>
        `;
    }

    return `
        <div class="bttv-mod-card ember-view moderation-card" style="top: ${top}px;left: ${left}px;">
            <div class="close-button">
                <svg height="16px" version="1.1" viewbox="0 0 16 16" width="16px" x="0px" y="0px" class="svg-close">
                    <path clip-rule="evenodd" d="M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z" fill-rule="evenodd"></path>
                </svg>
            </div>
            <div class="card-header" style="background-color: #000">
                <img class="channel_logo" src="${html.escape(user.logo || DEFAULT_AVATAR)}" />
                <div class="drag-handle"></div>
                ${realName}
                <h3 class="name">
                    <a href="${channelURL(user.name)}" target="_blank">${html.escape(nickname || user.display_name)}</a>
                    <svg height="10px" width="10px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" class="svg-edit mod-card-edit">
                        <path clip-rule="evenodd" fill-rule="evenodd" d="M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z"></path>
                    </svg>
                </h3>
                <h4 class="created-at">${html.escape(`Created ${window.moment(user.created_at).format('MMM D, YYYY')}`)}</h4>
                <div class="channel_background_cover"></div>
                ${background}
                <div class="channel-stats">
                    <span class="stat">
                        ${html.escape(user.views.toLocaleString())}
                        <svg height="16px" version="1.1" viewbox="1 1 16 16" width="16px" x="0px" y="0px" class="svg-glyph_views">
                            <path clip-rule="evenodd" d="M11,13H5L1,9V8V7l4-4h6l4,4v1v1L11,13z M8,5C6.344,5,5,6.343,5,8c0,1.656,1.344,3,3,3c1.657,0,3-1.344,3-3C11,6.343,9.657,5,8,5z M8,9C7.447,9,7,8.552,7,8s0.447-1,1-1s1,0.448,1,1S8.553,9,8,9z" fill-rule="evenodd"></path>
                        </svg>
                    </span>
                    <span class="stat">
                        ${html.escape(user.followers.toLocaleString())}
                        <svg height="16px" version="1.1" viewbox="0 0 16 16" width="16px" x="0px" y="0px" class="svg-glyph_followers">
                            <path clip-rule="evenodd" d="M8,13.5L1.5,7V4l2-2h3L8,3.5L9.5,2h3l2,2v3L8,13.5z" fill-rule="evenodd"></path>
                        </svg>
                    </span>
                </div>
            </div>
            ${controls}
            <br/>
            <div class="user-messages">
                <div class="label">
                    <span>Chat Messages</span>
                    <div class="triangle closed"></div>
                </div>
                <div class="message-list chat-messages">
                    ${user.messages.map(m => `<div>${m.outerHTML}</div>`).join('\n')}
                </div>
            </div>
        </div>
    `;
};
