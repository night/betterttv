import sendChatMessage from '@/utils/send-chat-message';
import watcher from '@/watcher';

watcher.on('chat.send_admin_message', (message) => sendChatMessage(message));
