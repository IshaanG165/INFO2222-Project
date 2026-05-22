'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SECURE_SERVER = 'https://localhost:3001';

interface Message {
  id: number;
  from: string;
  text: string;
  raw: { iv: number[]; ct: number[] } | null;
  timestamp: number;
  showRaw: boolean;
}

async function generateKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey'],
  );
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk);
}

async function importPublicKey(jwkStr: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkStr);
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  );
}

async function deriveSharedKey(privateKey: CryptoKey, peerPublicKey: CryptoKey): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptMessage(
  key: CryptoKey,
  text: string,
): Promise<{ iv: number[]; ct: number[] }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { iv: Array.from(iv), ct: Array.from(new Uint8Array(ciphertext)) };
}

async function decryptMessage(
  key: CryptoKey,
  payload: { iv: number[]; ct: number[] },
): Promise<string> {
  const iv = new Uint8Array(payload.iv);
  const ct = new Uint8Array(payload.ct);
  const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plain);
}

export default function SecureChatPage() {
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [loggedInAs, setLoggedInAs] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const pubKeyRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const msgIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleAuth() {
    setStatus(null);
    try {
      const kp = await generateKeyPair();
      keyPairRef.current = kp;
      const publicKey = await exportPublicKey(kp.publicKey);
      pubKeyRef.current = publicKey;

      const endpoint = tab === 'register' ? '/api/register' : '/api/login';
      const body: Record<string, string> =
        tab === 'register'
          ? { username, password, publicKey }
          : { username, password, publicKey };

      const res = await fetch(`${SECURE_SERVER}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        mode: 'cors',
      });
      const data = await res.json();

      if (!data.success) {
        setStatus(`❌ ${data.message}`);
        return;
      }

      if (data.publicKeys && data.publicKeys.length > 0 && keyPairRef.current) {
        const peer = data.publicKeys[0];
        const peerPub = await importPublicKey(peer.publicKey);
        sharedKeyRef.current = await deriveSharedKey(keyPairRef.current.privateKey, peerPub);
      }

      const socket = io(SECURE_SERVER, {
        secure: true,
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('announce_key', { username, publicKey });
      });

      socket.on('peer_key', async (data: { username: string; publicKey: string }) => {
        if (keyPairRef.current) {
          const peerPub = await importPublicKey(data.publicKey);
          sharedKeyRef.current = await deriveSharedKey(keyPairRef.current.privateKey, peerPub);
        }
      });

      socket.on('receive_message', async (msg: { from: string; payload: { iv: number[]; ct: number[] }; timestamp: number }) => {
        if (msg.from === username) return;
        let text = '[encrypted — open a second browser tab and login as another user to establish E2EE]';
        let raw: { iv: number[]; ct: number[] } | null = msg.payload;
        if (sharedKeyRef.current && msg.payload) {
          try {
            text = await decryptMessage(sharedKeyRef.current, msg.payload);
          } catch {
            text = '[decryption failed]';
          }
        }
        setMessages((prev) => [
          ...prev,
          { id: msgIdRef.current++, from: msg.from, text, raw, timestamp: msg.timestamp, showRaw: false },
        ]);
      });

      setLoggedInAs(username);
      setAuthed(true);
      setStatus(tab === 'register' ? '✅ Registered' : '✅ Logged in');
    } catch (err) {
      setStatus(`❌ Error: ${String(err)}`);
    }
  }

  async function handleSend() {
    if (!input.trim() || !socketRef.current) return;
    if (!sharedKeyRef.current) {
      alert('E2EE key not established yet — make sure the other user is logged in, then try again.');
      return;
    }
    const payload = await encryptMessage(sharedKeyRef.current, input.trim());

    socketRef.current.emit('send_message', {
      from: loggedInAs,
      payload,
      iv: payload.iv,
      timestamp: Date.now(),
    });

    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, from: loggedInAs, text: input.trim(), raw: payload, timestamp: Date.now(), showRaw: false },
    ]);
    setInput('');
  }

  function toggleRaw(id: number) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showRaw: !m.showRaw } : m)),
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">SyncSpace</h1>
          <p className="text-gray-400 text-sm mb-6">Secure E2EE Chat — AES-256-GCM</p>

          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
            {(['register', 'login'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t === 'register' ? 'Register' : 'Login'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              {tab === 'register' ? 'Register & Connect' : 'Login & Connect'}
            </button>
          </div>

          {status && (
            <p className={`mt-4 text-sm text-center ${status.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {status}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-8 justify-center">
            <span className="bg-green-900/50 text-green-300 text-xs px-3 py-1 rounded-full border border-green-700">🔒 TLS 1.3</span>
            <span className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700">🔐 bcrypt-12</span>
            <span className="bg-purple-900/50 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-700">🛡 AES-256-GCM</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center gap-3">
        <span className="text-white font-semibold">{loggedInAs}</span>
        <span className="bg-green-900/60 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-700">E2EE Active</span>
        <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-700">🔒 TLS</span>
        <span className="ml-auto text-gray-500 text-xs">Port 3001 · AES-256-GCM · ECDH P-256</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-12">No messages yet. Send one to start the E2EE session.</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.from === loggedInAs;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                {!isMine && (
                  <p className="text-xs text-gray-400 mb-1">{msg.from}</p>
                )}
                <p className="text-sm">{msg.text}</p>
              </div>
              {msg.raw && (
                <button
                  onClick={() => toggleRaw(msg.id)}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-300 underline"
                >
                  🔍 {msg.showRaw ? 'Hide' : 'Show'} raw encrypted payload
                </button>
              )}
              {msg.showRaw && msg.raw && (
                <pre className="mt-1 text-xs bg-gray-900 text-yellow-300 border border-yellow-700/50 rounded-lg px-3 py-2 max-w-sm overflow-x-auto">
                  {JSON.stringify({ iv: msg.raw.iv.slice(0, 4).join(',') + ',...', ct_length: msg.raw.ct.length, ct_preview: msg.raw.ct.slice(0, 8).join(',') + ',...' }, null, 2)}
                </pre>
              )}
              <span className="text-xs text-gray-600 mt-0.5">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-700 px-4 py-3 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message... (AES-256-GCM encrypted before sending)"
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-5 py-2.5 transition-colors text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
