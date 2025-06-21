import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { SessionProvider } from './contexts/SessionContext';
import { CanvasProvider } from './contexts/CanvasContext';
import App from './app';
import './assets/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <SessionProvider>
        <CanvasProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CanvasProvider>
      </SessionProvider>
    </SocketProvider>
  </React.StrictMode>
);
