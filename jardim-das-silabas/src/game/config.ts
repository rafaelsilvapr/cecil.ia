import { CURRICULUM } from '../data/curriculum';

const BASE = import.meta.env.BASE_URL;

export const CHARS = {
  filhaRegando: `${BASE}characters/filha-regando.webp`,
  paiFilhaCelebrando: `${BASE}characters/pai-filha-celebrando.webp`,
  paiFilhaLivros: `${BASE}characters/pai-filha-livros.webp`,
  maeFilhaAbraco: `${BASE}characters/mae-filha-abraco.webp`,
  paiRede: `${BASE}characters/pai-rede.webp`,
} as const;

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
    storyImg: CHARS.paiFilhaLivros, storyAlt: 'Papai e Cecília lendo', range: [10, 19],
  },
  {
    title: 'O Carinho', subtitle: 'Palavras com afeto', emoji: '💝',
    bg: '#FF86D0', bgLight: '#ffe0f0', accent: '#FF86D0', accentDark: '#e056a0',
    storyImg: CHARS.maeFilhaAbraco, storyAlt: 'Mamãe e Cecília', range: [20, 29],
  },
  {
    title: 'O Descanso', subtitle: 'Sons compostos', emoji: '🌴',
    bg: '#FFC800', bgLight: '#fff4cc', accent: '#FFC800', accentDark: '#e0a800',
    storyImg: CHARS.paiRede, storyAlt: 'Papai na rede', range: [30, 39],
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
