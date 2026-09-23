import React from 'react';
import { Users } from 'lucide-react';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

// react-window row height is fixed per slot; the visible card is shorter than
// the slot (see ROW_HEIGHT in ChatList.js) so `pb-2` here reads as the gap
// between rows instead of the old `space-y-2` on a plain .map().
const ChatRow = ({ index, style, items, typingNumbers, onSelectChat }) => {
  const chat = items[index];
  const isGroup = chat.type === 'group';
  const isTyping = !isGroup && typingNumbers.has(chat.contactNumber);

  return (
    <div style={style} className="pb-2">
      <div
        onClick={() => onSelectChat(chat)}
        className="h-full flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm cursor-pointer"
      >
        {isGroup ? (
          <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-clay-primary text-white">
            <Users className="h-5 w-5" />
          </div>
        ) : (
          <div
            className="relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white"
            style={{ backgroundColor: getAvatarColor(chat) }}
          >
            <span className="text-lg font-semibold">{getInitials(chat)}</span>
            {chat.online && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-clay-secondary border-2 border-clay-surface dark:border-clay-surfaceDark rounded-full"
                title="Online"
              />
            )}
          </div>
        )}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-clay-text dark:text-clay-textDark truncate">
              {isGroup ? chat.name : getDisplayName(chat)}
            </h3>
            <span className="text-xs text-clay-muted dark:text-clay-mutedDark flex-shrink-0 ml-2">
              {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
            </span>
          </div>
          <p
            className={`text-sm truncate ${
              isTyping
                ? 'text-clay-primary dark:text-clay-primaryDark font-medium'
                : 'text-clay-muted dark:text-clay-mutedDark'
            }`}
          >
            {isTyping ? 'typing…' : chat.lastMessage || 'No messages yet'}
          </p>
        </div>
        {chat.unreadMessageCount > 0 && (
          <div className="ml-2 bg-clay-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
            {chat.unreadMessageCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRow;
