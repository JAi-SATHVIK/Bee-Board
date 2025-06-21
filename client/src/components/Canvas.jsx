import React from 'react';

function Canvas({ children, onMouseDown, onMouseMove, onMouseUp, onWheel, style }) {
  return (
    <div
      id="main-canvas"
      className="w-full h-full bg-gray-100 dark:bg-gray-900 relative select-none rounded-2xl shadow-xl border-4 border-blue-400 dark:border-blue-700"
      style={{ borderStyle: 'solid', minHeight: 500, overflow: 'auto', ...style }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}

export default Canvas; 