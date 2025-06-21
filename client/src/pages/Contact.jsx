import React, { useState } from 'react';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="container flex flex-col items-center justify-center" style={{minHeight: '70vh'}}>
      <div className="flex flex-col items-center mb-6" style={{width: '100%'}}>
        <span style={{fontSize: '2.2rem', color: '#FFD600', marginBottom: 4}}>🐝</span>
        <h2 className="heading-xl text-center" style={{marginBottom: 6, fontSize: '2.2rem'}}>Contact Us</h2>
        <div style={{fontSize: '1.1rem', color: '#333', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
          We'd love to hear from you!
        </div>
      </div>
      <div className="card flex flex-col shadow bg-white" style={{maxWidth: 420, margin: '0 auto', border: '2px solid #FFD600', padding: '40px 32px'}}>
        {sent ? (
          <div className="text-success mb-6 text-center font-semibold text-lg" style={{color:'#16a34a', fontWeight:700, fontSize:'1.18rem'}}>
            <span style={{fontSize:'2rem'}}>🎉</span><br/>
            Thank you for your message!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="rounded" style={{padding:'14px 18px', fontSize:'1.08rem', width:'100%', border:'1.5px solid #FFD600'}} required />
            <div className="rounded" style={{padding:'14px 18px', fontSize:'1.08rem', width:'100%', border:'1.5px solid #FFD600', background:'#f7f7f7', color:'#888', cursor:'not-allowed'}}>
              jayasathvik09@gmail.com
            </div>
            <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} className="rounded" style={{padding:'14px 18px', fontSize:'1.08rem', width:'100%', border:'1.5px solid #FFD600', minHeight: 100}} required />
            <button type="submit" className="bg-yellow rounded" style={{fontWeight:700, color:'#111', fontSize:'1.1rem', padding:'14px 0', width:'100%'}}>Send</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Contact; 