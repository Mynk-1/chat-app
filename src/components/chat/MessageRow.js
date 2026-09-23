import React from 'react';

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

// Rendered by react-window's dynamic-height List (see ChatWindow.js) — the
// library measures each row's actual rendered height via ResizeObserver, so
// this can size to its content naturally instead of a fixed slot height.
const MessageRow = ({ index, style, messages, myNumber, isGroup, isContactTyping }) => {
  const isTypingRow = isContactTyping && index === messages.length;

  if (isTypingRow) {
    return (
      <div style={style} className="px-4 py-1.5">
        <div className="flex justify-start">
          <div className="rounded-clay px-4 py-2 shadow-clay-sm bg-clay-surface dark:bg-clay-surfaceDark dark:shadow-clay-dark-sm">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  const message = messages[index];
  const isMine = message.sender === myNumber;

  return (
    <div style={style} className="px-4 py-1.5">
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[70%] rounded-clay px-4 py-2 shadow-clay-sm ${
            isMine
              ? 'bg-clay-primary text-white dark:shadow-clay-dark-sm'
              : 'bg-clay-surface text-clay-text dark:bg-clay-surfaceDark dark:text-clay-textDark dark:shadow-clay-dark-sm'
          }`}
        >
          {isGroup && !isMine && (
            <p className="text-xs font-semibold mb-0.5 text-clay-primary dark:text-clay-primaryDark">
              {message.sender}
            </p>
          )}
          <p className="text-sm break-words">{message.content}</p>
          <span className={`text-xs mt-1 block ${isMine ? 'text-white/70' : 'text-clay-muted dark:text-clay-mutedDark'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageRow;
