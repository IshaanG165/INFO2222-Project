const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');

const SALT_ROUNDS = 12;
const PORT = 3001;

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const users = {};

// Tracks public keys for currently connected sockets so late-joining peers
// can receive all existing keys on announce.
const connectedUsers = new Map(); // socketId -> { username, publicKey }

app.post('/api/register', async (req, res) => {
  const { username, password, publicKey } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  if (users[username]) {
    return res.status(409).json({ success: false, message: 'Username already taken' });
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  users[username] = { hash, publicKey };
  console.log(`\n[REGISTER] username="${username}"`);
  console.log(`[REGISTER] bcrypt hash (${SALT_ROUNDS} rounds): ${hash}\n`);
  res.json({ success: true, message: 'Registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password, publicKey } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.hash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  // Always refresh the stored public key so re-logins with new key pairs stay in sync
  if (publicKey) {
    users[username].publicKey = publicKey;
  }
  const publicKeys = Object.entries(users)
    .filter(([u]) => u !== username)
    .map(([u, d]) => ({ username: u, publicKey: d.publicKey }));
  console.log(`\n[LOGIN] username="${username}" — success`);
  console.log(`[LOGIN] other users with keys: ${publicKeys.map(p => p.username).join(', ') || 'none'}\n`);
  res.json({ success: true, username, publicKeys });
});

app.get('/api/users', (_req, res) => {
  const publicKeys = Object.entries(users).map(([username, d]) => ({
    username,
    publicKey: d.publicKey,
  }));
  res.json({ publicKeys });
});

const tlsOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
  ca: fs.readFileSync('./certs/ca.crt'),
};

const httpsServer = https.createServer(tlsOptions, app);

const io = new Server(httpsServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[SOCKET] client connected: ${socket.id}`);

  socket.on('announce_key', (data) => {
    console.log(`[KEY] ${data.username} announced public key — broadcasting to peers`);

    // Store this socket's key info
    connectedUsers.set(socket.id, data);

    // Broadcast this user's key to all OTHER connected clients
    socket.broadcast.emit('peer_key', data);

    // Send ALL currently connected other users' keys back to this new client
    // so it can derive shared keys with everyone already online
    connectedUsers.forEach((info, id) => {
      if (id !== socket.id) {
        socket.emit('peer_key', info);
      }
    });
  });

  socket.on('send_message', (data) => {
    const { from, payload, iv, timestamp } = data;
    console.log(`[RELAY] from="${from}" timestamp=${timestamp} — payload relayed (server never decrypts)`);
    io.emit('receive_message', { from, payload, iv, timestamp });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log(`[SOCKET] client disconnected: ${socket.id}`);
  });
});

httpsServer.listen(PORT, () => {
  console.log('✅ SECURE SERVER | TLS: ON | bcrypt: 12 rounds | E2EE: AES-256-GCM | Port 3001');
});
