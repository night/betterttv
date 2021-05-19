import $ from 'jquery';
import twitch from '../utils/twitch.js';
import debug from '../utils/debug.js';
import domObserver from '../observers/dom.js';
import historyObserver from '../observers/history.js';

let watcher;
let currentPath = '';
let currentRoute = '';
let currentChatReference;
let currentChatChannelId;

const loadPredicates = {
  following: () => !!$('ul[role="tablist"] div[data-test-selector="ACTIVE_TAB_INDICATOR"]').length,
  channel: () => {
    const href =
      $('.channel-header__user-avatar img').attr('src') ||
      $('h3[data-test-selector="side-nav-channel-info__name_link"] a').attr('href') ||
      $('.channel-info-content a figure img').attr('src');
    return !!href && !!twitch.updateCurrentChannel();
  },
  chat: (context) => {
    if (!twitch.updateCurrentChannel()) return false;

    if (!$('section[data-test-selector="chat-room-component-layout"]').length) return false;

    const lastReference = currentChatReference;
    const currentChat = twitch.getCurrentChat();
    if (!currentChat) return false;

    let checkReferences = true;
    if (context && context.forceReload) {
      if (context.checkReferences === undefined) {
        context.checkReferences = true;
      }
      checkReferences = context.checkReferences;
      context.checkReferences = false;
    }

    if (checkReferences) {
      if (currentChat === lastReference) return false;
      if (currentChat.props.channelID === currentChatChannelId) return false;
    }

    currentChatReference = currentChat;
    currentChatChannelId = currentChat.props.channelID;

    return true;
  },
  player: () => !!twitch.getCurrentPlayer(),
  vod: () => !!twitch.updateCurrentChannel(),
  homepage: () => !!$('.front-page-carousel .video-player__container').length,
};

const routes = {
  HOMEPAGE: 'HOMEPAGE',
  DIRECTORY_FOLLOWING_LIVE: 'DIRECTORY_FOLLOWING_LIVE',
  DIRECTORY_FOLLOWING: 'DIRECTORY_FOLLOWING',
  DIRECTORY: 'DIRECTORY',
  CHAT: 'CHAT',
  CHANNEL: 'CHANNEL',
  CHANNEL_SQUAD: 'CHANNEL_SQUAD',
  DASHBOARD: 'DASHBOARD',
  VOD: 'VOD',
};

const routeKeysToPaths = {
  [routes.HOMEPAGE]: /^\/$/i,
  [routes.DIRECTORY_FOLLOWING_LIVE]: /^\/directory\/following\/live$/i,
  [routes.DIRECTORY_FOLLOWING]: /^\/directory\/following$/i,
  [routes.DIRECTORY]: /^\/directory/i,
  [routes.CHAT]: /^(\/popout)?\/[a-z0-9-_]+\/chat$/i,
  [routes.VOD]: /^(\/videos\/[0-9]+|\/[a-z0-9-_]+\/clip\/[a-z0-9-_]+)$/i,
  [routes.DASHBOARD]: /^(\/[a-z0-9-_]+\/dashboard|\/u\/[a-z0-9-_]+\/stream-manager)/i,
  [routes.CHANNEL_SQUAD]: /^\/[a-z0-9-_]+\/squad/i,
  [routes.CHANNEL]: /^\/[a-z0-9-_]+/i,
};

function waitForLoad(type, context = null) {
  let timeout;
  let interval;
  const startTime = Date.now();
  return Promise.race([
    new Promise((resolve) => {
      timeout = setTimeout(resolve, 10000);
    }),
    new Promise((resolve) => {
      const loaded = loadPredicates[type];
      if (loaded(context)) {
        resolve();
        return;
      }
      interval = setInterval(() => loaded(context) && resolve(), 100);
    }),
  ])
    .then(() => {
      debug.log(`waited for ${type} load: ${Date.now() - startTime}ms`);
      clearTimeout(timeout);
      clearInterval(interval);
    })
    .then(() => watcher.emit('load'));
}

function getRouteFromPath(path) {
  let route = null;
  for (const name of Object.keys(routeKeysToPaths)) {
    const regex = routeKeysToPaths[name];
    if (!regex.test(path)) continue;
    route = name;
    break;
  }

  // twitch's embed subdomain only supports channel view
  if (route === routes.HOMEPAGE && window.location.hostname === 'embed.twitch.tv') {
    return routes.CHANNEL;
  }

  return route;
}

function onRouteChange(location) {
  const lastPath = currentPath;
  const lastRoute = currentRoute;
  const path = location.pathname;
  const route = getRouteFromPath(path);

  debug.log(`New route: ${location.pathname} as ${route}`);

  // trigger on all loads (like resize functions)
  watcher.emit('load');

  currentPath = path;
  currentRoute = route;
  if (currentPath === lastPath) return;

  switch (route) {
    case routes.DIRECTORY_FOLLOWING:
      if (lastRoute === routes.DIRECTORY_FOLLOWING_LIVE) break;
      waitForLoad('following').then(() => watcher.emit('load.directory.following'));
      break;
    case routes.CHAT:
      waitForLoad('chat').then(() => watcher.emit('load.chat'));
      break;
    case routes.VOD:
      waitForLoad('vod').then(() => watcher.emit('load.vod'));
      waitForLoad('player').then(() => watcher.emit('load.player'));
      break;
    case routes.CHANNEL_SQUAD:
      waitForLoad('chat').then(() => watcher.emit('load.chat'));
      waitForLoad('player').then(() => watcher.emit('load.player'));
      break;
    case routes.CHANNEL:
      waitForLoad('channel').then(() => watcher.emit('load.channel'));
      waitForLoad('chat').then(() => watcher.emit('load.chat'));
      waitForLoad('player').then(() => watcher.emit('load.player'));
      break;
    case routes.HOMEPAGE:
      waitForLoad('homepage').then(() => watcher.emit('load.homepage'));
      break;
    case routes.DASHBOARD:
      waitForLoad('chat').then(() => watcher.emit('load.chat'));
      break;
    default:
      break;
  }
}

export default function routesWatcher(watcher_) {
  watcher = watcher_;

  historyObserver.on('pushState', (location) => onRouteChange(location));
  historyObserver.on('replaceState', (location) => onRouteChange(location));
  historyObserver.on('popState', (location) => onRouteChange(location));
  onRouteChange(window.location);

  // force reload chat when the input gets recreated (popout open/close)
  domObserver.on('.chat-input', (node, isConnected) => {
    if (!isConnected) return;

    twitch.updateCurrentChannel();
    watcher.emit('load.chat');
  });

  // force reload player when the player gets recreated
  domObserver.on('.persistent-player', (node, isConnected) => {
    if (!isConnected) return;
    waitForLoad('player').then(() => watcher.emit('load.player'));
  });
}
