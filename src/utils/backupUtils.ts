import { initDB } from '../services/storage';

export async function exportData() {
  const db = await initDB();
  
  const readingPosition = await db.get('reading_progress', 'current');
  const savedVerses = await db.getAll('saved_verses');
  const completedChaptersKeys = await db.getAllKeys('completed_chapters');
  const completedChapters = await Promise.all(
    completedChaptersKeys.map(key => db.get('completed_chapters', key))
  );
  const readingDays = await db.getAll('reading_days');

  const localPreferences: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      localPreferences[key] = localStorage.getItem(key) || '';
    }
  }

  const backupData = {
    version: 1,
    timestamp: Date.now(),
    readingPosition,
    savedVerses,
    completedChapters,
    localPreferences,
    readingDays,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `OpenBible-Backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version || !data.timestamp) {
          throw new Error('Formato file non valido');
        }

        const db = await initDB();

        // Restore Reading Position
        if (data.readingPosition) {
          await db.put('reading_progress', data.readingPosition, 'current');
        }

        // Restore Saved Verses
        if (data.savedVerses && Array.isArray(data.savedVerses)) {
          const tx = db.transaction('saved_verses', 'readwrite');
          await tx.store.clear();
          for (const verse of data.savedVerses) {
            await tx.store.put(verse);
          }
          await tx.done;
        }

        // Restore Completed Chapters
        if (data.completedChapters && Array.isArray(data.completedChapters)) {
          const tx = db.transaction('completed_chapters', 'readwrite');
          await tx.store.clear();
          for (const chapter of data.completedChapters) {
            const key = `${chapter.bookId}-${chapter.chapter}`;
            await tx.store.put(chapter, key);
          }
          await tx.done;
        }

        // Restore Reading Days (Stats)
        if (data.readingDays && Array.isArray(data.readingDays)) {
          const tx = db.transaction('reading_days', 'readwrite');
          await tx.store.clear();
          for (const day of data.readingDays) {
            await tx.store.put(day);
          }
          await tx.done;
        }

        // Restore Local Storage
        if (data.localPreferences) {
          for (const [key, value] of Object.entries(data.localPreferences)) {
            localStorage.setItem(key, value as string);
          }
        }

        // Notify app components to reload data
        window.dispatchEvent(new Event('verses-changed'));
        window.dispatchEvent(new Event('progress-changed'));

        resolve(true);
      } catch (err) {
        console.error('Errore durante l\'importazione:', err);
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Impossibile leggere il file'));
    reader.readAsText(file);
  });
}
