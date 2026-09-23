import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';
import { formatDuration } from '../../utils/time';

const CallScreen = () => {
  const {
    callState,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callError,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();
  const { contacts } = useChat();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [duration, setDuration] = useState(0);

  const isVideoCall = activeCall?.type === 'video';
  const isConnected = callState === 'connected';

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);

  useEffect(() => {
    if (isVideoCall && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
    if (!isVideoCall && remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
  }, [remoteStream, isVideoCall]);

  useEffect(() => {
    if (!isConnected || !remoteStream) {
      setDuration(0);
      return;
    }
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected, remoteStream]);

  if ((callState !== 'outgoing' && callState !== 'connected') || !activeCall) return null;

  const contact = contacts.find((c) => c.contactNumber === activeCall.contactNumber) || {
    contactNumber: activeCall.contactNumber,
  };

  const statusText = callError
    ? callError
    : callState === 'outgoing'
    ? 'Ringing…'
    : remoteStream
    ? formatDuration(duration)
    : 'Connecting…';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-clay-bg dark:bg-clay-bgDark animate-fade py-10 px-6">
      {isVideoCall && remoteStream ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <audio ref={remoteAudioRef} autoPlay />
      )}

      <div
        className={`relative z-10 flex flex-col items-center ${
          isVideoCall && remoteStream ? 'mt-auto mb-auto bg-clay-text/40 backdrop-blur-sm rounded-clay p-6' : 'mt-16'
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

      {isVideoCall && localStream && !isCameraOff && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-32 right-6 w-28 h-40 object-cover rounded-clay shadow-clay-sm z-20"
        />
      )}

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
    </div>
  );
};

export default CallScreen;
