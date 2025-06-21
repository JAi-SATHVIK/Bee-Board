import React from 'react';

function PriorityZones({ zones = [], onAddZone, onRemoveZone }) {
  return (
    <div className="card" style={{maxHeight: 180, minHeight: 100}}>
      <div className="mb-2 text-center" style={{fontWeight:700}}>Priority Zones</div>
      <div className="flex flex-row gap-2 mb-2">
        <button type="button" onClick={onAddZone} className="bg-blue" style={{width: '100%'}}>Add Zone</button>
      </div>
      <ul style={{listStyle:'none', padding:0, margin:0}}>
        {zones.map((zone, i) => (
          <li key={zone.id} className="flex flex-row items-center gap-2 mb-2">
            <span style={{flex:1}}>{zone.label}</span>
            <button type="button" onClick={() => onRemoveZone(zone.id)} style={{width: 32, background:'#f3f6fa', color:'#dc2626'}}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PriorityZones; 