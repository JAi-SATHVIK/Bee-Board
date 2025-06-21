import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

function useSocketEvents(events = {}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, events]);
}

export default useSocketEvents; 