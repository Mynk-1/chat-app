import React, { useEffect, useState, useCallback } from 'react';
import { List } from 'react-window';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import * as callApi from '../../api/call.api';
import CallRow from './CallRow';

// Fixed slot height per row (see CallRow.js — the visible card is slightly
// shorter than this, with the remainder read as inter-row spacing).
const ROW_HEIGHT = 76;

const CallHistoryList = () => {
  const { user } = useAuth();
  const { chats } = useChat();
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

  if (loading || calls.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
        <p className="p-4 text-center text-clay-muted dark:text-clay-mutedDark">
          {loading ? 'Loading…' : 'No calls yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 px-3 py-3">
      <List
        rowComponent={CallRow}
        rowCount={calls.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{ calls, chats, myNumber: user?.phoneNumber, callState, startCall }}
        className="no-scrollbar"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default CallHistoryList;
