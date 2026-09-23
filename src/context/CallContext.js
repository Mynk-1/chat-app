import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { EVENTS } from '../socket/events';
import { ICE_SERVERS } from '../config/webrtc';

const CallContext = createContext(null);

// Owns the RTCPeerConnection + media streams and the call state machine:
// idle -> outgoing|incoming -> connected -> idle. The server only relays
// signaling (see call.handler.js on the backend) — all the SDP/ICE work
// happens here.
export const CallProvider = ({ children }) => {
  const socket = useSocket();

  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | connected
  const [activeCall, setActiveCall] = useState(null); // { callId, contactNumber, type, direction }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callError, setCallError] = useState('');

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  activeCallRef.current = activeCall;

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setActiveCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  const createPeerConnection = useCallback(
    (callId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit(EVENTS.CALL_SIGNAL, {
            callId,
            data: { type: 'ice-candidate', candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => setRemoteStream(event.streams[0]);

      pcRef.current = pc;
      return pc;
    },
    [socket]
  );

  const getLocalMedia = useCallback(async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video',
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // Caller's side: once the callee accepts, create the offer.
  const startOffer = useCallback(
    async (callId, type) => {
      const pc = createPeerConnection(callId);
      const stream = await getLocalMedia(type);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit(EVENTS.CALL_SIGNAL, { callId, data: { type: 'offer', sdp: offer } });
    },
    [createPeerConnection, getLocalMedia, socket]
  );

  // Callee's side: get media + a peer connection ready, then wait for the
  // offer to arrive via CALL_SIGNAL (handled below) before answering.
  const prepareForAnswer = useCallback(
    async (callId, type) => {
      const pc = createPeerConnection(callId);
      const stream = await getLocalMedia(type);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    },
    [createPeerConnection, getLocalMedia]
  );

  const startCall = useCallback(
    (contactNumber, type) => {
      if (!socket || callState !== 'idle') return;
      setCallError('');
      setActiveCall({ callId: null, contactNumber, type, direction: 'outgoing' });
      setCallState('outgoing');
      socket.emit(EVENTS.CALL_INITIATE, { recipient: contactNumber, type });
    },
    [socket, callState]
  );

  const acceptCall = useCallback(async () => {
    const call = activeCallRef.current;
    if (!call) return;
    try {
      socket?.emit(EVENTS.CALL_ACCEPT, { callId: call.callId });
      await prepareForAnswer(call.callId, call.type);
      setCallState('connected');
    } catch (error) {
      console.error('Failed to accept call (media permissions?)', error);
      setCallError('Could not access camera/microphone');
      socket?.emit(EVENTS.CALL_REJECT, { callId: call.callId });
      cleanup();
    }
  }, [socket, prepareForAnswer, cleanup]);

  const rejectCall = useCallback(() => {
    const call = activeCallRef.current;
    if (call?.callId) socket?.emit(EVENTS.CALL_REJECT, { callId: call.callId });
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    const call = activeCallRef.current;
    if (!call) return;

    if (call.callId && callState === 'connected') {
      socket?.emit(EVENTS.CALL_END, { callId: call.callId });
    } else if (call.callId) {
      socket?.emit(EVENTS.CALL_CANCEL, { callId: call.callId });
    }
    cleanup();
  }, [socket, callState, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach((track) => (track.enabled = !nextMuted));
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextOff = !isCameraOff;
    stream.getVideoTracks().forEach((track) => (track.enabled = !nextOff));
    setIsCameraOff(nextOff);
  }, [isCameraOff]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({ callId, from, type }) => {
      // Already busy locally (e.g. a race) — decline immediately.
      if (activeCallRef.current) {
        socket.emit(EVENTS.CALL_REJECT, { callId });
        return;
      }
      setCallError('');
      setActiveCall({ callId, contactNumber: from, type, direction: 'incoming' });
      setCallState('incoming');
    };

    const handleAccepted = async ({ callId }) => {
      const call = activeCallRef.current;
      if (!call) return;
      setActiveCall((prev) => ({ ...prev, callId }));
      setCallState('connected');
      try {
        await startOffer(callId, call.type);
      } catch (error) {
        console.error('Failed to start call (media permissions?)', error);
        setCallError('Could not access camera/microphone');
        socket.emit(EVENTS.CALL_END, { callId });
        cleanup();
      }
    };

    const handleSignal = async ({ data }) => {
      const pc = pcRef.current;
      if (!pc) return;

      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const call = activeCallRef.current;
        socket.emit(EVENTS.CALL_SIGNAL, { callId: call?.callId, data: { type: 'answer', sdp: answer } });
      } else if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === 'ice-candidate' && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Failed to add ICE candidate', error);
        }
      }
    };

    const handleTerminalEvent = (reasonLabel) => () => {
      if (reasonLabel) console.log('Call ended:', reasonLabel);
      cleanup();
    };

    socket.on(EVENTS.CALL_INCOMING, handleIncoming);
    socket.on(EVENTS.CALL_ACCEPTED, handleAccepted);
    socket.on(EVENTS.CALL_SIGNAL, handleSignal);
    socket.on(EVENTS.CALL_REJECTED, handleTerminalEvent('rejected'));
    socket.on(EVENTS.CALL_CANCELLED, handleTerminalEvent('cancelled'));
    socket.on(EVENTS.CALL_ENDED, handleTerminalEvent('ended'));
    socket.on(EVENTS.CALL_BUSY, () => {
      setCallError('That contact is on another call');
      cleanup();
    });

    return () => {
      socket.off(EVENTS.CALL_INCOMING, handleIncoming);
      socket.off(EVENTS.CALL_ACCEPTED, handleAccepted);
      socket.off(EVENTS.CALL_SIGNAL, handleSignal);
      socket.off(EVENTS.CALL_REJECTED);
      socket.off(EVENTS.CALL_CANCELLED);
      socket.off(EVENTS.CALL_ENDED);
      socket.off(EVENTS.CALL_BUSY);
    };
  }, [socket, startOffer, cleanup]);

  // If the socket itself drops mid-call, don't leave the UI stuck.
  useEffect(() => {
    if (!socket && callState !== 'idle') cleanup();
  }, [socket, callState, cleanup]);

  return (
    <CallContext.Provider
      value={{
        callState,
        activeCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        callError,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
