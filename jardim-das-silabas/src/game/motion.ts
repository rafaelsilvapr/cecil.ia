import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Movimento não é neutro num jogo feito para criança autista: a mesma animação
 * que motiva pode puxar a atenção para fora da tarefa de leitura. Quando o
 * sistema pede menos movimento, as cenas vão direto para o estado final em vez
 * de tocar — nada é perdido, só não se mexe.
 */
export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true,
  );

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return;
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
};
