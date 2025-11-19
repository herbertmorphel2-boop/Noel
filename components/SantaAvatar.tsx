
import React, { useEffect, useState } from 'react';
import { SantaState } from '../types';

interface SantaAvatarProps {
  state: SantaState;
}

export const SantaAvatar: React.FC<SantaAvatarProps> = ({ state }) => {
  const [blink, setBlink] = useState(false);
  const [lookAngle, setLookAngle] = useState({ x: 0, y: 0 });

  // --- ANIMATION PHYSICS ---
  const audioForce = Math.min(1, state.audioLevel * 3.5); // Sensitive audio trigger
  
  // Expressions
  const mouthOpen = audioForce * 25; // Max 25px opening
  const mustacheLift = -audioForce * 8; // Mustache goes up
  const eyebrowLift = audioForce * 10; // Eyebrows go up when loud
  const headBob = Math.sin(Date.now() / 500) * 2 + (audioForce * 5);
  
  // Blinking Logic
  useEffect(() => {
    const blinkLoop = setInterval(() => {
      if (Math.random() > 0.8) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }
    }, 2500);

    // Subtle idle head movement
    const lookLoop = setInterval(() => {
      setLookAngle({
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 3
      });
    }, 4000);

    return () => {
      clearInterval(blinkLoop);
      clearInterval(lookLoop);
    };
  }, []);

  return (
    <div className="relative w-full h-full max-h-[85vh] aspect-[4/5] flex items-center justify-center overflow-hidden rounded-[3rem] shadow-2xl bg-[#1a0b0b] border-[12px] border-[#4a0404] ring-4 ring-yellow-600/50">
      
      {/* --- BACKGROUND ATMOSPHERE --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#4a1212_0%,_#1a0505_100%)]"></div>
      
      {/* Fireplace Glow (Bottom Right) - Enhanced */}
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_90%,_#ffaa0044_0%,_transparent_60%)] animate-pulse mix-blend-overlay"></div>
      
      {/* Falling Snow Particles (CSS) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         {[...Array(20)].map((_, i) => (
             <div 
                key={i}
                className="absolute bg-white rounded-full opacity-60 animate-[fall_10s_linear_infinite]"
                style={{
                    width: Math.random() * 6 + 2 + 'px',
                    height: Math.random() * 6 + 2 + 'px',
                    left: Math.random() * 100 + '%',
                    top: -20 + 'px',
                    animationDelay: Math.random() * 5 + 's',
                    animationDuration: Math.random() * 5 + 5 + 's'
                }}
             />
         ))}
      </div>

      {/* --- THE AVATAR (SVG COMPOSITION) --- */}
      <div 
        className="relative w-[95%] max-w-[520px] transition-transform duration-100 will-change-transform filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        style={{ 
            transform: `translateY(${headBob}px) rotate(${lookAngle.x * 0.2}deg)`
        }}
      >
         <svg viewBox="0 0 400 500" className="w-full h-full">
            <defs>
                {/* Skin Gradient - More complex for 3D feel */}
                <radialGradient id="skinGrad" cx="0.4" cy="0.4" r="0.6">
                    <stop offset="0%" stopColor="#ffdec7" />
                    <stop offset="60%" stopColor="#e0ac94" />
                    <stop offset="100%" stopColor="#bc806b" />
                </radialGradient>
                
                {/* Nose Highlight */}
                <radialGradient id="noseHighlight" cx="0.3" cy="0.3" r="0.5">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Cheek Blush - Softer */}
                <radialGradient id="blush" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#ff5e5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff5e5e" stopOpacity="0" />
                </radialGradient>
                
                {/* Hat Velvet - Richer red */}
                <linearGradient id="hatGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff2a2a" />
                    <stop offset="50%" stopColor="#bd0000" />
                    <stop offset="100%" stopColor="#6b0000" />
                </linearGradient>
                
                {/* Gold Glasses - Shinier */}
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fffebb" />
                    <stop offset="40%" stopColor="#ffd700" />
                    <stop offset="60%" stopColor="#b8860b" />
                    <stop offset="100%" stopColor="#8a6a08" />
                </linearGradient>

                {/* Deep Shadow for Beard Layering */}
                <filter id="deepShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
                </filter>

                {/* Fluffy Filter */}
                <filter id="fluffy" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
                    <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                </filter>
            </defs>

            {/* --- BODY --- */}
            <path d="M40,450 Q200,530 360,450 L360,550 L40,550 Z" fill="#800000" />
            <path d="M90,450 Q200,510 310,450" stroke="white" strokeWidth="45" strokeLinecap="round" fill="none" filter="url(#fluffy)"/>

            {/* --- HEAD SHAPE --- */}
            <g transform="translate(200, 220)">
                 {/* Ears */}
                 <ellipse cx="-112" cy="10" rx="28" ry="38" fill="#cd9b85" />
                 <ellipse cx="112" cy="10" rx="28" ry="38" fill="#cd9b85" />

                 {/* Face Base */}
                 <rect x="-100" y="-120" width="200" height="180" rx="80" fill="url(#skinGrad)" />
                 
                 {/* Cheeks */}
                 <circle cx="-65" cy="-15" r="38" fill="url(#blush)" />
                 <circle cx="65" cy="-15" r="38" fill="url(#blush)" />

                 {/* --- EYES (Animated) --- */}
                 <g transform={`translate(0, ${-eyebrowLift * 0.3})`}>
                     {/* Eye Whites + Depth Shadow */}
                     <g transform={`translate(${-42 + lookAngle.x}, -42)`}>
                         <circle r="19" fill="#f0f0f0" stroke="#d1a08a" strokeWidth="1"/>
                         <circle r="9" fill="#2563eb" /> {/* Iris Blue */}
                         <circle r="8" fill="black" opacity="0.2" /> {/* Iris Shadow */}
                         <circle r="4" fill="black" /> {/* Pupil */}
                         <circle cx="5" cy="-5" r="2.5" fill="white" opacity="0.9" /> {/* Glint */}
                         {/* Eyelids */}
                         <path d="M-22,-22 L22,-22 L22,22 L-22,22 Z" fill="#d69c85" 
                               style={{ transform: `scaleY(${blink ? 1 : 0})`, transformOrigin: 'top', transition: 'transform 0.05s' }} />
                     </g>
                     <g transform={`translate(${42 + lookAngle.x}, -42)`}>
                         <circle r="19" fill="#f0f0f0" stroke="#d1a08a" strokeWidth="1"/>
                         <circle r="9" fill="#2563eb" />
                         <circle r="8" fill="black" opacity="0.2" />
                         <circle r="4" fill="black" />
                         <circle cx="5" cy="-5" r="2.5" fill="white" opacity="0.9" />
                         <path d="M-22,-22 L22,-22 L22,22 L-22,22 Z" fill="#d69c85" 
                               style={{ transform: `scaleY(${blink ? 1 : 0})`, transformOrigin: 'top', transition: 'transform 0.05s' }} />
                     </g>
                 </g>

                 {/* Glasses */}
                 <g stroke="url(#goldGrad)" strokeWidth="3.5" fill="none" opacity="0.95" filter="url(#deepShadow)">
                     <circle cx="-42" cy="-42" r="25" />
                     <circle cx="42" cy="-42" r="25" />
                     <path d="M-17,-42 Q0,-52 17,-42" strokeWidth="3" /> {/* Bridge */}
                     <path d="M-67,-42 L-115,-35" strokeWidth="2"/> {/* Arm L */}
                     <path d="M67,-42 L115,-35" strokeWidth="2"/> {/* Arm R */}
                     {/* Glass Lens Reflection */}
                     <path d="M-55,-50 Q-42,-55 -35,-45" stroke="white" strokeWidth="2" opacity="0.4" />
                     <path d="M29,-50 Q42,-55 49,-45" stroke="white" strokeWidth="2" opacity="0.4" />
                 </g>

                 {/* Eyebrows (Animated) */}
                 <g transform={`translate(0, ${-eyebrowLift})`} fill="white" filter="url(#fluffy)">
                     <path d="M-85,-78 Q-50,-100 -20,-78" stroke="white" strokeWidth="14" strokeLinecap="round" />
                     <path d="M85,-78 Q50,-100 20,-78" stroke="white" strokeWidth="14" strokeLinecap="round" />
                 </g>

                 {/* Nose (3D Volume) */}
                 <ellipse cx="0" cy="-8" rx="24" ry="20" fill="url(#skinGrad)" />
                 <ellipse cx="0" cy="-8" rx="24" ry="20" fill="url(#blush)" />
                 <ellipse cx="-5" cy="-12" rx="12" ry="8" fill="url(#noseHighlight)" transform="rotate(-15)"/>
                 
                 {/* --- MOUTH & BEARD AREA --- */}
                 <g transform="translate(0, 20)">
                     {/* Inner Mouth (Darkness) */}
                     <path 
                        d={`M-35,12 Q0,${12 + mouthOpen} 35,12 Z`} 
                        fill="#2a0505" 
                     />
                     
                     {/* Tongue */}
                     <path 
                        d={`M-18,${12 + mouthOpen - 5} Q0,${12 + mouthOpen + 2} 18,${12 + mouthOpen - 5}`} 
                        stroke="#ff6b6b" strokeWidth="8" strokeLinecap="round"
                        opacity={mouthOpen > 10 ? 1 : 0}
                     />

                     {/* Teeth */}
                     <path d="M-25,12 Q0,18 25,12" stroke="#eeeeee" strokeWidth="5" strokeLinecap="round" opacity={mouthOpen > 5 ? 1 : 0}/>

                     {/* Mustache (Moves Up when talking) */}
                     <g transform={`translate(0, ${mustacheLift})`} filter="url(#deepShadow)">
                        <path 
                            d="M0,2 Q-35,15 -75,35 Q-45,-35 0,-12 Q45,-35 75,35 Q35,15 0,2" 
                            fill="white" 
                        />
                        {/* Mustache texture lines */}
                        <path d="M-20,-5 Q-40,10 -60,20" stroke="#ddd" strokeWidth="1" fill="none" opacity="0.5" />
                        <path d="M20,-5 Q40,10 60,20" stroke="#ddd" strokeWidth="1" fill="none" opacity="0.5" />
                     </g>
                     
                     {/* Beard (Moves Down when talking) */}
                     <g transform={`translate(0, ${mouthOpen * 0.6})`}>
                         <path 
                            d="M-85,10 Q-100,110 0,190 Q100,110 85,10 Z" 
                            fill="white" 
                            filter="url(#fluffy)"
                         />
                         {/* Beard Volume Shadow */}
                         <path 
                            d="M-50,50 Q0,120 50,50" 
                            stroke="#e0e0e0" strokeWidth="0" fill="#f0f0f0" opacity="0.3" filter="url(#fluffy)"
                         />
                     </g>
                 </g>
            </g>

            {/* --- HAT --- */}
            <g transform="translate(200, 100)" filter="url(#deepShadow)">
                 {/* Hat Body */}
                 <path d="M-95,25 C-110,-100 60,-160 130,-20 C150,40 190,120 200,145" stroke="url(#hatGrad)" strokeWidth="0" fill="url(#hatGrad)" />
                 {/* Hat Fold */}
                 <path d="M-90,15 Q-60,-120 110,-50 L160,70" stroke="#6b0000" strokeWidth="0" fill="url(#hatGrad)" />
                 {/* Pom Pom */}
                 <circle cx="160" cy="70" r="28" fill="white" filter="url(#fluffy)" />
                 {/* White Trim */}
                 <path d="M-115,-5 Q0,-15 115,-5 L115,45 Q0,55 -115,45 Z" fill="white" filter="url(#fluffy)" />
            </g>

         </svg>
      </div>

      {/* --- OVERLAY VIGNETTE --- */}
      <div className="absolute inset-0 pointer-events-none rounded-[3rem] shadow-[inset_0_0_120px_rgba(20,0,0,0.9)]"></div>
      
      {/* Reflection/Gloss on the screen/glass */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent opacity-20 pointer-events-none rounded-r-[3rem] mix-blend-screen"></div>
    </div>
  );
};
