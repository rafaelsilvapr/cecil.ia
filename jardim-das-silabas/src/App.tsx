import { useEffect, useRef, useState } from 'react';
import { CURRICULUM } from './data/curriculum';
import type { WordData } from './data/curriculum';
import { playSound } from './game/audio';
import { caregiverAt, getSectionForLevel, MAP_NODES, SECTIONS } from './game/config';
import { CelebrationScreen } from './screens/CelebrationScreen';
import { GameScreen } from './screens/GameScreen';
import { MapScreen } from './screens/MapScreen';
import { StoryScreen } from './screens/StoryScreen';
import { applyPendingUpdate } from './pwa/update';
import { useAppUpdate } from './pwa/useAppUpdate';
import { telemetry } from './telemetry/telemetry';

const STORAGE_KEY = 'jardim-silabas-v1';

const EXERCISES_PER_PHASE = 8;
/** Palavras de sílaba simples no começo de toda fase, para ela entrar no ritmo. */
const WARMUP_COUNT = 2;
/** Palavras de níveis já vencidos, para não esquecer o que aprendeu. */
const REVIEW_COUNT = 2;

type SavedProgress = {
  currentMapLevel: number;
  streak: number;
  recentlyPlayedWords: string[];
};

const INITIAL_PROGRESS: SavedProgress = {
  currentMapLevel: 0,
  streak: 0,
  recentlyPlayedWords: [],
};

const loadProgress = (): SavedProgress => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_PROGRESS;

    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('currentMapLevel' in parsed) ||
      typeof parsed.currentMapLevel !== 'number' ||
      !Number.isInteger(parsed.currentMapLevel) ||
      parsed.currentMapLevel < 0 ||
      parsed.currentMapLevel >= MAP_NODES.length ||
      !('streak' in parsed) ||
      typeof parsed.streak !== 'number' ||
      !Number.isInteger(parsed.streak) ||
      parsed.streak < 0 ||
      !('recentlyPlayedWords' in parsed) ||
      !Array.isArray(parsed.recentlyPlayedWords) ||
      !parsed.recentlyPlayedWords.every(word => typeof word === 'string')
    ) {
      return INITIAL_PROGRESS;
    }

    return {
      currentMapLevel: parsed.currentMapLevel,
      streak: parsed.streak,
      recentlyPlayedWords: parsed.recentlyPlayedWords.slice(0, 40),
    };
  } catch {
    return INITIAL_PROGRESS;
  }
};

const isComplexWord = (word: WordData) => {
  const complexSyllables = [
    'NHA', 'NHO', 'NHE', 'NHI', 'NHU', 'LHA', 'LHO', 'LHE', 'LHI', 'LHU',
    'CHA', 'CHO', 'CHE', 'CHI', 'CHU', 'RR', 'SS', 'Ç', 'TR', 'BR', 'CR',
    'FR', 'GR', 'PR', 'VR', 'CL', 'BL', 'FL', 'GL', 'PL', 'TL',
  ];
  return word.syllables.some(syllable => complexSyllables.some(complex => syllable.includes(complex)));
};

const speak = (text: string, rate = 0.8) => new Promise<void>(resolve => {
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    resolve();
  };
  utterance.lang = 'pt-BR';
  utterance.rate = rate;
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);
  window.setTimeout(finish, 8_000);
});

const speakSlowly = (text: string) => {
  window.speechSynthesis.cancel();
  return speak(text, 0.4);
};

