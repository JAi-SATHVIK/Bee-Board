import React from 'react';

function Shape({ type, x, y, width, height, color, stroke, strokeWidth, ...props }) {
  if (type === 'rectangle') {
    return <div style={{ position: 'absolute', left: x, top: y, width, height, background: color, border: `${strokeWidth || 2}px solid ${stroke || '#2563eb'}`, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} className="dark:border-gray-700 dark:shadow-lg" {...props} />;
  }
  if (type === 'circle') {
    return <div style={{ position: 'absolute', left: x, top: y, width, height, background: color, border: `${strokeWidth || 2}px solid ${stroke || '#2563eb'}`, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} className="dark:border-gray-700 dark:shadow-lg" {...props} />;
  }
  if (type === 'arrow' || type === 'line') {
    return (
      <svg style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }} width={width} height={height} {...props}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={stroke || '#2563eb'} strokeWidth={strokeWidth || 3} markerEnd={type === 'arrow' ? 'url(#arrowhead)' : undefined} />
        {type === 'arrow' && (
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke || '#2563eb'} />
            </marker>
          </defs>
        )}
      </svg>
    );
  }
  return null;
}

export default Shape; 