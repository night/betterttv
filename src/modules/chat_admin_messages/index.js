import sendChatMessage from '../../utils/send-chat-message.js';
import watcher from '../../watcher.js';

watcher.on('chat.send_admin_message', (message) => sendChatMessage(message));
