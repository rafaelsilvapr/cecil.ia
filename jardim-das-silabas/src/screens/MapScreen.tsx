import { useEffect, useRef } from 'react';
import { Check, Lock, Sparkles, Star } from 'lucide-react';
import { CHARS, growthForLevel, MAP_NODES, SECTIONS } from '../game/config';
import { Plant } from '../game/garden';

type MapScreenProps = {
  currentMapLevel: number;
  streak: number;
  onStartLevel: (levelIndex: number) => void;
  updateAvailable: boolean;
  onUpdate: () => void;
};

const TreeSvg = ({ color = '#58CC02' }: { color?: string }) => (
  <svg width="32" height="44" viewBox="0 0 32 44" fill="none" aria-hidden="true">
    <rect x="13" y="28" width="6" height="16" rx="2" fill="#8B6914" />
    <ellipse cx="16" cy="18" rx="14" ry="16" fill={color} />
    <ellipse cx="16" cy="14" rx="10" ry="12" fill={color} opacity="0.7" />
  </svg>
);

const FlowerSvg = ({ color = '#FF86D0' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill={color} />
    <circle cx="8" cy="12" r="4" fill={color} />
    <circle cx="16" cy="12" r="4" fill={color} />
    <circle cx="12" cy="16" r="4" fill={color} />
    <circle cx="12" cy="12" r="3" fill="#FFC800" />
  </svg>
);

const BushSvg = ({ color = '#58CC02' }: { color?: string }) => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden="true">
    <ellipse cx="12" cy="16" rx="12" ry="10" fill={color} opacity="0.8" />
    <ellipse cx="24" cy="12" rx="14" ry="12" fill={color} />
    <ellipse cx="36" cy="16" rx="12" ry="10" fill={color} opacity="0.8" />
  </svg>
);

const getOffset = (localIndex: number) => {
  const positions = [0, 30, 48, 30, 0, -30, -48, -30, 0, 30];
  return positions[localIndex % positions.length];
};

export function MapScreen({ currentMapLevel, streak, onStartLevel, updateAvailable, onUpdate }: MapScreenProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <div className="w-full px-5 py-3 flex justify-between items-center sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-1.5" aria-label={`${streak} atividades concluídas`}>
          <span className="text-xl" aria-hidden="true">🔥</span>
          <span className="font-extrabold text-orange-500 text-lg">{streak}</span>
        </div>
        <div className="font-extrabold text-gray-700 tracking-tight text-base">Jardim das Sílabas</div>
        {/* A planta fica no cabeçalho fixo porque é o único lugar que ela vê o
            tempo todo. É o estado dela no jogo, não um enfeite. */}
        <div
          className="w-14 flex justify-end items-end"
          role="img"
          aria-label={`Sua plantinha depois de ${currentMapLevel} fases`}
        >
          <Plant growth={growthForLevel(currentMapLevel)} height={54} />
        </div>
      </div>

      {updateAvailable && (
        <div className="px-5 pt-4 pb-1 bg-white">
          <button
            type="button"
            onClick={onUpdate}
            aria-label="Tem novidade no jogo. Tocar para atualizar."
            className="w-full flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-white font-extrabold text-lg transition-all active:translate-y-[2px] active:shadow-none"
            style={{ background: '#CE82FF', boxShadow: '0 5px 0 #a855f7' }}
          >
            <Sparkles className="w-6 h-6 fill-white" aria-hidden="true" />
            Tem novidade! Toque aqui
          </button>
        </div>
      )}

      {SECTIONS.map(section => {
        const nodes = MAP_NODES.slice(section.range[0], section.range[1] + 1);
        const reached = currentMapLevel >= section.range[0];
        const completed = currentMapLevel > section.range[1];

        return (
          <section key={section.title} style={{ background: section.bgLight }}>
            <div className="pt-8 pb-5 px-6">
              <div
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: reached ? section.bg : '#e5e7eb', opacity: reached ? 1 : 0.5 }}
              >
                <span className="text-3xl" aria-hidden="true">{section.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-extrabold text-white text-lg leading-tight">{section.title}</h2>
                  <div className="text-white/80 text-sm font-medium">{section.subtitle}</div>
                </div>
                {completed && (
                  <div className="bg-white/30 rounded-full p-1.5" aria-label="Seção concluída">
                    <Check className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pb-10 relative">
              {nodes.map((node, localIndex) => {
                const globalIndex = section.range[0] + localIndex;
                const isActive = globalIndex === currentMapLevel;
                const isDone = globalIndex < currentMapLevel;
                const isLocked = globalIndex > currentMapLevel;
                const offset = getOffset(localIndex);
                const status = isDone ? 'concluída' : isActive ? 'atual' : 'bloqueada';

                return (
                  <div
                    key={node.id}
                    ref={isActive ? activeRef : undefined}
                    // A Cecília fica 68px acima do nó atual; sem essa folga ela
                    // encavala no nó anterior.
                    className={`relative ${isActive ? 'mt-16' : ''}`}
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {localIndex === 2 && (
                      <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-40">
                        <TreeSvg color={section.accent} />
                      </div>
                    )}
                    {localIndex === 6 && (
                      <div className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-40">
                        <BushSvg color={section.accent} />
                      </div>
                    )}
                    {localIndex === 4 && (
                      <div className="absolute -left-14 top-1/2 -translate-y-1/2 opacity-50">
                        <FlowerSvg color={section.accent} />
                      </div>
                    )}

                    {isActive && (
                      <div className="absolute -top-[68px] left-1/2 -translate-x-1/2 z-20">
                        <div style={{ animation: 'bob 2s ease-in-out infinite' }}>
                          <div
                            className="w-12 h-12 rounded-full overflow-hidden bg-white"
                            style={{ boxShadow: `0 3px 10px rgba(0,0,0,0.15), 0 0 0 3px white, 0 0 0 5px ${section.accent}` }}
                          >
                            <img
                              src={CHARS.filhaRegando}
                              alt="Cecília"
                              draggable={false}
                              className="w-full h-full object-cover select-none pointer-events-none"
                              style={{ transform: 'scale(2.2)', objectPosition: 'center 18%' }}
                            />
                          </div>
                          <div className="flex justify-center mt-[-1px]" aria-hidden="true">
                            <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${section.accent}` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onStartLevel(globalIndex)}
                      disabled={isLocked}
                      aria-label={`Fase ${globalIndex + 1} — ${status}`}
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
                      style={
                        isDone
                          ? { background: section.accent, boxShadow: `0 5px 0 ${section.accentDark}` }
                          : isActive
                            ? { background: section.accent, boxShadow: `0 5px 0 ${section.accentDark}, 0 0 20px ${section.accent}50`, transform: 'scale(1.1)' }
                            : { background: '#e5e7eb', boxShadow: '0 5px 0 #d1d5db' }
                      }
                    >
                      {isDone && <Check className="text-white w-7 h-7 stroke-[3]" aria-hidden="true" />}
                      {isActive && <Star className="text-white fill-white w-7 h-7" aria-hidden="true" />}
                      {isLocked && <Lock className="text-gray-400 w-5 h-5" aria-hidden="true" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="h-20 bg-gray-100" />
    </div>
  );
}
