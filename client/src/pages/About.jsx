import React from 'react';

function About() {
  return (
    <div className="container flex flex-col items-center justify-center" style={{minHeight: '70vh'}}>
      <div className="flex flex-col items-center mb-6" style={{width: '100%'}}>
        <span style={{fontSize: '2.2rem', color: '#FFD600', marginBottom: 4}}>🐝</span>
        <h2 className="heading-xl text-center" style={{marginBottom: 6, fontSize: '2.2rem'}}>About BeeBoard</h2>
        <div style={{fontSize: '1.1rem', color: '#333', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
          Unleash your team's creative potential!
        </div>
      </div>
      <div className="card flex flex-col shadow bg-white" style={{maxWidth: 700, margin: '0 auto', border: '2px solid #FFD600', padding: '40px 32px'}}>
        <p className="mb-6 text-gray-700 text-lg text-center" style={{marginBottom: 24, color: '#444', fontSize: '1.15rem'}}>
          BeeBoard is a real-time idea incubator for brainstorming, mind-mapping, and structured collaboration. Instantly share, organize, and prioritize ideas with your team from anywhere in the world.
        </p>
        <h3 className="text-xl font-semibold mb-2 mt-6" style={{color:'#FFD600'}}>Key Features</h3>
        <div className="flex flex-row flex-wrap gap-3 justify-center mb-6">
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>📝</span>
            <span style={{fontWeight:700, color:'#111'}}>Infinite Whiteboard</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>🤝</span>
            <span style={{fontWeight:700, color:'#111'}}>Real-time Collaboration</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>🔗</span>
            <span style={{fontWeight:700, color:'#111'}}>Mind Map & Linking</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>🎯</span>
            <span style={{fontWeight:700, color:'#111'}}>Voting & Prioritization</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>📋</span>
            <span style={{fontWeight:700, color:'#111'}}>Session Templates</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>🛠️</span>
            <span style={{fontWeight:700, color:'#111'}}>Facilitator Tools</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>💬</span>
            <span style={{fontWeight:700, color:'#111'}}>In-session Chat & Q&amp;A</span>
          </div>
          <div className="flex flex-col items-center bg-yellow rounded shadow" style={{padding:'18px 22px', minWidth:160, margin:6}}>
            <span style={{fontSize:'1.5rem'}}>📦</span>
            <span style={{fontWeight:700, color:'#111'}}>Session History & Export</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 mt-6" style={{color:'#FFD600'}}>How It Works</h3>
        <ol className="list-decimal pl-6 text-gray-700 space-y-1" style={{color:'#444', fontSize:'1.08rem', marginLeft: 18}}>
          <li>Sign up and create a new session</li>
          <li>Invite your team and start brainstorming in real time</li>
          <li>Organize, connect, and vote on ideas</li>
          <li>Export your results or continue the session later</li>
        </ol>
      </div>
    </div>
  );
}

export default About; 