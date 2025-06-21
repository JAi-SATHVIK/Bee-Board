import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);

  const value = {
    session,
    setSession,
    user,
    setUser,
    participants,
    setParticipants
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
} 