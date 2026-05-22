'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const VULN_SERVER = 'http://localhost:3002';

interface Message {
  id: number;
  from: string;
  text: string;
  timestamp: number;
}

export default function VulnerableChatPage() {
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [loggedInAs, setLoggedInAs] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const msgIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleAuth() {
    setStatus(null);
    try {
      const endpoint = tab === 'register' ? '/api/register' : '/api/login';
      const res = await fetch(`${VULN_SERVER}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        mode: 'cors',
      });
      const data = await res.json();

      if (!data.success) {
        setStatus(`❌ ${data.message}`);
        return;
      }

      const socket = io(VULN_SERVER, {
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('receive_message', (msg: { from: string; text: string; timestamp: number }) => {
        if (msg.from === username) return;
        setMessages((prev) => [
          ...prev,
          { id: msgIdRef.current++, from: msg.from, text: msg.text, timestamp: msg.timestamp },
        ]);
      });

      setLoggedInAs(username);
      setAuthed(true);
      setStatus(tab === 'register' ? '⚠️ Registered (MD5)' : '⚠️ Logged in (MD5)');
    } catch (err) {
      setStatus(`❌ Error: ${String(err)}`);
    }
  }

  function handleSend() {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      from: loggedInAs,
      text: input.trim(),
      timestamp: Date.now(),
    });
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, from: loggedInAs, text: input.trim(), timestamp: Date.now() },
    ]);
    setInput('');
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-red-800 p-8">
          <div className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-red-300 font-bold text-sm">⚠️ VULNERABLE SERVER — NO ENCRYPTION — NO TLS</p>
            <p className="text-red-400 text-xs mt-1">For demo/Wireshark comparison only</p>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">SyncSpace</h1>
          <p className="text-gray-400 text-sm mb-6">Vulnerable Chat — Plaintext over HTTP</p>

          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
            {(['register', 'login'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-red-700 text-white'
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
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              {tab === 'register' ? 'Register (Insecure)' : 'Login (Insecure)'}
            </button>
          </div>

          {status && (
            <p className="mt-4 text-sm text-center text-yellow-400">{status}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-8 justify-center">
            <span className="bg-red-900/50 text-red-300 text-xs px-3 py-1 rounded-full border border-red-700">❌ HTTP only</span>
            <span className="bg-red-900/50 text-red-300 text-xs px-3 py-1 rounded-full border border-red-700">❌ MD5 hash</span>
            <span className="bg-red-900/50 text-red-300 text-xs px-3 py-1 rounded-full border border-red-700">❌ Plaintext messages</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-red-950 border-b border-red-800 px-6 py-3">
        <p className="text-red-300 font-bold text-center text-sm">
          ⚠️ VULNERABLE — NO ENCRYPTION — NO TLS — Messages visible in Wireshark
        </p>
      </div>
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center gap-3">
        <span className="text-white font-semibold">{loggedInAs}</span>
        <span className="bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded-full border border-red-700">No Encryption</span>
        <span className="ml-auto text-gray-500 text-xs">Port 3002 · HTTP · Plaintext</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-12">No messages yet. Open Wireshark on lo0 to see plaintext traffic.</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.from === loggedInAs;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 ${isMine ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-100'}`}>
                {!isMine && (
                  <p className="text-xs text-gray-400 mb-1">{msg.from}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-red-300/70 mt-1">⚠️ sent as plaintext</p>
              </div>
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
          placeholder="Type a message... (sent as PLAINTEXT over HTTP — visible in Wireshark)"
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 border border-red-800 focus:outline-none focus:border-red-500 placeholder-gray-500 text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-red-700 hover:bg-red-600 text-white font-medium rounded-xl px-5 py-2.5 transition-colors text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
