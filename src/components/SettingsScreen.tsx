import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, BellOff, Loader2, Download, Upload } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { APP_THEMES } from '../types';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../services/push';
import { exportData, importData } from '../utils/backupUtils';

export const SettingsScreen: React.FC = () => {
  const { themeId, setThemeId, isDarkMode, setIsDarkMode } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifyTime, setNotifyTime] = useState('08:00');
  const [isUpdatingPush, setIsUpdatingPush] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if we already have permission and a subscription
    const checkPushStatus = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setNotificationsEnabled(true);
        }
      }
      const savedTime = localStorage.getItem('notify_time');
      if (savedTime) setNotifyTime(savedTime);
    };
    checkPushStatus();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleToggleNotifications = async () => {
    try {
      setIsUpdatingPush(true);
      if (notificationsEnabled) {
        await unsubscribeFromPushNotifications();
        setNotificationsEnabled(false);
      } else {
        await subscribeToPushNotifications(notifyTime);
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error(error);
      alert('Impossibile aggiornare le notifiche. Assicurati di aver concesso i permessi.');
    } finally {
      setIsUpdatingPush(false);
    }
  };

  const syncPushNotificationTime = async (timeToSync: string) => {
    if (!notificationsEnabled) return;
    try {
      setIsUpdatingPush(true);
      await subscribeToPushNotifications(timeToSync);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingPush(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setNotifyTime(newTime);
    localStorage.setItem('notify_time', newTime);

    if (notificationsEnabled) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        syncPushNotificationTime(newTime);
        debounceTimerRef.current = null;
      }, 1200);
    }
  };

  const handleTimeBlur = () => {
    if (notificationsEnabled && debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      syncPushNotificationTime(notifyTime);
    }
  };

  const handleExportData = async () => {
    try {
      await exportData();
    } catch (err) {
      console.error(err);
      alert('Errore durante l\'esportazione dei dati.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      await importData(file);
      alert('Dati ripristinati con successo! L\'app verrà ricaricata per applicare le modifiche.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Errore durante il ripristino. Assicurati che il file sia valido.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="h-full text-light-text dark:text-dark-text overflow-y-auto">
      <div className="p-6 md:p-12 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <header className="mb-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h1 className="font-serif text-2xl md:text-3xl font-medium mb-1">Impostazioni</h1>
        </header>

        <main className="max-w-2xl mx-auto space-y-8 mt-8">
          
          {/* Sezione Notifiche */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Notifiche</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-4 flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${notificationsEnabled ? 'bg-accent/10 text-accent' : 'bg-black/5 dark:bg-white/5 text-light-text/40 dark:text-dark-text/40'}`}>
                    {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Versetto del Giorno</h3>
                    <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-0.5">
                      Ricevi una notifica quotidiana
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleToggleNotifications}
                  disabled={isUpdatingPush}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notificationsEnabled ? 'bg-accent' : 'bg-black/20 dark:bg-white/20'} ${isUpdatingPush ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {notificationsEnabled && (
                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <label htmlFor="notify-time" className="text-sm font-medium">Orario di notifica</label>
                  <div className="flex items-center gap-2">
                    {isUpdatingPush && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                    <input
                      type="time"
                      id="notify-time"
                      value={notifyTime}
                      onChange={handleTimeChange}
                      onBlur={handleTimeBlur}
                      className="bg-white dark:bg-black/40 border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Sezione Aspetto — Light/Dark toggle */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Aspetto</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-2 flex gap-2">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${!isDarkMode ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
              >
                <Sun className="w-4 h-4" />
                <span className="font-medium">Chiaro</span>
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${isDarkMode ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
              >
                <Moon className="w-4 h-4" />
                <span className="font-medium">Scuro</span>
              </button>
            </div>
          </section>

          {/* Sezione Tema */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Tema</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {APP_THEMES.map((t) => {
                const isActive = t.id === themeId;

                return (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${isActive ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span className="font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sezione Dati */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Dati</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-2 flex flex-col gap-2">
              <button
                onClick={handleExportData}
                className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm hover:bg-black/5 dark:hover:bg-white/5 text-light-text/80 dark:text-dark-text/80"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Esporta Backup Dati</span>
              </button>
              
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm hover:bg-black/5 dark:hover:bg-white/5 text-light-text/80 dark:text-dark-text/80 disabled:opacity-50"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="font-medium">Ripristina da Backup</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
            <p className="text-xs text-light-text/50 dark:text-dark-text/50 mt-3 text-center px-4">
              Esporta i tuoi segnalibri, versetti e preferenze per averne una copia sicura o per passarli su un altro dispositivo.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
};
