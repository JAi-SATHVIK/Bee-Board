import React from 'react';

function TemplateSelector({ templates = [], selected, onSelect }) {
  return (
    <div className="card" style={{maxHeight: 180, minHeight: 100}}>
      <div className="mb-2 text-center" style={{fontWeight:700}}>Choose a Template</div>
      <div className="flex flex-row gap-2 justify-center">
        {templates.map((tpl) => (
          <button
            key={tpl.value}
            type="button"
            className={selected === tpl.value ? 'bg-blue' : 'bg-gray'}
            style={{fontWeight:600, minWidth:90}}
            onClick={() => onSelect(tpl.value)}
          >
            {tpl.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector; 