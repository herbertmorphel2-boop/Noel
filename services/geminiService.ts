
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { SANTA_SYSTEM_INSTRUCTION } from '../constants';
import { LiveSessionCallbacks, WishlistData } from '../types';

// Configuration
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const OUTPUT_SAMPLE_RATE = 24000;

// --- TOOL DEFINITIONS ---
const updateWishlistTool: FunctionDeclaration = {
  name: 'update_wishlist',
  description: 'Atualiza o dossiê do usuário. Chame sempre que o usuário mencionar uma preferência.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      shoeSize: { type: Type.STRING, description: 'Tamanho do calçado.' },
      shirtSize: { type: Type.STRING, description: 'Tamanho de camisa/blusa.' },
      pantSize: { type: Type.STRING, description: 'Tamanho de calça/short.' },
      favoriteColor: { type: Type.STRING, description: 'Cor favorita.' },
      favoriteSnack: { type: Type.STRING, description: 'Comida rápida/doce/chocolate favorito.' },
      favoriteDrink: { type: Type.STRING, description: 'Bebida favorita.' },
      perfumeStyle: { type: Type.STRING, description: 'Estilo de cheiro ou marca de perfume.' },
      hobby: { type: Type.STRING, description: 'Passatempo principal.' },
      contentPreference: { type: Type.STRING, description: 'Gênero de filmes, livros ou jogos.' },
      accessoryPreference: { type: Type.STRING, description: 'Acessórios que usa (boné, brinco, meias, etc).' },
      somethingNeeded: { type: Type.STRING, description: 'Algo útil que a pessoa precise.' },
      generalInterests: { type: Type.STRING, description: 'Resumo dos interesses para guiar a escolha do presente.' }
    },
  }
};

// --- SERVICE STATE ---
let currentSessionPromise: Promise<any> | null = null;
let audioContext: AudioContext | null = null;
let inputScriptProcessor: ScriptProcessorNode | null = null;
let stream: MediaStream | null = null;

export const connectToSantaLive = async (
  userName: string, 
  callbacks: LiveSessionCallbacks
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Setup Audio Output
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: OUTPUT_SAMPLE_RATE,
  });
  
  // Ensure context is running (browsers often suspend it)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // 2. Setup Audio Input
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inputContext = new AudioContext({ sampleRate: 16000 });
  const source = inputContext.createMediaStreamSource(stream);
  inputScriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
  
  inputScriptProcessor.onaudioprocess = (e) => {
    const inputData = e.inputBuffer.getChannelData(0);
    const pcmBlob = createPcmBlob(inputData);
    if (currentSessionPromise) {
      currentSessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    }
  };

  source.connect(inputScriptProcessor);
  inputScriptProcessor.connect(inputContext.destination);

  // 3. Connect to Gemini
  currentSessionPromise = ai.live.connect({
    model: MODEL_NAME,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: SANTA_SYSTEM_INSTRUCTION(userName),
      tools: [{ functionDeclarations: [updateWishlistTool] }], // Enable Tools
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } // Puck has a deeper voice
      }
    },
    callbacks: {
      onopen: async () => {
        console.log("Santa connection opened");
        // Note: We rely on the system instruction to make Santa speak first.
      },
      onmessage: async (message: LiveServerMessage) => {
        // A. Handle Audio
        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData && audioContext) {
            const audioBuffer = await decodeAudioData(decode(audioData), audioContext);
            callbacks.onAudioData(audioBuffer);
        }

        // B. Handle Tool Calls (Data Collection)
        if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'update_wishlist') {
                    const args = fc.args as Partial<WishlistData>;
                    console.log("Santa noted:", args);
                    callbacks.onWishlistUpdate(args);

                    // Send success response back to model
                    currentSessionPromise?.then(session => {
                        session.sendToolResponse({
                            functionResponses: [{
                                id: fc.id,
                                name: fc.name,
                                response: { result: "Info saved to dossier." }
                            }]
                        });
                    });
                }
            }
        }
      },
      onclose: () => callbacks.onClose(),
      onerror: (e) => console.error("Gemini Error", e)
    }
  });

  return currentSessionPromise;
};

export const disconnectSanta = () => {
  if (inputScriptProcessor) {
    inputScriptProcessor.disconnect();
    inputScriptProcessor.onaudioprocess = null;
  }
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (audioContext) audioContext.close();
};

// --- UTILS ---

function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const uint8 = new Uint8Array(int16.buffer);
  return {
    data: encode(uint8),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length; 
  const buffer = ctx.createBuffer(1, frameCount, OUTPUT_SAMPLE_RATE);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
