import React, { createContext, useContext, useState } from 'react';

const CanvasContext = createContext(null);

export function useCanvas() {
  return useContext(CanvasContext);
}

export function CanvasProvider({ children }) {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [action, setAction] = useState(null);

  const value = {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    action,
    setAction
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
} 