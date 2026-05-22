const http = require('http');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Server } = require('socket.io');

const PORT = 3002;

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const users = {};

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  if (users[username]) {
    return res.status(409).json({ success: false, message: 'Username already taken' });
  }
  const hash = md5(password);
  users[username] = { hash };
  console.log(`\n⚠️  [REGISTER] username="${username}"`);
  console.log(`⚠️  [REGISTER] MD5 hash (NO SALT): ${hash}\n`);
  res.json({ success: true, message: 'Registered successfully' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const hash = md5(password);
  console.log(`⚠️  [LOGIN] username="${username}" MD5 check: ${hash}`);
  if (hash !== user.hash) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  console.log(`⚠️  [LOGIN] username="${username}" — success\n`);
  res.json({ success: true, username });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[SOCKET] client connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    const { from, text, timestamp } = data;
    console.log(`⚠️  PLAINTEXT MESSAGE from="${from}": ${text}  [timestamp=${timestamp}]`);
    io.emit('receive_message', { from, text, timestamp });
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log('⚠️  VULNERABLE SERVER | NO TLS | MD5 hashing | PLAINTEXT messages | Port 3002');
});
