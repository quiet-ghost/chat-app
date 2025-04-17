import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { encryptMessage, decryptMessage, generateKey } from './components/encryption';
import './styles.css';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [peerId, setPeerId] = useState('');
  const [key, setKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    generateKey().then(setKey);
  }, []);

  socket.on('connect', () => {
    console.log('Connected to signaling server');
  });

  const peer = new Peer({ initiator: true, trickle: false });

  peer.on('signal', (data) => {
    socket.emit('message', { to: peerId, type: 'offer', data });
  });

  peer.on('data', async (data) => {
    if (key) {
      const decrypted = await decryptMessage(data.toString(), key);
      setMessages((prev) => [...prev, `Peer: ${decrypted}`]);
    }
  });

  socket.on('message', (msg) => {
    if (msg.type === 'offer') {
      peer.signal(msg.data);
    }
  });

  const sendMessage = async () => {
    if (key) {
      const encrypted = await encryptMessage(input, key);
      peer.send(encrypted);
      setMessages((prev) => [...prev, `You: ${input}`]);
      setInput('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">P2P Chat</h1>
      <input
        type="text"
        placeholder="Peer ID"
        value={peerId}
        onChange={(e) => setPeerId(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <div className="border p-2 h-64 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 w-full"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white p-2 mt-2 w-full"
      >
        Send
      </button>
    </div>
  );
}

export default App;
