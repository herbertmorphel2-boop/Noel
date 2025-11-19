export interface User {
  name: string;
  authorized: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface WishlistData {
  // Tamanhos
  shoeSize: string;
  shirtSize: string;
  pantSize: string;
  
  // Preferências Pessoais
  favoriteColor: string;
  favoriteSnack: string; // Chocolate, doce, salgadinho
  favoriteDrink: string; // Refrigerante, suco, cerveja, vinho
  perfumeStyle: string; // Doce, amadeirado, cítrico, ou marca
  
  // Interesses
  hobby: string;
  contentPreference: string; // Filmes, Livros, Jogos (Gênero)
  accessoryPreference: string; // Boné, Brinco, Colar, Meias
  
  // Geral
  somethingNeeded: string; // Algo que está precisando
  generalInterests: string; // Resumo geral para o admin decidir o presente
}

export interface SantaState {
  isConnected: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0.0 to 1.0
  mood: 'happy' | 'listening' | 'thinking' | 'surprised';
}

export interface LiveSessionCallbacks {
  onAudioData: (audioBuffer: AudioBuffer) => void;
  onTranscription: (text: string, role: 'user' | 'model') => void;
  onWishlistUpdate: (data: Partial<WishlistData>) => void;
  onClose: () => void;
}