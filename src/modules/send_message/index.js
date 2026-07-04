import {PlatformTypes, SettingIds} from '@/constants';
import anonChat from '@/modules/anon_chat/index';
import chatTabCompletion from '@/modules/chat_tab_completion/index';
import emojis from '@/modules/emotes/emojis';
import settings from '@/settings';
import socketClient from '@/socket-client';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import watcher from '@/watcher';

function applyTextReplacements(sendState) {
  const replacements = settings.get(SettingIds.TEXT_REPLACEMENTS);
  if (replacements == null) return;

  const replacementMap = {};
  for (const {alias, replacement} of Object.values(replacements)) {
    if (alias && replacement) replacementMap[alias.toLowerCase()] = replacement;
  }

  if (Object.keys(replacementMap).length === 0) return;

  sendState.message = sendState.message.replace(/\S+/g, (word) => replacementMap[word.toLowerCase()] ?? word);
}

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
  // must run first so triggers are substituted before emoji shortcuts and history recording
  (msgObj) => applyTextReplacements(msgObj),
  (msgObj) => chatTabCompletion.onSendMessage(msgObj),
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
