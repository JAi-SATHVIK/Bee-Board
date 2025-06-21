import React from 'react';

function FacilitatorTools({ onLock, onUnlock, onStartTimer, onStopTimer, locked, timerActive }) {
  return (
    <div className="card" style={{maxHeight: 180, minHeight: 100}}>
      <div className="mb-2 text-center" style={{fontWeight:700}}>Facilitator Tools</div>
      <div className="flex flex-row gap-2 mb-2 justify-center">
        <button type="button" onClick={locked ? onUnlock : onLock} className="bg-blue" style={{width: '40%'}}>{locked ? 'Unlock Board' : 'Lock Board'}</button>
        <button type="button" onClick={timerActive ? onStopTimer : onStartTimer} className="bg-green" style={{width: '40%'}}>{timerActive ? 'Stop Timer' : 'Start Timer'}</button>
      </div>
    </div>
  );
}

export default FacilitatorTools; 