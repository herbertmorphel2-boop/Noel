import React, { useState } from 'react';
import { Login } from './components/Login';
import { ChatInterface } from './components/ChatInterface';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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
