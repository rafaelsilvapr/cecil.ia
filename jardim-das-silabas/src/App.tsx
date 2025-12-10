import React, { useState, useEffect } from 'react';
import { Star, Lock, Check, CheckCircle2, ArrowRight, Smile } from 'lucide-react';
import { CURRICULUM } from './data/curriculum';
import type { WordData } from './data/curriculum';

// --- Audio System ---
const playSound = (type: 'success' | 'error' | 'pop' | 'water' | 'celebration') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'pop') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'water') {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + 2);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } else if (type === 'celebration') {
    [0, 0.2, 0.4, 0.6].forEach((offset, i) => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440 + (i * 100), now + offset);
      gain2.gain.setValueAtTime(0.1, now + offset);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.5);
      osc2.start(now + offset);
      osc2.stop(now + offset + 0.5);
    });
  }
};

// --- DATA ---
const MAP_NODES = Array.from({ length: 20 }, (_, i) => {
  const curriculumIndex = i % CURRICULUM.length;
  const curriculumLevel = CURRICULUM[curriculumIndex];
  return {
    id: i,
    curriculumId: curriculumLevel.id,
    title: curriculumLevel.title,
    icon: i % 2 === 0 ? <Star className="text-white" /> : <Smile className="text-white" />,
  };
});

// --- SVGs ---

