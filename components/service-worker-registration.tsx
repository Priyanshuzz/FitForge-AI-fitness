'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/error-handling';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered successfully', {
            scope: registration.scope,
            updatefound: !!registration.updatefound
          });

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              logger.info('New Service Worker version available');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available, show update prompt
                  if (confirm('A new version of FitForge AI is available. Would you like to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          logger.error('Service Worker registration failed', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.info('Message from Service Worker', { data: event.data });
        
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          // Handle cache updates
          console.log('Cache updated:', event.data.url);
        }
      });
    }

    // Register for background sync (if supported)
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // This will be used when user goes offline and comes back online
        logger.info('Background sync is supported');
      });
    }

    // Request notification permission
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          logger.info('Notification permission', { permission });
        });
      }
    }

    // Handle app install prompt
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      logger.info('App install prompt available');
      
      // Show custom install button/prompt
      showInstallPrompt();
    };

    const handleAppInstalled = () => {
      logger.info('PWA was installed');
      hideInstallPrompt();
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = () => {
    // Create and show custom install prompt
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed top-0 left-0 right-0 bg-primary text-white p-4 text-center z-50';
    installBanner.innerHTML = `
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <span>Install FitForge AI for the best experience!</span>
        <div class="flex gap-2">
          <button id="install-btn" class="bg-white text-primary px-4 py-2 rounded font-medium">Install</button>
          <button id="dismiss-btn" class="text-white underline">Dismiss</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(installBanner);

    // Handle install button click
    document.getElementById('install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logger.info('Install prompt outcome', { outcome });
        hideInstallPrompt();
        deferredPrompt = null;
      }
    });

    // Handle dismiss button click
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      hideInstallPrompt();
    });
  };

  const hideInstallPrompt = () => {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  };

  return null; // This component doesn't render anything
}

// Utility functions for PWA features
export const PWAUtils = {
  // Check if app is running as PWA
  isPWA: () => {
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  },

  // Check if app is installable
  isInstallable: () => {
    return 'beforeinstallprompt' in window;
  },

  // Check if service worker is supported
  isServiceWorkerSupported: () => {
    return 'serviceWorker' in navigator;
  },

  // Check if push notifications are supported
  isPushNotificationSupported: () => {
    return 'PushManager' in window && 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Check if background sync is supported
  isBackgroundSyncSupported: () => {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  },

  // Subscribe to push notifications
  subscribeToNotifications: async () => {
    if (!PWAUtils.isPushNotificationSupported()) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // You'll need to add this
    });

    logger.info('Push notification subscription created', { 
      endpoint: subscription.endpoint 
    });

    return subscription;
  },

  // Sync data when back online
  syncWhenOnline: async (tag: string) => {
    if (PWAUtils.isBackgroundSyncSupported()) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      logger.info('Background sync registered', { tag });
    }
  },

  // Check network status
  isOnline: () => {
    return navigator.onLine;
  },

  // Add network status listeners
  addNetworkListeners: (onOnline: () => void, onOffline: () => void) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
};