'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstalled: boolean;
  canPromptDirectly: boolean;
  isIos: boolean;
  isAndroid: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  promptInstall: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | null>(null);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [canPromptDirectly, setCanPromptDirectly] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Détection de l'appareil
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const androidDetected = /android/.test(ua);
    setIsIos(iosDetected);
    setIsAndroid(androidDetected);

    // Détection du mode standalone (déjà installé comme PWA)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNav = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      const installed = Boolean(isStandaloneMedia || isStandaloneNav || isAndroidApp);
      setIsInstalled(installed);
      return installed;
    };

    checkStandalone();

    // Écouter les changements de mode d'affichage
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setCanPromptDirectly(false);
      }
    };
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleDisplayModeChange);
    }

    // Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // Capture de l'événement beforeinstallprompt pour Chrome, Edge, Android, etc.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanPromptDirectly(true);
      console.log('[PWA] beforeinstallprompt captured');
    };

    // Capture de l'installation réussie
    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed!');
      setIsInstalled(true);
      setCanPromptDirectly(false);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('[PWA] User accepted the installation prompt');
          setDeferredPrompt(null);
          setCanPromptDirectly(false);
        } else {
          console.log('[PWA] User dismissed the installation prompt');
        }
      } catch (err) {
        console.error('[PWA] Error launching prompt:', err);
        setShowInstallModal(true);
      }
    } else {
      // Pas de prompt natif direct (Safari iOS, ou Chrome desktop sans prompt déclenché)
      setShowInstallModal(true);
    }
  }, [deferredPrompt]);

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canPromptDirectly,
        isIos,
        isAndroid,
        showInstallModal,
        setShowInstallModal,
        promptInstall,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
