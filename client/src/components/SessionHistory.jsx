import React from 'react';

function SessionHistory({ activities = [] }) {
  return (
    <div className="card" style={{maxHeight: 220, minHeight: 120, overflowY: 'auto'}}>
      <div className="mb-2 text-center" style={{fontWeight:700}}>Session History</div>
      {activities.length === 0 && <div className="text-center text-gray">No activity yet.</div>}
      <ul style={{listStyle:'none', padding:0, margin:0}}>
        {activities.map((act, i) => (
          <li key={i} className="mb-2"><span style={{fontWeight:600}}>{act.user}:</span> {act.action} <span style={{color:'#888', fontSize:'0.95em'}}>{act.time}</span></li>
        ))}
      </ul>
    </div>
  );
}

export default SessionHistory; 