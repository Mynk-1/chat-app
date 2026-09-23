const { io } = require('socket.io-client');
const fs = require('fs');

const cookieA = fs.readFileSync(process.argv[2], 'utf8');
const cookieB = fs.readFileSync(process.argv[3], 'utf8');
const tokenA = cookieA.match(/token\s+(\S+)/)[1];
const tokenB = cookieB.match(/token\s+(\S+)/)[1];
const cookieHeaderA = `token=${tokenA}`;
const URL = 'http://localhost:5000';

const A = io(URL, { auth: { token: tokenA }, transports: ['websocket'] });
const B = io(URL, { auth: { token: tokenB }, transports: ['websocket'] });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await Promise.all([
    new Promise((r) => A.on('connect', r)),
    new Promise((r) => B.on('connect', r)),
  ]);
  console.log('both connected');

  // A opens the chat with B (8222222222), then B sends a message to A.
  A.emit('chat:open', { contactNumber: '8222222222' });
  await wait(300);
  console.log('--- B sends message to A while A has the chat open (expect unread stays 0, read:true) ---');
  B.emit('message:send', { recipient: '8111111111', content: 'hello while you are looking' });
  await wait(500);

  const resp1 = await fetch('http://localhost:5000/api/chats', { headers: { Cookie: cookieHeaderA } });
  const chats1 = await resp1.json();
  const entry1 = chats1.chats.find((c) => c.contactNumber === '8222222222');
  console.log('A chats entry (should be unread=0):', JSON.stringify(entry1));

  // A closes the chat, then B sends another message.
  A.emit('chat:close');
  await wait(300);
  console.log('--- B sends another message while A has closed the chat (expect unread=1) ---');
  B.emit('message:send', { recipient: '8111111111', content: 'hello while you are away' });
  await wait(500);

  const resp2 = await fetch('http://localhost:5000/api/chats', { headers: { Cookie: cookieHeaderA } });
  const chats2 = await resp2.json();
  const entry2 = chats2.chats.find((c) => c.contactNumber === '8222222222');
  console.log('A chats entry (should be unread=1):', JSON.stringify(entry2));

  A.disconnect();
  B.disconnect();
  process.exit(0);
})();
