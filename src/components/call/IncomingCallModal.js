import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

const IncomingCallModal = () => {
  const { callState, activeCall, acceptCall, rejectCall } = useCall();
  const { chats } = useChat();

  if (callState !== 'incoming' || !activeCall) return null;

  const contact = chats.find((c) => c.type === 'contact' && c.contactNumber === activeCall.contactNumber) || {
    contactNumber: activeCall.contactNumber,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-clay-text/30 backdrop-blur-sm p-4 animate-fade">
      <div className="w-full max-w-xs bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark p-8 flex flex-col items-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-clay-primary/40 animate-pulse-ring" />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold text-white shadow-clay-sm"
            style={{ backgroundColor: getAvatarColor(contact) }}
          >
            {getInitials(contact)}
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-clay-text dark:text-clay-textDark">
          {getDisplayName(contact)}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-clay-muted dark:text-clay-mutedDark">
          {activeCall.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          Incoming {activeCall.type} call…
        </p>

        <div className="mt-8 flex items-center gap-8">
          <button
            onClick={rejectCall}
            aria-label="Decline call"
            className="w-16 h-16 rounded-full bg-clay-danger text-white shadow-clay-sm active:shadow-clay-inset flex items-center justify-center transition-shadow"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
          <button
            onClick={acceptCall}
            aria-label="Accept call"
            className="w-16 h-16 rounded-full bg-clay-secondary text-white shadow-clay-sm active:shadow-clay-inset flex items-center justify-center transition-shadow"
          >
            <Phone className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
