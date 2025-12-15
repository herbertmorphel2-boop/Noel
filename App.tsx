import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { ChatInterface } from './components/ChatInterface';
import { verifyToken } from './src/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        setCurrentUser(decoded.username);
      }
    }
  }, []);

  return (
    <div className="antialiased bg-black h-screen w-full">
      {!currentUser ? (
        <Login onLogin={setCurrentUser} />
      ) : (
        <ChatInterface userName={currentUser} />
      )}
    </div>
  );
}
