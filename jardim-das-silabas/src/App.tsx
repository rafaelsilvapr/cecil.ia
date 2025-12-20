import { useState } from 'react';
import { Star, Lock, Check, ArrowRight, Smile } from 'lucide-react';
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
const MAP_NODES = Array.from({ length: 60 }, (_, i) => {
  // Distribute 6 curriculum levels across 60 nodes (approx 10 nodes per level)
  const curriculumLevelIndex = Math.min(Math.floor(i / 10), CURRICULUM.length - 1);
  const curriculumLevel = CURRICULUM[curriculumLevelIndex];
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
  <svg width="150" height="150" viewBox="0 0 150 150" className="overflow-visible">
    {/* Background Goal Net (Simplified) */}
    <g transform="translate(100, 60)" opacity="0.4">
      <path d="M0 0 L40 0 L40 40 L0 40 Z" stroke="black" fill="none" />
      <path d="M5 0 L5 40 M10 0 L10 40 M15 0 L15 40 M20 0 L20 40 M25 0 L25 40 M30 0 L30 40 M35 0 L35 40" stroke="black" strokeWidth="0.5" />
      <path d="M0 5 L40 5 M0 10 L40 10 M0 15 L40 15 M0 20 L40 20 M0 25 L40 25 M0 30 L40 30 M0 35 L40 35" stroke="black" strokeWidth="0.5" />
    </g>

    {/* Dad Body */}
    <g transform="translate(60, 40)">
      {/* Head */}
      <circle cx="0" cy="0" r="14" fill="#F5CBA7" />
      {/* Curly Hair */}
      <path d="M-14 -5 C-18 -15 -10 -22 0 -22 C10 -22 18 -15 14 -5" fill="#4E342E" />
      <circle cx="-14" cy="-5" r="5" fill="#4E342E" />
      <circle cx="14" cy="-5" r="5" fill="#4E342E" />
      <circle cx="0" cy="-20" r="6" fill="#4E342E" />

      {/* Glasses */}
      <g stroke="black" strokeWidth="1.5" fill="none">
        <circle cx="-6" cy="-2" r="5" />
        <circle cx="6" cy="-2" r="5" />
        <line x1="-1" y1="-2" x2="1" y2="-2" />
        <line x1="-11" y1="-2" x2="-14" y2="-4" /> {/* temples */}
        <line x1="11" y1="-2" x2="14" y2="-4" />
      </g>

      {/* Beard */}
      <path d="M-14 -5 Q-16 10 -5 18 Q0 20 5 18 Q16 10 14 -5 L14 0 Q10 10 5 10 Q0 10 -5 10 Q-10 10 -14 0 Z" fill="#4E342E" />

      {/* Jersey (Yellow/Blue Stripes) */}
      <g transform="translate(-20, 15)">
        <path d="M0 0 L40 0 L40 50 L0 50 Z" fill="#FFD700" /> {/* Yellow Base */}
        <rect x="10" y="0" width="6" height="50" fill="#003366" />
        <rect x="24" y="0" width="6" height="50" fill="#003366" />
        <path d="M0 0 L-10 20" stroke="#F5CBA7" strokeWidth="8" strokeLinecap="round" /> {/* Arm Left */}
        <path d="M40 0 L50 20" stroke="#F5CBA7" strokeWidth="8" strokeLinecap="round" /> {/* Arm Right */}
      </g>

      {/* Shorts */}
      <rect x="-20" y="65" width="40" height="20" fill="#003366" />

      {/* Legs */}
      <path d="M-12 85 L-12 110" stroke="#F5CBA7" strokeWidth="8" strokeLinecap="round" />
      <path d="M12 85 L12 95" stroke="#F5CBA7" strokeWidth="8" strokeLinecap="round" /> {/* Leg on ball */}

      {/* Shoes */}
      <path d="M-18 110 L-8 110" stroke="#333" strokeWidth="8" strokeLinecap="round" />
      <path d="M8 95 L18 95" stroke="#333" strokeWidth="8" strokeLinecap="round" transform="rotate(-15, 12, 95)" />

      {/* Soccer Ball */}
      <g transform="translate(15, 110)">
        <circle cx="0" cy="0" r="12" fill="white" stroke="black" strokeWidth="1.5" />
        <path d="M-5 -2 L5 -2 L8 5 L0 10 L-8 5 Z" fill="black" />
        <path d="M-5 -2 L-8 -10" stroke="black" strokeWidth="1" />
        <path d="M5 -2 L8 -10" stroke="black" strokeWidth="1" />
      </g>
    </g>
  </svg>
);

const DadHammock = () => (
  <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible">
    {/* Left Tree */}
    <path d="M20 120 L20 20 L10 20 L0 120 Z" fill="#8B4513" />
    <circle cx="15" cy="20" r="30" fill="#4CAF50" />
    <circle cx="0" cy="30" r="20" fill="#4CAF50" />
    <circle cx="30" cy="10" r="20" fill="#4CAF50" />

    {/* Right Tree */}
    <path d="M200 120 L200 20 L210 20 L220 120 Z" fill="#8B4513" />
    <circle cx="205" cy="20" r="30" fill="#4CAF50" />
    <circle cx="220" cy="30" r="20" fill="#4CAF50" />
    <circle cx="190" cy="10" r="20" fill="#4CAF50" />

    {/* Hammock Ropes */}
    <line x1="20" y1="50" x2="50" y2="70" stroke="#FFF8E1" strokeWidth="3" />
    <line x1="200" y1="50" x2="170" y2="70" stroke="#FFF8E1" strokeWidth="3" />

    {/* Hammock Body */}
    <path d="M50 70 Q110 130 170 70" fill="#FFF8E1" stroke="#FFECB3" strokeWidth="2" />

    {/* Dad in Hammock */}
    <g transform="translate(90, 85) rotate(-5)">
      {/* Legs (Blue Jeans) */}
      <rect x="30" y="0" width="40" height="18" fill="#4682B4" rx="5" />
      {/* Shirt (Green) */}
      <rect x="-10" y="0" width="45" height="20" fill="#78C800" rx="5" />

      {/* Head */}
      <g transform="translate(-15, -8)">
        <circle cx="10" cy="10" r="12" fill="#F5CBA7" />
        {/* Beard */}
        <path d="M-2 10 Q0 22 10 24 Q20 22 22 10" fill="#4E342E" />
        {/* Hair */}
        <path d="M-2 10 C-2 -5 22 -5 22 10" fill="#4E342E" />
        {/* Glasses */}
        <g stroke="black" strokeWidth="1" fill="none">
          <circle cx="6" cy="10" r="4" />
          <circle cx="14" cy="10" r="4" />
          <line x1="10" y1="10" x2="10" y2="10" />
        </g>
      </g>

      {/* ZZZ Bubble */}
      <g transform="translate(30, -40)">
        <path d="M0 0 Q10 -15 30 -5 Q40 -15 50 0 Q30 25 0 0" fill="white" stroke="#ccc" strokeWidth="1" />
        <text x="15" y="5" fontSize="16" fill="#003366" fontWeight="bold">Zzz</text>
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
  // Track recently played words to avoid repetition
  const [recentlyPlayedWords, setRecentlyPlayedWords] = useState<string[]>([]);
  // State for filling the watering can (0-100% across the whole level)
  const [wateringCanFill, setWateringCanFill] = useState(0);

  // Helper to identify "Complex" words (NH, LH, CH, RR, SS, meetings, etc.)
  const isComplexWord = (wordData: WordData) => {
    const complexSyllables = ['NHA', 'NHO', 'NHE', 'NHI', 'NHU', 'LHA', 'LHO', 'LHE', 'LHI', 'LHU', 'CHA', 'CHO', 'CHE', 'CHI', 'CHU', 'RR', 'SS', 'Ç', 'TR', 'BR', 'CR', 'FR', 'GR', 'PR', 'VR', 'CL', 'BL', 'FL', 'GL', 'PL', 'TL'];
    return wordData.syllables.some(s => complexSyllables.some(cs => s.includes(cs)));
  };

  const startLevel = (mapLevelIndex: number) => {
    if (mapLevelIndex > currentMapLevel) return;
    const node = MAP_NODES[mapLevelIndex];
    const curriculumLevel = CURRICULUM.find(c => c.id === node.curriculumId) || CURRICULUM[0];

    let pickedWords: WordData[] = [];
    const usedInThisStage = new Set<string>();

    const getRandomWord = (pool: WordData[], filter: (w: WordData) => boolean, count: number) => {
      const candidates = pool.filter(w =>
        filter(w) &&
        !recentlyPlayedWords.includes(w.word) &&
        !usedInThisStage.has(w.word)
      );
      // Fallback if filter is too strict or history too long
      const finalPool = candidates.length >= count ? candidates : pool.filter(w => !usedInThisStage.has(w.word));

      for (let i = 0; i < count; i++) {
        if (finalPool.length === 0) break;
        const idx = Math.floor(Math.random() * finalPool.length);
        const picked = finalPool.splice(idx, 1)[0];
        pickedWords.push(picked);
        usedInThisStage.add(picked.word);
      }
    };

    // 1. First 2 words are ALWAYS easy (Motivation boost)
    const easyPool = CURRICULUM.find(l => l.id === 'nivel-1')?.words || curriculumLevel.words;
    getRandomWord(easyPool, (w) => !isComplexWord(w), 2);

    // 2. Complex Syllable Quota (3 to 6 words depending on map progress)
    // Level 0-10: 3 complex, Level 10-30: 4 complex, Level 30-60: 5-6 complex
    const complexQuota = mapLevelIndex < 10 ? 3 : mapLevelIndex < 30 ? 4 : mapLevelIndex < 50 ? 5 : 6;
    const complexPool = CURRICULUM.flatMap(l => l.words).filter(w => isComplexWord(w));
    getRandomWord(complexPool, () => true, complexQuota);

    // 3. Fill the rest to reach 8 total words
    const remainingCount = 8 - pickedWords.length;
    if (remainingCount > 0) {
      getRandomWord(curriculumLevel.words, () => true, remainingCount);
    }

    // Shuffle the non-intro words (keep first 2 as easy)
    const intro = pickedWords.slice(0, 2);
    const rest = pickedWords.slice(2);
    rest.sort(() => Math.random() - 0.5);
    pickedWords = [...intro, ...rest];

    setCurrentExercises(pickedWords);
    setCurrentExerciseIndex(0);
    setWateringCanFill(0);
    setupExercise(pickedWords[0], 0);
    setGameState('game');
  };

  const setupExercise = (wordData: WordData, index: number) => {
    setSelectedSyllables([]);
    setProgress(0);
    // setWaterFalling(false); // No longer resetting pouring here
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
    // Increment watering can fill
    // We have 8 exercises. Each one fills 12.5%? Or just fill it up.
    // Let's say it fills up completely over the 8 exercises.
    setWateringCanFill(prev => Math.min(prev + (100 / currentExercises.length), 100));

    // playSound('water'); // Maybe a small "glug" sound instead of full water?

    setTimeout(() => {
      if (currentExerciseIndex < currentExercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setupExercise(currentExercises[nextIndex], nextIndex);
      } else {
        // Level Complete - just go to celebration screen where the watering happens
        setTimeout(() => {
          setGameState('celebration');
          playSound('celebration');
        }, 1000);
      }
    }, 1000);
  };

  const closeCelebration = () => {
    // Add words from this level to history
    const playedWords = currentExercises.map(e => e.word);
    setRecentlyPlayedWords(prev => {
      const newHistory = [...playedWords, ...prev];
      return newHistory.slice(0, 40); // Keep last 40 words in history
    });

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

  // Updated Watering Can SVG Component with Fill Level
  const WateringCan = ({ fillPercent, isPouring }: { fillPercent: number; isPouring: boolean }) => (
    <div className="relative">
      <svg width="100" height="80" viewBox="0 0 100 80" className="overflow-visible">
        <defs>
          <clipPath id="canClip">
            <path d="M20 20 L80 20 L85 70 L15 70 Z" />
          </clipPath>
        </defs>

        {/* Handle */}
        <path d="M20 30 C 0 30, 0 60, 20 60" stroke="#999" strokeWidth="6" fill="none" />
        {/* Spout */}
        <path d="M80 30 L100 10" stroke="#999" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="10" r="3" fill="#999" />

        {/* Can Body Background */}
        <path d="M20 20 L80 20 L85 70 L15 70 Z" fill="#eee" stroke="#999" strokeWidth="2" />

        {/* Water Level inside Can */}
        <g clipPath="url(#canClip)">
          <rect
            x="0"
            y={70 - (50 * (fillPercent / 100))}
            width="100"
            height="80"
            fill="#3B82F6"
            className="transition-all duration-1000 ease-out"
          />
        </g>

        {/* Water Pouring Animation - Only shown if explicitly pouring (used in Celebration) */}
        {/* Note: In GameScreen we don't pour anymore, but keeping this for component completeness if reused */}
        {isPouring && (
          <g transform="translate(100, 10)">
            <line x1="0" y1="0" x2="0" y2="100" stroke="#3B82F6" strokeWidth="4" strokeDasharray="5 5" className="animate-pulse" />
            <path d="M-10 100 Q0 110 10 100" fill="#3B82F6" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );

  const GameScreen = () => {
    const currentWord = currentExercises[currentExerciseIndex];
    if (!currentWord) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

    // Can stays upright in GameScreen
    const wateringAngle = 0;

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

          <div
            className="absolute top-8 right-12 transition-transform duration-700 ease-out origin-top-right"
            style={{ transform: `rotate(${wateringAngle}deg)` }}
          >
            {/* In GameScreen, never pouring */}
            <WateringCan fillPercent={wateringCanFill} isPouring={false} />
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

  // New component for the Celebration Screen
  const GirlWateringPlant = () => (
    <svg width="300" height="250" viewBox="0 0 300 250" className="overflow-visible">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feFlood floodColor="rgba(0,0,0,0.2)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground/Grass */}
      <ellipse cx="150" cy="230" rx="120" ry="20" fill="#4ADE80" opacity="0.5" />

      {/* The Girl (Scaled and positioned left) */}
      <g transform="translate(40, 60) scale(1.2)">
        {/* Legs */}
        <path d="M60 95 L60 125" stroke="#4682B4" strokeWidth="14" strokeLinecap="round" />
        <path d="M80 95 L80 125" stroke="#4682B4" strokeWidth="14" strokeLinecap="round" />
        <path d="M55 128 L65 128" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        <path d="M75 128 L85 128" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />

        {/* Body */}
        <path d="M50 95 L90 95 L85 65 L55 65 Z" fill="#FF69B4" />

        {/* Head */}
        <g transform="translate(0, -5)">
          <circle cx="70" cy="50" r="24" fill="#D9A084" />
          <path d="M46 50 C46 20 94 20 94 50 L96 70 Q96 80 85 75 L85 50" fill="#1a1a1a" />
          <path d="M46 50 L44 70 Q44 80 55 75 L55 50" fill="#1a1a1a" />
          <path d="M46 50 Q70 15 94 50" fill="#1a1a1a" />
          <path d="M52 35 Q70 32 88 35 L88 48 Q70 45 52 48 Z" fill="#1a1a1a" />
          {/* Face */}
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

        {/* Arms (holding the can) */}
        <path d="M85 70 Q100 80 110 70" stroke="#D9A084" strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>

      {/* The Plant (Big and Lush) on the right */}
      <g transform="translate(180, 150) scale(1.5)">
        <path d="M20 50 L40 50 L35 30 L25 30 Z" fill="#8B4513" /> {/* Pot */}
        <rect x="22" y="25" width="16" height="5" fill="#5D4037" /> {/* Pot Rim */}
        <path d="M30 30 L30 10" stroke="#228B22" strokeWidth="3" /> {/* Stem */}
        {/* Leaves */}
        <ellipse cx="20" cy="15" rx="8" ry="4" fill="#4ADE80" transform="rotate(-30, 20, 15)" />
        <ellipse cx="40" cy="15" rx="8" ry="4" fill="#4ADE80" transform="rotate(30, 40, 15)" />
        <ellipse cx="30" cy="5" rx="6" ry="10" fill="#228B22" />
        <circle cx="25" cy="20" r="2" fill="#FF69B4" /> {/* Flower bud */}
        <circle cx="35" cy="10" r="2" fill="#FF69B4" />
      </g>

      {/* The Watering Can (Tilted and Pouring) */}
      {/* CORRECTION: Rotate 30 deg (clockwise) to tilt spout DOWN. Adjust positions to align with hands and plant. */}
      <g transform="translate(130, 40) rotate(30)">
        <path d="M20 30 C 0 30, 0 60, 20 60" stroke="#999" strokeWidth="5" fill="none" />
        <path d="M80 30 L100 10" stroke="#999" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="10" r="3" fill="#999" />
        <path d="M20 20 L80 20 L85 70 L15 70 Z" fill="#eee" stroke="#999" strokeWidth="2" />
        <path d="M25 25 L75 25 L78 65 L22 65 Z" fill="#3B82F6" opacity="0.5" />
      </g>

      {/* Water Stream & Splashes - Adjusted for new spout position */}
      {/* With rotate(30), spout (originally approx 100,10) moves down and right.
          Geometric guess: it's roughly near (150, 90). */}
      <g transform="translate(210, 95)">
        <line x1="0" y1="0" x2="10" y2="60" stroke="#3B82F6" strokeWidth="4" strokeDasharray="5 5" className="animate-pulse" />
        <circle cx="5" cy="60" r="3" fill="#3B82F6" className="animate-bounce" style={{ animationDelay: '0.1s' }} />
        <circle cx="15" cy="65" r="2" fill="#3B82F6" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
        <path d="M-5 65 Q10 75 25 65" fill="none" stroke="#3B82F6" strokeWidth="2" className="animate-pulse" />
      </g>

    </svg>
  );

  const CelebrationScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-300 gap-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-bold text-orange-600 text-center drop-shadow-sm">Parabéns Filha!</h1>

      <div className="relative p-8 bg-white/50 rounded-full backdrop-blur-sm shadow-xl">
        <GirlWateringPlant />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center transform scale-110">
        <p className="text-xl font-medium text-gray-700">"Você cuidou muito bem da sua plantinha!"</p>
        <div className="flex justify-center gap-1 mt-2">
          <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 animate-bounce" style={{ animationDelay: '0s' }} />
          <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 animate-bounce" style={{ animationDelay: '0.1s' }} />
          <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      <button
        onClick={closeCelebration}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_6px_0_#15803d] active:shadow-none active:translate-y-1 transition-all text-xl flex items-center gap-2 hover:scale-105"
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
