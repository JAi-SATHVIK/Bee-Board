import React, { useState } from 'react';

const categories = [
  'general',
  'technical',
  'process',
  'clarification',
  'suggestion',
];
const priorities = ['low', 'medium', 'high', 'urgent'];

function QA({ questions = [], onAsk, onAnswer }) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [answerInput, setAnswerInput] = useState({});

  // Show newest questions first, limit to 10
  const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  const handleAsk = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onAsk({
        text: input,
        category,
        priority,
        isAnonymous: anonymous,
        status: 'pending',
        answers: [],
        upvotes: 0,
        downvotes: 0,
      });
      setInput('');
    }
  };

  const handleAnswer = (id) => {
    if (!answerInput[id] || !answerInput[id].trim()) return;
    onAnswer(id, answerInput[id]);
    setAnswerInput({ ...answerInput, [id]: '' });
  };

  return (
    <div className="card" style={{maxHeight: 420, minHeight: 220, display: 'flex', flexDirection: 'column'}}>
      <div style={{flex: 1, overflowY: 'auto', marginBottom: 12}}>
        {sortedQuestions.length === 0 && <div className="text-center text-gray">No questions yet.</div>}
        {sortedQuestions.map((q, i) => (
          <div key={i} style={{marginBottom: 12, padding:8, borderBottom:'1px solid #e0e7ef', background: q.status === 'answered' ? '#e6ffe6' : undefined}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{flex: 1}}>{q.isAnonymous ? 'Anonymous' : q.username || q.user || 'User'}: {q.text}</span>
              <span style={{fontSize:'0.95em', color:'#888'}}>{q.category} | {q.priority}</span>
              {q.status === 'answered' && <span style={{fontSize:'0.95em', color:'green', fontWeight:700, border:'1px solid #16a34a', borderRadius:4, padding:'2px 8px', background:'#d1fae5'}}>Answered</span>}
              {q.status !== 'answered' && <span style={{fontSize:'0.95em', color:'#888'}}>{q.status}</span>}
            </div>
            <div style={{marginLeft:24, marginTop:4}}>
              {q.answers && q.answers.length > 0 && (
                <div style={{maxHeight: 120, overflowY: 'auto', marginBottom: 4}}>
                  <ul style={{paddingLeft:0, margin:0}}>
                    {[...q.answers].reverse().slice(0, 10).map((a, j) => (
                      <li key={j} style={{fontSize:'0.97em', color:'#2563eb', marginBottom:2}}>
                        {typeof a === 'string' ? a : a.answer}
                        {a.author && <span style={{marginLeft:8, color:'#888', fontSize:'0.93em'}}>by {a.author.username || a.author._id || 'User'}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {q.status !== 'answered' && (
                <div style={{display:'flex', gap:6, marginTop:4, alignItems:'center'}}>
                  <input
                    value={answerInput[q._id] || ''}
                    onChange={e => setAnswerInput({ ...answerInput, [q._id]: e.target.value })}
                    placeholder="Give your answer..."
                    style={{
                      flex:1,
                      background:'#fffbe7',
                      border:'2px solid #FFD600',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      fontSize: '1.12em',
                      fontWeight: 500,
                      color: '#222',
                      outline: 'none',
                      boxShadow: '0 2px 8px #ffd60022',
                      transition: 'border 0.18s, box-shadow 0.18s',
                      minHeight: 0,
                      marginRight: 0,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAnswer(q._id)}
                    className="bg-green"
                    style={{
                      width: 80,
                      padding: '10px 0',
                      fontWeight: 700,
                      fontSize: '1.08em',
                      borderRadius: '10px',
                      border: 'none',
                      boxShadow: '0 2px 8px #16a34a22',
                      cursor: 'pointer',
                      minWidth: 0,
                      minHeight: 0,
                      margin: 0,
                      alignSelf: 'flex-end',
                    }}
                  >Answer</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAsk} style={{display: 'flex', gap: 8, flexWrap:'wrap'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." style={{flex:2}} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{flex:1}}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{flex:1}}>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label style={{display:'flex', alignItems:'center', gap:4, fontSize:'0.95em'}}>
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /> Anonymous
        </label>
        <button type="submit" style={{width: 80}}>Ask</button>
      </form>
    </div>
  );
}

export default QA; 