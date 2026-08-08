import { useEffect, useState } from 'react';
import { applyPendingUpdate, isUpdateReady, subscribeToUpdate } from './update';

type AppUpdateOptions = {
  /** A Cecília está no mapa (nunca interromper uma fase no meio). */
  isIdle: boolean;
  /** Ela já começou a jogar nesta sessão. */
  hasStartedPlaying: boolean;
};

/**
 * Devolve `true` quando existe versão nova esperando um toque dela.
 *
 * Se a atualização chega antes de ela começar a jogar, o app se atualiza sozinho
 * — do ponto de vista dela é só o jogo abrindo. Se ela já estava jogando, o
 * mapa mostra o botão "Tem novidade!" e a decisão fica com ela.
 */
export const useAppUpdate = ({ isIdle, hasStartedPlaying }: AppUpdateOptions) => {
  const [updateReady, setUpdateReady] = useState(isUpdateReady);

  useEffect(() => subscribeToUpdate(() => setUpdateReady(true)), []);

  useEffect(() => {
    if (!updateReady || !isIdle || hasStartedPlaying) return;
    void applyPendingUpdate();
  }, [updateReady, isIdle, hasStartedPlaying]);

  return updateReady && isIdle && hasStartedPlaying;
};
