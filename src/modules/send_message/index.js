import {PlatformTypes} from '../../constants.js';
import socketClient from '../../socket-client.js';
import {getCurrentChannel} from '../../utils/channel.js';
import debug from '../../utils/debug.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import {getCurrentUser} from '../../utils/user.js';
import watcher from '../../watcher.js';
import anonChat from '../anon_chat/index.js';
import chatCommands from '../chat_commands/index.js';
import chatTabCompletion from '../chat_tab_completion/index.js';
import emojis from '../emotes/emojis.js';

const PATCHED_SENTINEL = Symbol('patched symbol');

class SendState {
  constructor(msg) {
    this.message = msg;
    this.defaultPrevented = false;
  }

  get user() {
    return getCurrentUser();
  }

  preventDefault() {
    this.defaultPrevented = true;
    this.message = '';
  }
}

let twitchSendMessage;
const methodList = [
  (msgObj) => chatTabCompletion.onSendMessage(msgObj),
  (msgObj) => chatCommands.onSendMessage(msgObj),
  (msgObj) => anonChat.onSendMessage(msgObj),
  (msgObj) => emojis.onSendMessage(msgObj),
];

function bttvSendMessage(messageToSend, ...args) {
  const channel = getCurrentChannel();
  if (channel) {
    socketClient.broadcastMe(channel.provider, channel.id);
  }

  if (typeof messageToSend === 'string') {
    const sendState = new SendState(messageToSend);

    for (const method of methodList) {
      try {
        method(sendState);
      } catch (e) {
        debug.log(e);
      }
    }

    if (sendState.defaultPrevented) return Promise.resolve();
    messageToSend = sendState.message;
  }

  return twitchSendMessage.call(this, messageToSend, ...args);
}

class SendMessagePatcher {
  constructor() {
    watcher.on('load.chat', () => this.patch());
  }

  patch() {
    const chatController = twitch.getChatController();
    if (chatController?.props?.chatConnectionAPI?.sendMessage == null) return;

    if (
      chatController.props.chatConnectionAPI._bttvSendMessagePatched === PATCHED_SENTINEL ||
      chatController.props.chatConnectionAPI.sendMessage === bttvSendMessage
    ) {
      return;
    }

    chatController.props.chatConnectionAPI._bttvSendMessagePatched = PATCHED_SENTINEL;
    twitchSendMessage = chatController.props.chatConnectionAPI.sendMessage;
    chatController.props.chatConnectionAPI.sendMessage = bttvSendMessage;
    chatController.forceUpdate();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SendMessagePatcher()]);
