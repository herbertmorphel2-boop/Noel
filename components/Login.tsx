import React, { useState } from 'react';
import { AUTHORIZED_USERS } from '../constants';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const cleanName = name.trim().toUpperCase();
    if (AUTHORIZED_USERS.includes(cleanName)) {
      onLogin(cleanName);
    } else {
      setError('Ho ho ho! O Papai Noel não encontrou seu nome na lista especial. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 font-sans text-white">
      <div className="max-w-md w-full bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-md shadow-2xl text-center">
        <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-900/50">
            <span className="text-4xl">🎅</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-red-400">Papai Noel Secreto</h1>
        <p className="text-slate-400 mb-8 text-sm">Digite seu nome para entrar na casa do Papai Noel.</p>
        
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Seu Nome"
          className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        
        {error && (
          <p className="text-red-400 text-sm mb-4 animate-pulse">{error}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg transform active:scale-95"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};
