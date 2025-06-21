import React from 'react';

function StickyNote({ x, y, width, height, color, text, onChange, onMove, onResize }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: color,
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        padding: 12,
        cursor: 'move',
        userSelect: 'none',
        resize: 'both',
        overflow: 'auto',
        minWidth: 100,
        minHeight: 70,
        border: '1.5px solid #e0e7ef',
        transition: 'box-shadow 0.2s',
      }}
      className="dark:border-gray-700 dark:shadow-lg"
      draggable
      onDragEnd={onMove}
    >
      <textarea
        value={text}
        onChange={onChange}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          resize: 'none',
          outline: 'none',
          fontSize: 17,
          fontWeight: 500,
          color: '#222',
          fontFamily: 'inherit',
        }}
        className="dark:text-gray-100 dark:bg-transparent"
      />
    </div>
  );
}

export default StickyNote; 