const GirlAvatar = ({ streak, isJumping = false }: { streak: number; isJumping?: boolean }) => {
  const plantStage = Math.min(Math.floor(streak / 10), 4);
  const isDragging = plantStage >= 3;
  const skinColor = "#D9A084";
  const hairColor = "#1a1a1a";
  const shirtColor = "#FF69B4";
  const pantsColor = "#4682B4";
  const shoeColor = "#FFFFFF";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className={`overflow-visible ${isJumping ? 'animate-bounce' : ''}`}>
      <g transform={isDragging ? "translate(-20, 0)" : "translate(0, 0)"}>
        {isDragging ? (
          <g>
            <line x1="70" y1="80" x2="110" y2="90" stroke="#8B4513" strokeWidth="3" />
            <g transform="translate(110, 85) scale(1.2)">
              <path d="M-15 0 L15 0 L12 20 L-12 20 Z" fill="#C15433" />
              <rect x="-3" y="-40" width="6" height="40" fill="#5D4037" />
              <circle cx="0" cy="-50" r="25" fill="#4CAF50" stroke="#388E3C" strokeWidth="2" />
            </g>
            <g transform="rotate(-20, 70, 100)">
              <path d="M60 100 L50 130" stroke={pantsColor} strokeWidth="14" strokeLinecap="round" />
              <path d="M80 100 L90 130" stroke={pantsColor} strokeWidth="14" strokeLinecap="round" />
              <path d="M50 130 L45 130" stroke={shoeColor} strokeWidth="14" strokeLinecap="round" />
              <path d="M90 130 L95 130" stroke={shoeColor} strokeWidth="14" strokeLinecap="round" />
              <path d="M55 100 L85 100 L85 70 L55 70 Z" fill={shirtColor} />
              <circle cx="70" cy="55" r="22" fill={skinColor} />
              <path d="M48 55 C48 30 92 30 92 55 L92 65 L48 65 Z" fill={hairColor} />
              <rect x="55" y="40" width="30" height="15" rx="2" fill={hairColor} />
              <path d="M65 58 L75 58" stroke="black" strokeWidth="2" />
              <path d="M62 50 L68 52" stroke="black" strokeWidth="2" />
              <path d="M72 52 L78 50" stroke="black" strokeWidth="2" />
              <path d="M80 75 L70 80" stroke={skinColor} strokeWidth="8" strokeLinecap="round" />
            </g>
          </g>
        ) : (
          <g>
            <path d="M60 95 L60 125" stroke={pantsColor} strokeWidth="14" strokeLinecap="round" />
            <path d="M80 95 L80 125" stroke={pantsColor} strokeWidth="14" strokeLinecap="round" />
            <path d="M55 128 L65 128" stroke={shoeColor} strokeWidth="10" strokeLinecap="round" />
            <path d="M75 128 L85 128" stroke={shoeColor} strokeWidth="10" strokeLinecap="round" />
            <path d="M50 95 L90 95 L85 65 L55 65 Z" fill={shirtColor} />
            <g transform="translate(0, -5)">
              <circle cx="70" cy="50" r="24" fill={skinColor} />
              <path d="M46 50 C46 20 94 20 94 50 L96 70 Q96 80 85 75 L85 50" fill={hairColor} />
              <path d="M46 50 L44 70 Q44 80 55 75 L55 50" fill={hairColor} />
              <path d="M46 50 Q70 15 94 50" fill={hairColor} />
              <path d="M52 35 Q70 32 88 35 L88 48 Q70 45 52 48 Z" fill={hairColor} />
              <g transform="translate(0, 2)">
                <ellipse cx="62" cy="52" rx="5" ry="7" fill="white" />
                <ellipse cx="62" cy="52" rx="3" ry="5" fill="black" />
                <circle cx="63" cy="50" r="1.5" fill="white" />
                <ellipse cx="78" cy="52" rx="5" ry="7" fill="white" />
                <ellipse cx="78" cy="52" rx="3" ry="5" fill="black" />
                <circle cx="79" cy="50" r="1.5" fill="white" />
                <path d="M66 62 Q70 65 74 62" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="58" cy="58" r="3" fill="#FFB6C1" opacity="0.6" />
                <circle cx="82" cy="58" r="3" fill="#FFB6C1" opacity="0.6" />
              </g>
            </g>
            <path d="M55 70 L60 85" stroke={skinColor} strokeWidth="8" strokeLinecap="round" />
            <path d="M85 70 L80 85" stroke={skinColor} strokeWidth="8" strokeLinecap="round" />
            <g transform="translate(70, 88)">
              <path d="M-12 0 L12 0 L10 15 L-10 15 Z" fill="#C15433" />
              <rect x="-14" y="-3" width="28" height="4" fill="#A04020" rx="1" />
              {plantStage === 0 && <path d="M0 0 L0 -10 M0 -10 Q-5 -15 0 -20 Q5 -15 0 -10" stroke="#4CAF50" strokeWidth="2" fill="#4CAF50" />}
              {plantStage === 1 && (
                <g transform="translate(0, -5)">
                  <path d="M0 0 L0 -15" stroke="#4CAF50" strokeWidth="2" />
                  <ellipse cx="-5" cy="-15" rx="5" ry="3" fill="#4CAF50" transform="rotate(-30)" />
                  <ellipse cx="5" cy="-15" rx="5" ry="3" fill="#4CAF50" transform="rotate(30)" />
                </g>
              )}
              {plantStage >= 2 && (
                <g transform="translate(0, -5)">
                  <path d="M0 0 L0 -20" stroke="#4CAF50" strokeWidth="3" />
                  <circle cx="0" cy="-25" r="10" fill="#4CAF50" />
                  <circle cx="-8" cy="-15" r="6" fill="#66BB6A" />
                  <circle cx="8" cy="-15" r="6" fill="#66BB6A" />
                </g>
              )}
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};

const DadAvatar = ({ isAnimating }: { isAnimating: boolean }) => (
  <svg width="150" height="150" viewBox="0 0 150 150" className="overflow-visible">
    <path d="M45 150 L105 150 L105 110 C105 100 95 90 75 90 C55 90 45 100 45 110 Z" fill="#78C800" />
    <g transform="translate(0, -10)">
      <rect x="65" y="80" width="20" height="15" fill="#F5CBA7" />
      <ellipse cx="75" cy="60" rx="30" ry="35" fill="#F5CBA7" />
      <path d="M48 65 Q75 100 102 65 L102 60 Q105 75 100 85 Q75 110 50 85 Q45 75 48 60 Z" fill="#4E342E" />
      <path d="M60 75 Q75 85 90 75" fill="white" stroke="black" strokeWidth="1" />
      <path d="M60 75 Q75 85 90 75" fill="none" stroke="black" strokeWidth="1" />
      <path d="M72 65 Q75 68 78 65" stroke="#C18C65" strokeWidth="2" fill="none" />
      <g stroke="black" strokeWidth="2.5" fill="none">
        <circle cx="62" cy="55" r="10" />
        <circle cx="88" cy="55" r="10" />
        <line x1="72" y1="55" x2="78" y2="55" strokeWidth="2" />
      </g>
      <circle cx="62" cy="55" r="3" fill="black" />
      <circle cx="88" cy="55" r="3" fill="black" />
      <path d="M45 55 C40 40 45 20 60 15 C70 10 80 10 90 15 C105 20 110 40 105 55" fill="#4E342E" />
    </g>
    <g className={isAnimating ? "animate-blow-kiss" : "opacity-0"}>
      <path d="M75 85 Q80 80 85 85 L85 95 L75 95 Z" fill="#F5CBA7" />
      <path d="M75 85 Q80 80 85 85 T95 85" stroke="red" strokeWidth="0" fill="red" className="animate-ping opacity-75" />
    </g>
    <style>{`
      @keyframes blow-kiss {
        0% { transform: translate(0, 0); opacity: 1; }
        50% { transform: translate(30px, -20px); opacity: 1; }
        100% { transform: translate(60px, -40px); opacity: 0; }
      }
      .animate-blow-kiss {
        animation: blow-kiss 2s ease-out infinite;
      }
    `}</style>
  </svg>
);

const PinkHouse = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible filter drop-shadow-lg">
    <path d="M10 130 L150 130 L140 120 L20 120 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
    <path d="M10 130 L10 135 L150 135 L150 130" fill="#5D4037" />
    <rect x="20" y="60" width="90" height="60" fill="#FF69B4" stroke="#333" strokeWidth="2" />
    <g stroke="#FF1493" strokeWidth="1" opacity="0.4">
      <line x1="20" y1="70" x2="110" y2="70" />
      <line x1="20" y1="80" x2="110" y2="80" />
      <line x1="20" y1="90" x2="110" y2="90" />
      <line x1="20" y1="100" x2="110" y2="100" />
      <line x1="20" y1="110" x2="110" y2="110" />
    </g>
    <rect x="55" y="75" width="30" height="45" fill="#3E2723" />
    <rect x="55" y="75" width="30" height="45" fill="none" stroke="#5D4037" strokeWidth="3" />
    <rect x="25" y="75" width="20" height="20" fill="#81D4FA" stroke="#5D4037" strokeWidth="3" />
    <line x1="35" y1="75" x2="35" y2="95" stroke="#5D4037" strokeWidth="2" />
    <line x1="25" y1="85" x2="45" y2="85" stroke="#5D4037" strokeWidth="2" />
    <path d="M10 60 L65 20 L120 60" fill="#B0BEC5" stroke="#37474F" strokeWidth="2" />
    <path d="M10 60 L65 20 L120 60" fill="none" stroke="#78909C" strokeWidth="2" strokeDasharray="4 4" />
    <rect x="15" y="60" width="5" height="60" fill="#8D6E63" stroke="#5D4037" />
    <rect x="110" y="60" width="5" height="60" fill="#8D6E63" stroke="#5D4037" />
    <path d="M110 60 L150 80" stroke="#8D6E63" strokeWidth="4" />
    <rect x="145" y="80" width="5" height="40" fill="#8D6E63" stroke="#5D4037" />
  </svg>
);

const DadPainting = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
    <g transform="translate(10, 0)">
      <g transform="translate(40, 30)">
        <circle cx="0" cy="0" r="14" fill="#F5CBA7" />
        <path d="M-14 -5 C-14 -20 14 -20 14 -5" fill="#4E342E" />
        <circle cx="-14" cy="-5" r="5" fill="#4E342E" />
        <circle cx="14" cy="-5" r="5" fill="#4E342E" />
        <path d="M-14 0 Q0 25 14 0 L14 -5 L-14 -5 Z" fill="#4E342E" />
        <g stroke="black" strokeWidth="1.5" fill="none">
          <circle cx="-6" cy="-2" r="4" />
          <circle cx="6" cy="-2" r="4" />
          <line x1="-2" y1="-2" x2="2" y2="-2" />
        </g>
        <path d="M-5 8 Q0 12 5 8" stroke="white" strokeWidth="1.5" fill="none" />
      </g>
      <path d="M25 45 L55 45 L55 75 L25 75 Z" fill="#78C800" />
      <path d="M25 45 L15 60" stroke="#78C800" strokeWidth="8" strokeLinecap="round" />
      <path d="M55 45 L70 35" stroke="#78C800" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 75 L30 100" stroke="#003366" strokeWidth="10" strokeLinecap="round" />
      <path d="M50 75 L50 100" stroke="#003366" strokeWidth="10" strokeLinecap="round" />
      <path d="M25 102 L35 102" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
      <path d="M45 102 L55 102" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(70, 35) rotate(-10)">
        <rect x="-5" y="-15" width="25" height="10" fill="#FF69B4" stroke="#333" strokeWidth="1" />
        <path d="M20 -10 L25 -10 L25 10 L15 20" stroke="#888" strokeWidth="2" fill="none" />
        <rect x="12" y="20" width="6" height="15" fill="#333" rx="2" />
      </g>
      <circle cx="80" cy="20" r="3" fill="#FF69B4" opacity="0.8" />
    </g>
  </svg>
);

