import { useState, useEffect } from 'react';
import Peer from 'simple-peer';

function App() {
  const [status, setStatus] = useState('Testing WebRTC...');

  useEffect(() => {
    try {
      const peer = new Peer({ initiator: true, trickle: true });
      setStatus('WebRTC initialized');
      peer.on('error', (err) => {
        console.error('WebRTC error:', err, err.stack);
        setStatus(`Error: ${err.message}`);
      });
      return () => peer.destroy();
    } catch (err) {
      console.error('WebRTC init error:', err, err.stack);
      setStatus(`Error: ${err.message}`);
    }
  }, []);

  return <div><h1>P2P Chat</h1><p>Status: {status}</p></div>;
}

export default App;
