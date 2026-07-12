import { ArrowRight, Star } from 'lucide-react';
import { CHARS, type Section } from '../game/config';

type CelebrationScreenProps = {
  currentMapLevel: number;
  section: Section;
  onContinue: () => void;
};

const MESSAGES = [
  'Papai tá muito orgulhoso!',
  'Que filha inteligente!',
  'Você é demais!',
  'Continuamos juntos!',
  'Papai te ama!',
];

const CONFETTI_COLORS = ['#FF69B4', '#7C3AED', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#58CC02', '#CE82FF'];
const CONFETTI = Array.from({ length: 20 }, (_, index) => ({
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  width: 6 + ((index * 7) % 9),
  left: (index * 37) % 100,
  top: (index * 23) % 65,
  duration: 2 + ((index * 11) % 30) / 10,
  delay: ((index * 13) % 20) / 10,
}));

export function CelebrationScreen({ currentMapLevel, section, onContinue }: CelebrationScreenProps) {
  const message = MESSAGES[currentMapLevel % MESSAGES.length];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${section.bgLight}, #fff, ${section.bgLight})` }}
    >
      {CONFETTI.map((item, index) => (
        <div
          key={index}
          className="absolute rounded-full pointer-events-none"
          aria-hidden="true"
          style={{
            width: `${item.width}px`, height: `${item.width}px`, left: `${item.left}%`, top: `${item.top}%`,
            backgroundColor: item.color, opacity: 0.6,
            animation: `confetti ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        />
      ))}

      <h1 className="text-3xl font-extrabold text-center z-10" style={{ color: section.accentDark }}>Parabéns! 🎉</h1>

      <div className="relative z-10">
        <div
          className="w-60 h-60 rounded-[28px] overflow-hidden bg-white"
          style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.12), 0 0 0 4px white, 0 0 0 8px ${section.accent}30` }}
        >
          <img src={CHARS.paiFilhaCelebrando} alt="Celebrando juntos" draggable={false} className="w-full h-full object-cover select-none pointer-events-none" />
        </div>
        <div className="absolute -top-3 -right-3 rounded-full p-2 shadow-lg" style={{ background: '#FFC800', animation: 'bob 1.5s ease-in-out infinite' }}>
          <Star className="text-white fill-white w-5 h-5" aria-hidden="true" />
        </div>
        <div className="absolute -bottom-3 -left-3 rounded-full p-2 shadow-lg" style={{ background: section.accent, animation: 'bob 1.5s ease-in-out 0.3s infinite' }}>
          <Star className="text-white fill-white w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-white/90 p-4 rounded-2xl shadow-lg max-w-xs text-center z-10">
        <p className="text-lg font-bold" style={{ color: section.accentDark }}>{message}</p>
        <div className="flex justify-center gap-1 mt-2" aria-hidden="true">
          {[0, 1, 2].map(index => (
            <Star key={index} className="text-yellow-400 fill-yellow-400 w-6 h-6" style={{ animation: `bob 1.5s ease-in-out ${index * 0.15}s infinite` }} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="z-10 text-white font-bold py-4 px-10 rounded-full text-xl flex items-center gap-2 active:scale-95 transition-all"
        style={{ background: section.accent, boxShadow: `0 5px 0 ${section.accentDark}` }}
      >
        Continuar <ArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}
