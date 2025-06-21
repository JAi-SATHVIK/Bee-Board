import React, { useState } from 'react';

function Chat({ messages = [], onSend }) {
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="card" style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 'none', margin: 0, padding: 0}}>
      <div style={{flex: 1, overflowY: 'auto', marginBottom: 12, padding: '18px 18px 0 18px'}}>
        {messages.length === 0 && <div className="text-center text-gray">No messages yet.</div>}
        {messages.map((msg, i) => (
          <div key={i} style={{marginBottom: 8}}><span style={{fontWeight: 600}}>{msg.username || msg.user || 'User'}:</span> {msg.text}</div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{display: 'flex', gap: 8, padding: '0 18px 18px 18px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{flex: 1}} />
        <button type="submit" style={{width: 80}}>Send</button>
      </form>
    </div>
  );
}

export default Chat; 