const DadSoccer = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
    <g transform="translate(60, 30)">
      <circle cx="0" cy="0" r="13" fill="#F5CBA7" />
      <path d="M-13 -5 C-13 -20 13 -20 13 -5" fill="#4E342E" />
      <path d="M-13 0 Q0 25 13 0" fill="#4E342E" />
      <g stroke="black" strokeWidth="1.5" fill="none">
        <circle cx="-5" cy="-2" r="3.5" />
        <circle cx="5" cy="-2" r="3.5" />
      </g>
    </g>
    <g transform="translate(45, 45)">
      <rect x="0" y="0" width="30" height="35" fill="#FFD700" />
      <rect x="8" y="0" width="5" height="35" fill="#003366" />
      <rect x="18" y="0" width="5" height="35" fill="#003366" />
    </g>
    <path d="M45 50 L35 60" stroke="#F5CBA7" strokeWidth="6" strokeLinecap="round" />
    <path d="M75 50 L85 60" stroke="#F5CBA7" strokeWidth="6" strokeLinecap="round" />
    <rect x="45" y="80" width="30" height="12" fill="#003366" />
    <path d="M50 92 L50 110" stroke="#F5CBA7" strokeWidth="6" strokeLinecap="round" />
    <path d="M70 92 L75 105" stroke="#F5CBA7" strokeWidth="6" strokeLinecap="round" />
    <path d="M45 112 L55 112" stroke="#333" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 105 L82 105" stroke="#333" strokeWidth="6" strokeLinecap="round" transform="rotate(10, 77, 105)" />
    <g transform="translate(75, 115)">
      <circle cx="0" cy="0" r="10" fill="white" stroke="black" strokeWidth="1" />
      <circle cx="0" cy="0" r="3" fill="black" />
    </g>
  </svg>
);

