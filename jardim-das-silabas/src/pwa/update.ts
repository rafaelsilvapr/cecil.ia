import { registerSW } from 'virtual:pwa-register';

// Canal de atualização do jogo instalado no tablet.
//
// O service worker baixa a versão nova em segundo plano. Quando ela fica pronta,
// o App decide o momento de aplicar (ver useAppUpdate): sozinho se a Cecília
// acabou de abrir o jogo, ou com um botão grande se ela já estava jogando.
// Nunca no meio de uma fase.

type Listener = () => void;

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

const listeners = new Set<Listener>();
let updateReady = false;
let applyUpdate: (() => Promise<void>) | null = null;

export const registerUpdateChannel = () => {
  if (!('serviceWorker' in navigator)) return;

  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      updateReady = true;
      listeners.forEach(listener => listener());
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Sessões longas também percebem versões novas sem precisar fechar o app.
      window.setInterval(() => void registration.update(), CHECK_INTERVAL_MS);
    },
  });

  applyUpdate = () => updateServiceWorker(true);
};

export const isUpdateReady = () => updateReady;

export const subscribeToUpdate = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const applyPendingUpdate = async () => {
  if (!applyUpdate) return;
  await applyUpdate();
};
