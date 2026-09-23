import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';
import { formatDuration } from '../../utils/time';

const formatWhen = (timestamp) => {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Fixed row-slot height per CallHistoryList.js's ROW_HEIGHT — `pb-2` here is
// the gap between rows, same pattern as ChatRow.js.
const CallRow = ({ index, style, calls, chats, myNumber, callState, startCall }) => {
  const call = calls[index];
  const outgoing = call.caller === myNumber;
  const otherNumber = outgoing ? call.receiver : call.caller;
  const contact = chats.find((c) => c.type === 'contact' && c.contactNumber === otherNumber) || {
    contactNumber: otherNumber,
  };
  const missed = call.status !== 'completed';

  return (
    <div style={style} className="pb-2">
      <button
        onClick={() => callState === 'idle' && startCall(otherNumber, call.type)}
        className="h-full w-full flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm text-left"
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(contact) }}
        >
          {getInitials(contact)}
        </div>

        <div className="ml-3 flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              missed ? 'text-clay-danger dark:text-clay-dangerDark' : 'text-clay-text dark:text-clay-textDark'
            }`}
          >
            {getDisplayName(contact)}
          </p>
          <div className="flex items-center gap-1 text-xs text-clay-muted dark:text-clay-mutedDark">
            {missed ? (
              <PhoneMissed className="h-3.5 w-3.5" />
            ) : outgoing ? (
              <PhoneOutgoing className="h-3.5 w-3.5" />
            ) : (
              <PhoneIncoming className="h-3.5 w-3.5" />
            )}
            <span className="capitalize">{call.status}</span>
            {call.status === 'completed' && <span>· {formatDuration(call.durationSeconds)}</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
          {call.type === 'video' ? (
            <Video className="h-4 w-4 text-clay-muted dark:text-clay-mutedDark" />
          ) : (
            <Phone className="h-4 w-4 text-clay-muted dark:text-clay-mutedDark" />
          )}
          <span className="text-[11px] text-clay-muted dark:text-clay-mutedDark">{formatWhen(call.startedAt)}</span>
        </div>
      </button>
    </div>
  );
};

export default CallRow;