const DadHammock = () => (
  <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
    <path d="M20 100 L20 0 L10 0 L0 100 Z" fill="#5D4037" />
    <circle cx="15" cy="10" r="25" fill="#4CAF50" opacity="0.9" />
    <path d="M180 100 L180 0 L190 0 L200 100 Z" fill="#5D4037" />
    <circle cx="185" cy="10" r="25" fill="#4CAF50" opacity="0.9" />
    <line x1="20" y1="40" x2="40" y2="50" stroke="#FFF8E1" strokeWidth="3" />
    <line x1="180" y1="40" x2="160" y2="50" stroke="#FFF8E1" strokeWidth="3" />
    <path d="M40 50 Q100 110 160 50" fill="#FFF8E1" stroke="#FFECB3" strokeWidth="2" />
    <g transform="translate(80, 70) rotate(-5)">
      <rect x="0" y="0" width="40" height="15" fill="#78C800" rx="5" />
      <rect x="40" y="0" width="30" height="15" fill="#003366" rx="5" />
      <g transform="translate(-10, -5)">
        <circle cx="10" cy="10" r="10" fill="#F5CBA7" />
        <path d="M0 5 C0 -5 20 -5 20 5" fill="#4E342E" />
        <path d="M0 10 Q10 25 20 10" fill="#4E342E" />
      </g>
      <g transform="translate(20, -30)">
        <path d="M0 0 Q10 -10 20 0 Q30 -10 40 0 Q20 20 0 0" fill="white" stroke="#ccc" strokeWidth="1" />
        <text x="10" y="5" fontSize="14" fill="#003366" fontWeight="bold">Zzz</text>
      </g>
    </g>
  </svg>
);

const Plant = ({ stage }: { stage: number }) => {
  const scale = 1 + (stage * 0.2);
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" className="overflow-visible">
      <g transform={`scale(${scale}) translate(${30 - (30 * scale)}, ${80 - (80 * scale)})`}>
        <path d="M20 80 L40 80 L35 60 L25 60 Z" fill="#8B4513" />
        {stage < 4 ? (
          <path d="M30 60 L30 40" stroke="#228B22" strokeWidth="2" />
        ) : (
          <rect x="28" y="30" width="4" height="30" fill="#8B4513" />
        )}
        <circle cx="30" cy={stage < 4 ? 40 : 30} r={5 + stage * 2} fill="#228B22" />
      </g>
    </svg>
  );
};

