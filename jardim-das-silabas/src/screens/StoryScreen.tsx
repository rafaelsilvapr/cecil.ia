import { ChevronRight } from 'lucide-react';
import type { Section } from '../game/config';

type StoryScreenProps = {
  section: Section;
  onContinue: () => void;
};

export function StoryScreen({ section, onContinue }: StoryScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6" style={{ background: section.bgLight }}>
      <div
        className="w-72 h-72 rounded-[32px] overflow-hidden"
        style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.12), 0 0 0 4px white, 0 0 0 8px ${section.accent}30` }}
      >
        <img src={section.storyImg} alt={section.storyAlt} draggable={false} className="w-full h-full object-cover select-none pointer-events-none" />
      </div>

      <div className="text-center max-w-xs">
        <div className="text-4xl mb-2" aria-hidden="true">{section.emoji}</div>
        <h1 className="text-3xl font-extrabold" style={{ color: section.accentDark }}>{section.title}</h1>
        <p className="text-gray-500 text-lg mt-1">{section.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="text-white font-bold py-4 px-10 rounded-full text-xl flex items-center gap-2 transition-all active:scale-95"
        style={{ background: section.accent, boxShadow: `0 5px 0 ${section.accentDark}` }}
      >
        Começar <ChevronRight className="w-6 h-6" aria-hidden="true" />
      </button>
    </div>
  );
}
