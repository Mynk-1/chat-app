// Free public STUN only — no TURN credentials available. This covers most
// direct connections; calls across strict/symmetric NATs may fail to
// connect. Add a TURN entry here (url + username + credential) later if
// needed — nothing else in the calling code has to change.
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
