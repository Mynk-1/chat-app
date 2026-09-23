import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';
import { formatDuration } from '../../utils/time';

const END_REASON_LABEL = {
  completed: 'Call ended',
  missed: 'No answer',
  declined: 'Call declined',
  cancelled: 'Call cancelled',
  busy: 'Line busy',
  offline: "They're offline",
  failed: 'Call failed',
};

const CallScreen = () => {
  const {
    callState,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    endReason,
    connectedDuration,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();
  const { chats } = useChat();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isVideoCall = activeCall?.type === 'video';
  const isEnded = callState === 'ended';

  // Relying on the `autoplay` attribute alone after programmatically setting
  // srcObject is inconsistent across browsers for bare <audio> elements
  // (this was the root cause of "video calls have sound, audio-only calls
  // don't" — video happened to autoplay reliably, audio did not) — an
  // explicit .play() call is the standard fix.
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
      if (localStream) localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (isVideoCall && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
      if (remoteStream) remoteVideoRef.current.play().catch(() => {});
    }
    if (!isVideoCall && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
      if (remoteStream) remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, isVideoCall]);

  if ((callState !== 'outgoing' && callState !== 'connected' && !isEnded) || !activeCall) return null;

  const contact = chats.find((c) => c.type === 'contact' && c.contactNumber === activeCall.contactNumber) || {
    contactNumber: activeCall.contactNumber,
  };

  const statusText = isEnded
    ? endReason === 'completed' && connectedDuration > 0
      ? `Call ended · ${formatDuration(connectedDuration)}`
      : END_REASON_LABEL[endReason] || 'Call ended'
    : callState === 'outgoing'
    ? 'Ringing…'
    : remoteStream
    ? formatDuration(connectedDuration)
    : 'Connecting…';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-clay-bg dark:bg-clay-bgDark animate-fade py-10 px-6">
      {isVideoCall && remoteStream && !isEnded ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <audio ref={remoteAudioRef} autoPlay />
      )}

      <div
        className={`relative z-10 flex flex-col items-center ${
          isVideoCall && remoteStream && !isEnded ? 'mt-auto mb-auto bg-clay-text/40 backdrop-blur-sm rounded-clay p-6' : 'mt-16'
        }`}
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-semibold text-white shadow-clay-sm"
          style={{ backgroundColor: getAvatarColor(contact) }}
        >
          {getInitials(contact)}
        </div>
        <h2 className="mt-5 text-xl font-semibold text-clay-text dark:text-clay-textDark">
          {getDisplayName(contact)}
        </h2>
        <p className="mt-1 text-sm text-clay-muted dark:text-clay-mutedDark">{statusText}</p>
      </div>

      {isVideoCall && localStream && !isCameraOff && !isEnded && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-32 right-6 w-28 h-40 object-cover rounded-clay shadow-clay-sm z-20"
        />
      )}

      {!isEnded && (
        <div className="relative z-10 flex items-center gap-6">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`w-14 h-14 rounded-full shadow-clay-sm active:shadow-clay-inset flex items-center justify-center transition-shadow ${
              isMuted
                ? 'bg-clay-primary text-white'
                : 'bg-clay-surface dark:bg-clay-surfaceDark text-clay-text dark:text-clay-textDark'
            }`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {isVideoCall && (
            <button
              onClick={toggleCamera}
              aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
              className={`w-14 h-14 rounded-full shadow-clay-sm active:shadow-clay-inset flex items-center justify-center transition-shadow ${
                isCameraOff
                  ? 'bg-clay-primary text-white'
                  : 'bg-clay-surface dark:bg-clay-surfaceDark text-clay-text dark:text-clay-textDark'
              }`}
            >
              {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
          )}

          <button
            onClick={endCall}
            aria-label="End call"
            className="w-16 h-16 rounded-full bg-clay-danger text-white shadow-clay-sm active:shadow-clay-inset flex items-center justify-center transition-shadow"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallScreen;