// --- APP ---

function App() {
  const [gameState, setGameState] = useState<'map' | 'game' | 'celebration'>('map');
  const [currentMapLevel, setCurrentMapLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentExercises, setCurrentExercises] = useState<WordData[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [waterFalling, setWaterFalling] = useState(false);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text.toLowerCase());
    u.lang = 'pt-BR';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const speakSlowly = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.toLowerCase());
    u.lang = 'pt-BR';
    u.rate = 0.4;
    window.speechSynthesis.speak(u);
  };

  const startLevel = (mapLevelIndex: number) => {
    if (mapLevelIndex > currentMapLevel) return;
    const node = MAP_NODES[mapLevelIndex];
    const curriculumLevel = CURRICULUM.find(c => c.id === node.curriculumId) || CURRICULUM[0];
    const wordsPool = [...curriculumLevel.words];
    const pickedWords: WordData[] = [];
    for (let i = 0; i < 8; i++) {
      if (wordsPool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * wordsPool.length);
      pickedWords.push(wordsPool[randomIndex]);
    }
    setCurrentExercises(pickedWords);
    setCurrentExerciseIndex(0);
    setupExercise(pickedWords[0], 0);
    setGameState('game');
  };

  const setupExercise = (wordData: WordData, index: number) => {
    setSelectedSyllables([]);
    setProgress(0);
    setWaterFalling(false);
    let options = [...wordData.syllables];
    if (index >= 2) {
      const numDistractors = index < 5 ? 2 : 3;
      const allSyllables = currentExercises.flatMap(w => w.syllables);
      for (let i = 0; i < numDistractors; i++) {
        const randomSyl = allSyllables[Math.floor(Math.random() * allSyllables.length)];
        if (!options.includes(randomSyl)) options.push(randomSyl);
      }
    }
    options.sort(() => Math.random() - 0.5);
    setShuffledOptions(options);
    setTimeout(() => { speak(wordData.word); }, 800);
  };

  const handleSyllableClick = (syllable: string) => {
    speak(syllable);
    playSound('pop');
    const currentWord = currentExercises[currentExerciseIndex];
    const newSelected = [...selectedSyllables, syllable];
    setSelectedSyllables(newSelected);
    const expectedSyllable = currentWord.syllables[newSelected.length - 1];
    if (syllable !== expectedSyllable) {
      playSound('error');
      setTimeout(() => { setSelectedSyllables(prev => prev.slice(0, -1)); }, 500);
      return;
    }
    const newProgress = (newSelected.length / currentWord.syllables.length) * 100;
    setProgress(newProgress);
    if (newSelected.length === currentWord.syllables.length) {
      playSound('success');
      setTimeout(() => speak(currentWord.word), 500);
      setTimeout(() => { finishWord(); }, 1500);
    }
  };

  const finishWord = () => {
    setWaterFalling(true);
    playSound('water');
    setTimeout(() => {
      setWaterFalling(false);
      if (currentExerciseIndex < currentExercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setupExercise(currentExercises[nextIndex], nextIndex);
      } else {
        setGameState('celebration');
        playSound('celebration');
      }
    }, 2000);
  };

  const closeCelebration = () => {
    setStreak(prev => prev + 1);
    setCurrentMapLevel(prev => Math.min(prev + 1, MAP_NODES.length - 1));
    setGameState('map');
  };

  const MapScreen = () => (
    <div className="flex flex-col items-center min-h-screen bg-[#87CEEB] pb-20 relative overflow-hidden">
      <div className="w-full p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-orange-600 text-xl">{streak} Dias</span>
        </div>
        <div className="text-xl font-bold text-white drop-shadow-md">Jardim das Sílabas</div>
      </div>
      <div className="fixed bottom-4 left-4 z-20"><PinkHouse /></div>
      <div className="fixed bottom-4 right-4 z-20"><Plant stage={Math.min(Math.floor(streak / 10), 4)} /></div>
      <div className="relative w-full max-w-md mt-32 flex flex-col items-center gap-8">
        <svg className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none" preserveAspectRatio="none">
          <path d="M180 50 Q 250 150 180 250 T 180 450 T 180 650" stroke="white" strokeWidth="40" strokeLinecap="round" fill="none" opacity="0.5" strokeDasharray="20 20" />
        </svg>
        <div className="absolute top-[10%] left-10 animate-bounce-slow"><DadHammock /></div>
        <div className="absolute top-[40%] right-10"><DadSoccer /></div>
        <div className="absolute bottom-[10%] left-20"><DadPainting /></div>
        {MAP_NODES.map((node, index) => {
          const isActive = index === currentMapLevel;
          const isLocked = index > currentMapLevel;
          const isCompleted = index < currentMapLevel;
          const offset = Math.sin(index) * 60;
          return (
            <div key={node.id} className="relative" style={{ transform: `translateX(${offset}px)` }}>
              <button
                onClick={() => startLevel(index)}
                disabled={isLocked}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all ${isLocked ? 'bg-gray-300' : isCompleted ? 'bg-yellow-400' : 'bg-green-500 animate-pulse'}`}
              >
                {isLocked ? <Lock className="text-gray-500" /> : isCompleted ? <Check className="text-white w-10 h-10" /> : node.icon}
              </button>
              {isActive && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-500 ease-in-out">
                  <GirlAvatar streak={streak} isJumping={true} />
                </div>
              )}
            </div>
          );
        })}
        <div className="h-40"></div>
      </div>
    </div>
  );

  const GameScreen = () => {
    const currentWord = currentExercises[currentExerciseIndex];
    if (!currentWord) return <div className="h-screen flex items-center justify-center">Carregando...</div>;
    const wateringAngle = -50 * (progress / 100);
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex justify-between items-end p-6 h-1/3 bg-blue-50 relative">
          <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-sm font-bold text-blue-500">
            {currentExerciseIndex + 1} / {currentExercises.length}
          </div>
          <div className="absolute bottom-4 right-8"><Plant stage={Math.min(Math.floor(streak / 10), 4)} /></div>
          <div
            onClick={() => speakSlowly(currentWord.word)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-slow cursor-pointer hover:scale-110 transition-transform active:scale-95"
          >
            <span className="text-8xl filter drop-shadow-lg select-none">{currentWord.emoji}</span>
          </div>
          <div className="absolute top-8 right-12 transition-transform duration-700 ease-out origin-top-right" style={{ transform: `rotate(${wateringAngle}deg)` }}>
            <div className="relative">
              <span className="text-6xl">🚿</span>
              {waterFalling && (
                <div className="absolute top-10 left-0 flex flex-col gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
          <h2 className="text-2xl font-bold text-gray-700">O que é isso?</h2>
          <div className="flex gap-3 min-h-[100px] items-center p-6 bg-blue-50/50 rounded-3xl w-full max-w-lg justify-center border-2 border-dashed border-blue-200">
            {currentWord.syllables.map((_, i) => {
              const isFilled = i < selectedSyllables.length;
              return (
                <div key={i} className={`w-20 h-20 flex items-center justify-center rounded-2xl transition-all duration-300 ${isFilled ? 'bg-white shadow-[0_4px_0_#bfdbfe] border-2 border-blue-100 text-3xl font-bold text-blue-600 animate-in zoom-in' : 'bg-white/50 border-2 border-dashed border-blue-300 shadow-inner'}`}>
                  {isFilled ? selectedSyllables[i] : ''}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {shuffledOptions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSyllableClick(s)}
                className="bg-white hover:bg-gray-50 px-8 py-4 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 border-2 border-gray-100 font-bold text-xl text-gray-700 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const CelebrationScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-300 gap-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-bold text-orange-600 text-center">Parabéns Filha!</h1>
      <div className="relative"><DadAvatar isAnimating={true} /></div>
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center">
        <p className="text-xl font-medium text-gray-700">"Papai tem orgulho de você!"</p>
      </div>
      <button
        onClick={closeCelebration}
        className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_6px_0_#15803d] active:shadow-none active:translate-y-1 transition-all text-xl flex items-center gap-2"
      >
        Continuar <ArrowRight />
      </button>
    </div>
  );

  return (
    <div className="font-sans text-gray-800 select-none">
      {gameState === 'map' && <MapScreen />}
      {gameState === 'game' && <GameScreen />}
      {gameState === 'celebration' && <CelebrationScreen />}
    </div>
  );
}

export default App;
