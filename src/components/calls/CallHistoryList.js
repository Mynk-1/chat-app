import React, { useEffect, useState, useCallback } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import * as callApi from '../../api/call.api';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';
import { formatDuration } from '../../utils/time';

const formatWhen = (timestamp) => {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CallHistoryList = () => {
  const { user } = useAuth();
  const { contacts } = useChat();
  const { startCall, callState } = useCall();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCalls = useCallback(async () => {
    try {
      const { data } = await callApi.getCallHistory();
      setCalls(data.calls);
    } catch (error) {
      console.error('Failed to load call history', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  return (
    <div className="w-full max-w-md h-full overflow-y-auto">
      {loading ? (
        <p className="p-4 text-center text-clay-muted dark:text-clay-mutedDark">Loading…</p>
      ) : calls.length === 0 ? (
        <p className="p-4 text-center text-clay-muted dark:text-clay-mutedDark">No calls yet</p>
      ) : (
        <div className="px-3 space-y-2 pb-4">
          {calls.map((call) => {
            const outgoing = call.caller === user?.phoneNumber;
            const otherNumber = outgoing ? call.receiver : call.caller;
            const contact = contacts.find((c) => c.contactNumber === otherNumber) || {
              contactNumber: otherNumber,
            };
            const missed = call.status !== 'completed';

            return (
              <button
                key={call._id}
                onClick={() => callState === 'idle' && startCall(otherNumber, call.type)}
                className="w-full flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm text-left"
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
                  <span className="text-[11px] text-clay-muted dark:text-clay-mutedDark">
                    {formatWhen(call.startedAt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallHistoryList;
