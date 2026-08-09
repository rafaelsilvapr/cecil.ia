import { Volume2 } from 'lucide-react';
import type { WordData } from '../data/curriculum';
import type { Caregiver, Section } from '../game/config';

type GameScreenProps = {
  currentExercise?: WordData;
  currentExerciseIndex: number;
  exerciseCount: number;
  shuffledOptions: string[];
  selectedSyllables: string[];
  progress: number;
  wateringCanFill: number;
  section: Section;
  caregiver: Caregiver;
  onSyllableClick: (syllable: string) => void;
  onListen: (word: string) => void;
};

// A fala pertence a quem está na foto, e a foto alterna entre mamãe e papai a
// cada exercício. Por isso nenhuma mensagem fixa cita um dos dois pelo nome.
const messagesFor = (caregiver: Caregiver) => [
  'Você consegue!', 'Vamos lá!', 'Que legal!', 'Muito bem!',
  `${caregiver.label} tá aqui!`, 'Foco!', 'Linda demais!', 'Arrasou!',
];

export function GameScreen({
  currentExercise,
  currentExerciseIndex,
  exerciseCount,
  shuffledOptions,
  selectedSyllables,
  progress,
  wateringCanFill,
  section,
  caregiver,
  onSyllableClick,
  onListen,
}: GameScreenProps) {
  if (!currentExercise) {
    return <div className="h-screen flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  const messages = messagesFor(caregiver);
  const message = messages[currentExerciseIndex % messages.length];

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="px-4 pt-5 pb-3" style={{ background: section.bgLight }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full text-sm font-extrabold text-white" style={{ background: section.accent }}>
            {currentExerciseIndex + 1}/{exerciseCount}
          </div>
          <div className="flex-1 h-3 bg-white/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${wateringCanFill}%`, background: section.accent }} />
          </div>
          <span className="text-lg" aria-hidden="true">🌱</span>
        </div>

        <div className="flex items-end justify-center gap-5 pb-3">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.1)' }}>
              <img
                key={caregiver.key}
                src={caregiver.avatarImg}
                alt={caregiver.avatarAlt}
                draggable={false}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{ transform: `scale(${caregiver.avatarScale})`, objectPosition: caregiver.avatarPosition }}
              />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-xl px-2.5 py-1 shadow-md whitespace-nowrap font-bold" style={{ fontSize: '11px', color: section.accentDark }}>
              {message}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onListen(currentExercise.word)}
            aria-label={`Ouvir ${currentExercise.word}`}
            className="flex flex-col items-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="text-7xl drop-shadow-md select-none" aria-hidden="true">{currentExercise.emoji}</span>
            <span className="flex items-center gap-1 mt-1 opacity-60">
              <Volume2 size={12} aria-hidden="true" />
              <span className="text-xs font-medium">Ouvir</span>
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        <h1 className="text-xl font-bold text-gray-700">Monte a palavra!</h1>

        <div className="flex gap-2.5 min-h-[80px] items-center p-3 rounded-2xl w-full max-w-lg justify-center bg-gray-50 border-2 border-dashed border-gray-200" aria-live="polite">
          {currentExercise.syllables.map((_, index) => {
            const filled = index < selectedSyllables.length;
            return (
              <div
                key={index}
                className={`w-[88px] h-[88px] flex items-center justify-center rounded-xl transition-all duration-300 text-3xl font-bold ${
                  filled ? 'bg-white scale-105' : 'bg-gray-100 border-2 border-dashed border-gray-300'
                }`}
                style={filled ? { boxShadow: `0 3px 0 ${section.accent}40`, color: section.accentDark } : {}}
              >
                {filled ? selectedSyllables[index] : ''}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3.5 justify-center">
          {shuffledOptions.map((syllable, index) => (
            <button
              key={`${syllable}-${index}`}
              type="button"
              onClick={() => onSyllableClick(syllable)}
              aria-label={`Sílaba ${syllable}`}
              className="bg-white min-w-[96px] px-7 py-5 rounded-2xl font-bold text-2xl text-gray-700 transition-all active:translate-y-[3px] active:shadow-none border-2 border-gray-100"
              style={{ boxShadow: '0 4px 0 #e5e7eb' }}
            >
              {syllable}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-6">
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: section.accent }} />
        </div>
      </div>
    </div>
  );
}
