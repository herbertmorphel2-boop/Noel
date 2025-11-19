
import React, { useState, useRef } from 'react';
import { SantaAvatar } from './SantaAvatar';
import { connectToSantaLive, disconnectSanta } from '../services/geminiService';
import { SantaState, WishlistData } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface ChatInterfaceProps {
  userName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userName }) => {
  // Avatar State
  const [santaState, setSantaState] = useState<SantaState>({ 
    isConnected: false, isSpeaking: false, mood: 'happy', audioLevel: 0 
  });
  
  // Data Collection State (Extended)
  const [wishlist, setWishlist] = useState<WishlistData>({
    shoeSize: '',
    shirtSize: '',
    pantSize: '',
    favoriteColor: '',
    favoriteSnack: '',
    favoriteDrink: '',
    perfumeStyle: '',
    hobby: '',
    contentPreference: '',
    accessoryPreference: '',
    somethingNeeded: '',
    generalInterests: ''
  });

  const [statusMessage, setStatusMessage] = useState("Aguardando conexão...");
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startCall = async () => {
    setStatusMessage("Chamando o Polo Norte...");
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; // Lower fftSize for snappier visual response
      
      await connectToSantaLive(userName, {
        onAudioData: (buffer) => playAudioChunk(buffer),
        onTranscription: () => {},
        onWishlistUpdate: (data) => {
            setWishlist(prev => ({ ...prev, ...data }));
            // Scroll board to bottom or flash visual feedback
            const board = document.getElementById('wishlist-board');
            if(board) {
                board.classList.add('ring-2', 'ring-yellow-400', 'bg-slate-800');
                setTimeout(() => board.classList.remove('ring-2', 'ring-yellow-400', 'bg-slate-800'), 300);
            }
        },
        onClose: () => handleEndCall()
      });

      setSantaState(prev => ({ ...prev, isConnected: true }));
      setStatusMessage("Conexão Estabelecida");
      startVisualizer();

    } catch (error) {
      console.error("Connection error", error);
      setStatusMessage("Erro na linha mágica. Tente novamente.");
    }
  };

  const playAudioChunk = (buffer: AudioBuffer) => {
    if (!audioContextRef.current || !analyserRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    const currentTime = audioContextRef.current.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  const startVisualizer = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      // Focus on lower frequencies (voice fundamental freq) for better lip sync
      const relevantBins = dataArray.length / 2; 
      for (let i = 0; i < relevantBins; i++) sum += dataArray[i];
      const average = sum / relevantBins;
      
      // Normalize 0-255 to 0-1
      setSantaState(prev => ({ ...prev, audioLevel: average / 140 }));
      requestAnimationFrame(update);
    };
    update();
  };

  const handleEndCall = () => {
    disconnectSanta();
    setSantaState(prev => ({ ...prev, isConnected: false, isSpeaking: false, audioLevel: 0 }));
    setStatusMessage("Chamada Finalizada");
  };

  const handleAutoEmail = () => {
    const subject = `🎅 DOSSIÊ DE NATAL: ${userName}`;
    const body = `
Relatório Oficial do Papai Noel AI
-----------------------------------
Criança/Adulto: ${userName}
-----------------------------------
TAMANHOS:
👟 Calçado: ${wishlist.shoeSize || '-'}
👕 Camisa: ${wishlist.shirtSize || '-'}
👖 Calça: ${wishlist.pantSize || '-'}

PREFERÊNCIAS:
🎨 Cor: ${wishlist.favoriteColor || '-'}
🍫 Belisco: ${wishlist.favoriteSnack || '-'}
🥤 Bebida: ${wishlist.favoriteDrink || '-'}
✨ Perfume: ${wishlist.perfumeStyle || '-'}

INTERESSES:
🎮 Hobby: ${wishlist.hobby || '-'}
📚 Gêneros: ${wishlist.contentPreference || '-'}
🧢 Acessórios: ${wishlist.accessoryPreference || '-'}

NECESSIDADE:
🆘 Precisa de: ${wishlist.somethingNeeded || '-'}

RESUMO GERAL PARA PRESENTE:
🎁 ${wishlist.generalInterests || 'O usuário não especificou, verificar itens acima.'}
    `.trim();
    
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* LEFT PANEL: SANTA AVATAR */}
      <div className="flex-1 relative flex flex-col">
         {/* Header */}
         <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/60 p-2 px-4 rounded-full backdrop-blur border border-white/10 shadow-lg">
            <div className={`w-3 h-3 rounded-full ${santaState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-bold tracking-wide text-sm uppercase text-slate-200 shadow-black drop-shadow-md">
                {santaState.isConnected ? 'Linha Segura: Polo Norte' : 'Desconectado'}
            </span>
         </div>

         {/* Avatar Wrapper */}
         <div className="flex-1 p-4 lg:p-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2d1b1b] via-black to-black">
            <SantaAvatar state={santaState} />
         </div>

         {/* Call Controls */}
         <div className="h-28 bg-black/80 backdrop-blur border-t border-white/5 flex items-center justify-center gap-8 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            {!santaState.isConnected ? (
                 <button onClick={startCall} className="flex items-center gap-3 bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white px-12 py-5 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all hover:scale-105 active:scale-95 border border-green-400/30 uppercase tracking-widest">
                    <span className="text-2xl animate-bounce">📞</span> Ligar para o Noel
                 </button>
            ) : (
                <button onClick={handleEndCall} className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)] text-3xl transition-all hover:scale-110 border border-red-400/30">
                    ❌
                </button>
            )}
         </div>
      </div>

      {/* RIGHT PANEL: LIVE DATA DOSSIER */}
      <div className="w-[400px] bg-[#0f172a] border-l border-slate-800 flex flex-col shadow-2xl z-10 relative">
         <div className="p-6 bg-gradient-to-b from-[#3f0e0e] to-[#0f172a] border-b border-white/5">
            <h2 className="text-3xl font-bold text-red-500 christmas-font text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Dossiê de Natal</h2>
            <p className="text-xs text-center text-red-200/60 mt-1 uppercase tracking-widest">Coletando segredos...</p>
         </div>

         <div id="wishlist-board" className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-24">
            {/* User Card */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4 shadow-inner">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Arquivo de:</label>
                <div className="text-2xl font-bold text-white tracking-tight">{userName}</div>
            </div>

            <SectionTitle title="Medidas & Tamanhos" />
            <div className="grid grid-cols-2 gap-2">
                <WishlistItem icon="👟" label="Pé" value={wishlist.shoeSize} />
                <WishlistItem icon="👕" label="Camisa" value={wishlist.shirtSize} />
                <WishlistItem icon="👖" label="Calça" value={wishlist.pantSize} />
                <WishlistItem icon="🎨" label="Cor" value={wishlist.favoriteColor} />
            </div>

            <SectionTitle title="Gostos Pessoais (Coisas Baratas)" />
            <WishlistItem icon="🍫" label="Belisco Favorito" value={wishlist.favoriteSnack} />
            <WishlistItem icon="🥤" label="Bebida" value={wishlist.favoriteDrink} />
            <WishlistItem icon="✨" label="Perfume" value={wishlist.perfumeStyle} />

            <SectionTitle title="Interesses & Hobbies" />
            <WishlistItem icon="🎮" label="Hobby" value={wishlist.hobby} />
            <WishlistItem icon="📚" label="Filmes/Livros" value={wishlist.contentPreference} />
            <WishlistItem icon="🧢" label="Acessórios" value={wishlist.accessoryPreference} />

            <SectionTitle title="Necessidade Real" />
            <WishlistItem icon="🆘" label="Precisa de" value={wishlist.somethingNeeded} />

            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 rounded-xl border border-yellow-700/30 shadow-lg">
                <label className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold block mb-2">🎁 Resumo para o Presente</label>
                <div className={`text-sm leading-relaxed ${wishlist.generalInterests ? 'text-yellow-200' : 'text-slate-600 italic'}`}>
                    {wishlist.generalInterests || "O Noel está analisando..."}
                </div>
            </div>
         </div>

         {/* Footer Action */}
         <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0f172a]/95 border-t border-slate-800 backdrop-blur-sm">
             <button 
                onClick={handleAutoEmail}
                className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
             >
                <span>📧</span> Enviar para o Elfo Chefe
             </button>
         </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-1 pl-1 border-l-2 border-red-900/50">
        {title}
    </div>
);

const WishlistItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-500 ${value ? 'bg-green-900/20 border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-base shadow-inner">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-slate-400 uppercase font-bold">{label}</div>
        <div className={`text-sm font-medium truncate ${value ? 'text-green-300' : 'text-slate-600 italic'}`}>
            {value || "..."}
        </div>
      </div>
      {value && <div className="text-green-500 text-xs animate-bounce">✓</div>}
  </div>
);