function App() {
  const [initialProgress] = useState(loadProgress);
  const [gameState, setGameState] = useState<'map' | 'game' | 'celebration' | 'story'>('map');
  const [currentMapLevel, setCurrentMapLevel] = useState(initialProgress.currentMapLevel);
  const [streak, setStreak] = useState(initialProgress.streak);
  const [currentExercises, setCurrentExercises] = useState<WordData[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [recentlyPlayedWords, setRecentlyPlayedWords] = useState<string[]>(initialProgress.recentlyPlayedWords);
  const [wateringCanFill, setWateringCanFill] = useState(0);
  const [storySection, setStorySection] = useState(0);
  const [pendingLevelIndex, setPendingLevelIndex] = useState(0);
  const [playedLevelIndex, setPlayedLevelIndex] = useState<number | null>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const exerciseLockedRef = useRef(false);

  const showUpdateButton = useAppUpdate({ isIdle: gameState === 'map', hasStartedPlaying });

  useEffect(() => {
    void telemetry.initialize(initialProgress.currentMapLevel);
    const handlePageHide = () => telemetry.close('background');
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [initialProgress.currentMapLevel]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentMapLevel,
        streak,
        recentlyPlayedWords,
      } satisfies SavedProgress));
    } catch {
      // O jogo continua funcionando quando o armazenamento está indisponível.
    }
  }, [currentMapLevel, streak, recentlyPlayedWords]);

  const setupExercise = (word: WordData, index: number, exercisePool = currentExercises) => {
    exerciseLockedRef.current = false;
    setSelectedSyllables([]);
    setProgress(0);
    const options = [...word.syllables];

    if (index >= 2) {
      const distractorCount = index < 5 ? 2 : 3;
      const allSyllables = exercisePool.flatMap(exercise => exercise.syllables);
      for (let distractorIndex = 0; distractorIndex < distractorCount; distractorIndex += 1) {
        const distractor = allSyllables[Math.floor(Math.random() * allSyllables.length)];
        if (distractor && !options.includes(distractor)) options.push(distractor);
      }
    }

    options.sort(() => Math.random() - 0.5);
    setShuffledOptions(options);
    const presentationId = telemetry.beginPresentation(word.word);
    window.setTimeout(() => {
      telemetry.recordAudio('word', word.word, 'automatic');
      void speak(word.word).finally(() => telemetry.markAutomaticAudioComplete(presentationId));
    }, 800);
  };

  const launchLevel = (levelIndex: number) => {
    const node = MAP_NODES[levelIndex];
    const curriculumIndex = Math.max(0, CURRICULUM.findIndex(level => level.id === node.curriculumId));
    const curriculumLevel = CURRICULUM[curriculumIndex];
    let picked: WordData[] = [];
    const used = new Set<string>();

    const pick = (pool: WordData[], filter: (word: WordData) => boolean, count: number) => {
      const candidates = pool.filter(word => filter(word) && !recentlyPlayedWords.includes(word.word) && !used.has(word.word));
      const available = candidates.length >= count ? candidates : pool.filter(word => !used.has(word.word));

      for (let index = 0; index < count; index += 1) {
        if (available.length === 0) break;
        const selectedIndex = Math.floor(Math.random() * available.length);
        const selected = available.splice(selectedIndex, 1)[0];
        picked.push(selected);
        used.add(selected.word);
      }
    };

    // Aquecimento com sílabas simples, sempre.
    pick(CURRICULUM[0].words, word => !isComplexWord(word), WARMUP_COUNT);

    // O miolo da fase vem do nível que ela alcançou — nunca de um nível que ela
    // ainda não viu. Na primeira seção isso mantém a fase inteira em sílabas
    // simples, sem dígrafo nem encontro consonantal.
    pick(curriculumLevel.words, () => true, EXERCISES_PER_PHASE - WARMUP_COUNT - REVIEW_COUNT);

    // Revisão dos níveis anteriores (a primeira seção não tem o que revisar).
    const reviewPool = CURRICULUM.slice(0, curriculumIndex).flatMap(level => level.words);
    if (reviewPool.length > 0) pick(reviewPool, () => true, REVIEW_COUNT);

    const remaining = EXERCISES_PER_PHASE - picked.length;
    if (remaining > 0) pick(curriculumLevel.words, () => true, remaining);

    picked = [...picked.slice(0, WARMUP_COUNT), ...picked.slice(WARMUP_COUNT).sort(() => Math.random() - 0.5)];
    telemetry.startPhase(levelIndex, picked.length, levelIndex < currentMapLevel);
    setCurrentExercises(picked);
    setPlayedLevelIndex(levelIndex);
    setCurrentExerciseIndex(0);
    setWateringCanFill(0);
    setupExercise(picked[0], 0, picked);
    setGameState('game');
  };

  const startLevel = (levelIndex: number) => {
    if (levelIndex > currentMapLevel) return;
    setHasStartedPlaying(true);

    const section = SECTIONS.find(candidate => levelIndex >= candidate.range[0] && levelIndex <= candidate.range[1]);
    const sectionIndex = section ? SECTIONS.indexOf(section) : 0;
    if (levelIndex === section?.range[0] && levelIndex === currentMapLevel && sectionIndex > 0) {
      setStorySection(sectionIndex);
      setPendingLevelIndex(levelIndex);
      setGameState('story');
      return;
    }

    launchLevel(levelIndex);
  };

  const finishWord = () => {
    setWateringCanFill(fill => Math.min(fill + 100 / currentExercises.length, 100));
    window.setTimeout(() => {
      if (currentExerciseIndex < currentExercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setupExercise(currentExercises[nextIndex], nextIndex);
      } else {
        window.setTimeout(() => {
          telemetry.completePhase();
          telemetry.recordAudio('celebration', 'celebração da fase', 'automatic');
          setGameState('celebration');
          void playSound('celebration');
        }, 1000);
      }
    }, 1000);
  };

  const handleSyllableClick = (syllable: string) => {
    if (exerciseLockedRef.current) return;
    const currentWord = currentExercises[currentExerciseIndex];
    const syllablePosition = selectedSyllables.length;
    const expectedSyllable = currentWord.syllables[syllablePosition];
    if (!expectedSyllable) return;
    telemetry.recordAttempt(syllable, expectedSyllable, syllablePosition);
    telemetry.recordAudio('syllable', syllable, 'user');
    void speak(syllable);
    void playSound('pop');
    const nextSelection = [...selectedSyllables, syllable];
    setSelectedSyllables(nextSelection);

    if (syllable !== currentWord.syllables[nextSelection.length - 1]) {
      void playSound('error');
      window.setTimeout(() => setSelectedSyllables(selection => selection.slice(0, -1)), 500);
      return;
    }

    setProgress((nextSelection.length / currentWord.syllables.length) * 100);
    if (nextSelection.length === currentWord.syllables.length) {
      exerciseLockedRef.current = true;
      void playSound('success');
      window.setTimeout(() => void speak(currentWord.word), 500);
      window.setTimeout(finishWord, 1500);
    }
  };

  const closeCelebration = () => {
    const nextLevel = playedLevelIndex === currentMapLevel
      ? Math.min(currentMapLevel + 1, MAP_NODES.length - 1)
      : currentMapLevel;
    setRecentlyPlayedWords(previous => [...currentExercises.map(exercise => exercise.word), ...previous].slice(0, 40));
    setStreak(previous => previous + 1);
    setCurrentMapLevel(nextLevel);
    telemetry.setCurrentLevel(nextLevel);
    setGameState('map');
  };

  const handleListen = (word: string) => {
    telemetry.recordAudio('word', word, 'user');
    void speakSlowly(word);
  };

  const currentSection = getSectionForLevel(currentMapLevel);
  // A fase entra na conta para que a fase seguinte não comece sempre com o mesmo
  // responsável; dentro de cada fase a alternância continua fechando 4 e 4.
  const exerciseCaregiver = caregiverAt((playedLevelIndex ?? currentMapLevel) + currentExerciseIndex);
  const celebrationCaregiver = caregiverAt(currentMapLevel);

  return (
    <>
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 0.6; }
          50% { transform: translateY(25px) rotate(180deg); opacity: 0.3; }
          100% { transform: translateY(0) rotate(360deg); opacity: 0.6; }
        }
      `}</style>
      <main className="font-sans text-gray-800 select-none">
        {gameState === 'map' && (
          <MapScreen
            currentMapLevel={currentMapLevel}
            streak={streak}
            onStartLevel={startLevel}
            updateAvailable={showUpdateButton}
            onUpdate={() => void applyPendingUpdate()}
          />
        )}
        {gameState === 'story' && (
          <StoryScreen section={SECTIONS[storySection]} onContinue={() => launchLevel(pendingLevelIndex)} />
        )}
        {gameState === 'game' && (
          <GameScreen
            currentExercise={currentExercises[currentExerciseIndex]}
            currentExerciseIndex={currentExerciseIndex}
            exerciseCount={currentExercises.length}
            shuffledOptions={shuffledOptions}
            selectedSyllables={selectedSyllables}
            progress={progress}
            wateringCanFill={wateringCanFill}
            section={currentSection}
            caregiver={exerciseCaregiver}
            onSyllableClick={handleSyllableClick}
            onListen={handleListen}
          />
        )}
        {gameState === 'celebration' && (
          <CelebrationScreen
            currentMapLevel={currentMapLevel}
            section={currentSection}
            caregiver={celebrationCaregiver}
            onContinue={closeCelebration}
          />
        )}
      </main>
    </>
  );
}

export default App;
