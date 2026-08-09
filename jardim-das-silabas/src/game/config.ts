import { CURRICULUM } from '../data/curriculum';

const BASE = import.meta.env.BASE_URL;

export const CHARS = {
  filhaRegando: `${BASE}characters/filha-regando.webp`,
  paiFilhaCelebrando: `${BASE}characters/pai-filha-celebrando.webp`,
  paiFilhaLivros: `${BASE}characters/pai-filha-livros.webp`,
  maeFilhaAbraco: `${BASE}characters/mae-filha-abraco.webp`,
  paiRede: `${BASE}characters/pai-rede.webp`,
} as const;

export type CaregiverKey = 'mae' | 'pai';

export type Caregiver = {
  key: CaregiverKey;
  label: string;
  /** Concordância: "Mamãe tá orgulhosa" / "Papai tá orgulhoso". */
  proud: string;
  avatarImg: string;
  avatarAlt: string;
  avatarScale: number;
  avatarPosition: string;
  celebrationImg: string;
  celebrationAlt: string;
  celebrationPosition: string;
};

export const CAREGIVERS: Record<CaregiverKey, Caregiver> = {
  mae: {
    key: 'mae',
    label: 'Mamãe',
    proud: 'orgulhosa',
    avatarImg: CHARS.maeFilhaAbraco,
    avatarAlt: 'Mamãe',
    // Enquadramento verificado no tablet: a arte da mãe é bem mais alta
    // (688x1552) que as do pai, então precisa de recorte próprio.
    avatarScale: 1.15,
    avatarPosition: 'center 47%',
    celebrationImg: CHARS.maeFilhaAbraco,
    celebrationAlt: 'Mamãe e Cecília comemorando',
    celebrationPosition: 'center 40%',
  },
  pai: {
    key: 'pai',
    label: 'Papai',
    proud: 'orgulhoso',
    avatarImg: CHARS.paiFilhaLivros,
    avatarAlt: 'Papai',
    avatarScale: 1.3,
    avatarPosition: 'center 30%',
    celebrationImg: CHARS.paiFilhaCelebrando,
    celebrationAlt: 'Papai e Cecília comemorando',
    celebrationPosition: 'center center',
  },
};

/**
 * Alternância estrita entre mamãe e papai.
 *
 * Regra de produto fixa: os dois têm presença equilibrada em toda tela do jogo.
 * Por isso a escolha é por paridade e não por sorteio — sorteio pode produzir
 * três aparições seguidas do mesmo responsável, e aqui isso tem custo real.
 * Com 8 exercícios por fase, a conta fecha em 4 e 4 dentro de cada fase.
 */
export const caregiverAt = (turn: number): Caregiver =>
  Math.abs(turn) % 2 === 0 ? CAREGIVERS.mae : CAREGIVERS.pai;

export type Section = {
  title: string;
  subtitle: string;
  emoji: string;
  bg: string;
  bgLight: string;
  accent: string;
  accentDark: string;
  storyImg: string;
  storyAlt: string;
  range: [number, number];
};

export const SECTIONS: Section[] = [
  {
    title: 'O Jardim', subtitle: 'Sílabas simples', emoji: '🌱',
    bg: '#58CC02', bgLight: '#d7ffb8', accent: '#58CC02', accentDark: '#46a302',
    storyImg: CHARS.filhaRegando, storyAlt: 'Cecília regando o jardim', range: [0, 9],
  },
  {
    title: 'A Leitura', subtitle: 'Juntando sílabas', emoji: '📚',
    bg: '#CE82FF', bgLight: '#f0e0ff', accent: '#CE82FF', accentDark: '#a855f7',
    storyImg: CHARS.maeFilhaAbraco, storyAlt: 'Mamãe e Cecília', range: [10, 19],
  },
  {
    title: 'O Carinho', subtitle: 'Palavras com afeto', emoji: '💝',
    bg: '#FF86D0', bgLight: '#ffe0f0', accent: '#FF86D0', accentDark: '#e056a0',
    storyImg: CHARS.paiFilhaLivros, storyAlt: 'Papai e Cecília lendo', range: [20, 29],
  },
  {
    title: 'O Descanso', subtitle: 'Sons compostos', emoji: '🌴',
    bg: '#FFC800', bgLight: '#fff4cc', accent: '#FFC800', accentDark: '#e0a800',
    // Sem uma segunda arte da mãe, esta seção repete o abraço para manter a
    // paridade de aparições. Trocar assim que houver arte nova dela.
    storyImg: CHARS.maeFilhaAbraco, storyAlt: 'Mamãe e Cecília', range: [30, 39],
  },
  {
    title: 'A Festa', subtitle: 'Sílabas complexas', emoji: '🎉',
    bg: '#1CB0F6', bgLight: '#d0f0ff', accent: '#1CB0F6', accentDark: '#0090d0',
    storyImg: CHARS.paiFilhaCelebrando, storyAlt: 'Família celebrando', range: [40, 49],
  },
  {
    title: 'O Florescer', subtitle: 'Leitura fluente', emoji: '🌺',
    bg: '#FF9600', bgLight: '#fff0d0', accent: '#FF9600', accentDark: '#d07000',
    storyImg: CHARS.filhaRegando, storyAlt: 'Cecília no jardim', range: [50, 59],
  },
];

export const MAP_NODES = Array.from({ length: 60 }, (_, index) => {
  const curriculumIndex = Math.min(Math.floor(index / 10), CURRICULUM.length - 1);
  return {
    id: index,
    curriculumId: CURRICULUM[curriculumIndex].id,
    title: CURRICULUM[curriculumIndex].title,
  };
});

export const getSectionForLevel = (levelIndex: number) => {
  const index = SECTIONS.findIndex(
    section => levelIndex >= section.range[0] && levelIndex <= section.range[1],
  );
  return SECTIONS[Math.max(0, index)];
};
