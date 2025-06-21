import React, { useState, useEffect } from 'react';

const defaultTemplates = [
  { value: 'blank', label: 'Blank Canvas', description: 'Start with a clean slate.' },
  { value: 'swot', label: 'SWOT Analysis', description: 'Strengths, Weaknesses, Opportunities, Threats.' },
  { value: 'lean-canvas', label: 'Lean Canvas', description: 'Business model on one page.' },
  { value: 'grid', label: 'Grid', description: 'Organize ideas in a grid.' },
  { value: 'user-journey', label: 'User Journey', description: 'Map out user experiences.' },
];

function SessionTemplates() {
  const [templates, setTemplates] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Load templates from localStorage or use defaults
  useEffect(() => {
    const stored = localStorage.getItem('templates');
    if (stored) setTemplates(JSON.parse(stored));
    else setTemplates(defaultTemplates);
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setTemplates([...templates, { value: newLabel.toLowerCase().replace(/\s+/g, '-'), label: newLabel, description: newDesc }]);
    setNewLabel('');
    setNewDesc('');
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditLabel(templates[idx].label);
    setEditDesc(templates[idx].description);
  };

  const handleSaveEdit = (idx) => {
    const updated = [...templates];
    updated[idx] = { ...updated[idx], label: editLabel, description: editDesc };
    setTemplates(updated);
    setEditIdx(null);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Delete this template?')) {
      setTemplates(templates.filter((_, i) => i !== idx));
    }
  };

  const handleUse = (tpl) => {
    alert(`Template selected: ${tpl.label}`);
    // Optionally, navigate or apply template to session creation
  };

  return (
    <div className="container flex flex-col items-center justify-center" style={{minHeight: '70vh'}}>
      <div className="flex flex-col items-center mb-6" style={{width: '100%'}}>
        <span style={{fontSize: '2.2rem', color: '#FFD600', marginBottom: 4}}>🐝</span>
        <h2 className="heading-xl text-center" style={{marginBottom: 6, fontSize: '2.2rem'}}>Session Templates</h2>
        <div style={{fontSize: '1.1rem', color: '#333', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
          Pick a template and start your productivity journey!
        </div>
      </div>
      <form onSubmit={handleAdd} className="flex flex-row gap-2 mb-4 justify-center" style={{maxWidth:480, margin:'0 auto'}}>
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Template Name" required style={{flex:2}} />
        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" style={{flex:3}} />
        <button type="submit" className="bg-yellow rounded" style={{fontWeight:700, padding:'0 22px'}}>Add</button>
      </form>
      <div className="flex flex-col gap-4 w-full" style={{maxWidth: 700}}>
        {templates.map((tpl, idx) => (
          <div key={tpl.value} className="card flex flex-col shadow bg-white" style={{maxWidth: 480, margin: '0 auto', border: '2px solid #FFD600'}}>
            {editIdx === idx ? (
              <>
                <input value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{fontWeight:700, fontSize:'1.15rem', color:'#FFD600', marginBottom:4, border:'1.5px solid #FFD600'}} />
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{color:'#555', marginBottom: 8, border:'1.5px solid #FFD600'}} />
                <div className="flex flex-row gap-2">
                  <button className="bg-yellow rounded" style={{fontWeight:700, color:'#111', padding:'8px 18px'}} onClick={() => handleSaveEdit(idx)}>Save</button>
                  <button className="bg-gray rounded" style={{fontWeight:700, color:'#111', padding:'8px 18px'}} onClick={() => setEditIdx(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-row items-center gap-2 mb-1">
                  <span style={{fontSize: '1.5rem', color: '#FFD600'}}>🟡</span>
                  <div style={{fontWeight:700, fontSize:'1.15rem', color:'#FFD600'}}>{tpl.label}</div>
                </div>
                <div style={{color:'#555', marginBottom: 8}}>{tpl.description}</div>
                <div className="flex flex-row gap-2">
                  <button className="bg-black rounded" style={{width: '100%', color:'#FFD600', fontWeight:700, padding:'10px 18px'}} onClick={() => handleUse(tpl)}>Use Template</button>
                  <button className="bg-yellow rounded" style={{fontWeight:700, color:'#111', padding:'10px 18px'}} onClick={() => handleEdit(idx)}>Edit</button>
                  <button className="bg-gray rounded" style={{fontWeight:700, color:'#111', padding:'10px 18px'}} onClick={() => handleDelete(idx)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionTemplates; 