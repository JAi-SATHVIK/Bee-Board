import React from 'react';

function TextBox({ x, y, width, height, text, onChange, onMove, onResize, color = '#fff', bg = 'transparent' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: bg,
        border: '1.5px solid #e0e7ef',
        borderRadius: 8,
        padding: 10,
        cursor: 'move',
        userSelect: 'none',
        resize: 'both',
        overflow: 'auto',
        minWidth: 100,
        minHeight: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s',
      }}
      className="dark:bg-gray-900 dark:border-gray-700 dark:shadow-lg"
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
          fontSize: 16,
          color: color,
          fontFamily: 'inherit',
        }}
        className="dark:text-gray-100 dark:bg-transparent"
      />
    </div>
  );
}

export default TextBox; 