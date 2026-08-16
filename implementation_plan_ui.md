# Miglioramenti UI — OpenBible PWA

Analisi completa delle schermate attuali con proposte di miglioramento organizzate per impatto e complessità.

---

## 🏠 1. Home Screen — Barra di progresso lettura

**Cosa**: Aggiungere una progress bar circolare (o ad arco) nella hero card "Continua a Leggere" che mostra la percentuale di avanzamento del capitolo corrente (es. verso 27 di 31 = ~87%).

**Perché**: L'utente ha già il verso/capitolo, ma una rappresentazione visiva immediata del progresso dà un senso di completamento e motiva a continuare. È un pattern molto usato nelle app di lettura (Kindle, Apple Books).

**Complessità**: 🟢 Bassa  
**Impatto**: ⭐⭐⭐

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/HomeScreen.tsx)
- Nella hero card, sostituire il cerchio decorativo in alto a destra con un ring animato SVG che mostra la percentuale di completamento del capitolo corrente.
- Il ring usa i colori `white/30` (track) e `white` (fill) per rimanere coerente con il gradiente dorato.

---

## 📖 2. Reader Screen — Numero verso grande decorativo

**Cosa**: Mostrare il numero del verso corrente come elemento decorativo grande e semi-trasparente dietro il testo (tipo "watermark"), nella parte alta dello schermo.

**Perché**: Il reader è attualmente molto minimale — funziona, ma manca un tocco visivo premium. Il numero verso grande in sfondo aggiunge profondità visiva senza distrarre dalla lettura. Si ispira alle app di meditazione/citazioni come "Calm" o "Daily Bible".

**Complessità**: 🟢 Bassa  
**Impatto**: ⭐⭐⭐

#### [MODIFY] [ReaderScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ReaderScreen.tsx)
- Aggiungere un `<span>` posizionato `absolute` con il numero del verso corrente, font-size molto grande (~`15rem`), opacità molto bassa (`opacity-[0.03]`), font serif, centrato verticalmente.
- Animare l'entrata con Framer Motion in sync con il cambio verso.

---

## 💾 3. Versi Salvati — Ricerca e filtri

**Cosa**: Aggiungere una barra di ricerca in cima alla lista dei versi salvati, con filtro per libro/testamento.

**Perché**: Con 3+ versi è gestibile, ma quando la collezione cresce diventa difficile trovare un verso specifico. La ricerca è una feature molto richiesta dagli utenti nelle app di lettura.

**Complessità**: 🟡 Media  
**Impatto**: ⭐⭐⭐⭐

#### [MODIFY] [SavedVersesScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/SavedVersesScreen.tsx)
- Aggiungere un campo di ricerca sotto l'header con icona `Search`, stile glassmorphism coerente con la bottom nav.
- Aggiungere filtro chip orizzontale scrollabile: "Tutti", "Antico T.", "Nuovo T.", e poi per libro (visibili solo dopo aver toccato un testamento).
- Il filtro è client-side sulla lista già caricata da IndexedDB.

---

## 🎯 4. Home Screen — Statistiche di lettura

**Cosa**: Aggiungere una sezione compatta sotto l'Ispirazione Giornaliera con statistiche di lettura: capitoli completati, versi salvati, giorni di streak (consecutivi).

**Perché**: La gamification leggera (streak, conteggi) è uno dei metodi più efficaci per aumentare l'engagement quotidiano. Duolingo, YouVersion e simili lo usano con successo.

**Complessità**: 🟡 Media  
**Impatto**: ⭐⭐⭐⭐⭐

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/HomeScreen.tsx)
- Nuova sezione con 3 card compatte in riga: 📖 Capitoli letti, ❤️ Versi salvati, 🔥 Giorni consecutivi.
- Design: bordo sottile, icone emoji, numeri grandi font serif, etichetta piccola sotto.

#### [MODIFY] [storage.ts](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/services/storage.ts)
- Aggiungere funzione `getReadingStreak()` che conta i giorni consecutivi in cui l'utente ha letto almeno un verso (basato sulla data dell'ultimo `markChapterCompleted` o una nuova chiave `lastReadDate`).
- Aggiungere store `readingDays` in IndexedDB per registrare le date di lettura.

---

## ✨ 5. Reader Screen — Transizione "capitolo completato"

**Cosa**: Quando l'utente arriva all'ultimo verso di un capitolo e swipa in avanti, mostrare un breve overlay celebrativo (es. "Capitolo 3 completato! ✓") con un'animazione prima di passare al capitolo successivo.

**Perché**: Dare un feedback visivo di completamento aumenta la soddisfazione. Attualmente il passaggio al capitolo successivo è silenzioso — l'utente potrebbe non accorgersi di aver completato un capitolo.

**Complessità**: 🟡 Media  
**Impatto**: ⭐⭐⭐⭐

#### [MODIFY] [ReaderScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ReaderScreen.tsx)
- Nello step di `navigateTo(1)` quando `isLastVerse`, prima di caricare il capitolo successivo, attivare uno stato `showChapterComplete` che mostra un overlay full-screen con:
  - Icona check animata (cerchio che si riempie)
  - Testo "Capitolo X completato"
  - Auto-dismiss dopo ~1.5 secondi, poi carica il capitolo successivo.

---

## 🔤 6. Impostazioni — Selettore dimensione font

**Cosa**: Aggiungere uno slider per la dimensione del testo nella schermata impostazioni, con anteprima live.

**Perché**: Molti utenti leggono la Bibbia su dispositivi di diverse dimensioni e in condizioni di luce diverse. La possibilità di regolare la dimensione del testo è una delle feature più richieste nelle app di lettura religiosa.

**Complessità**: 🟡 Media  
**Impatto**: ⭐⭐⭐⭐

#### [MODIFY] [SettingsScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/SettingsScreen.tsx)
- Nuova sezione "Dimensione Testo" con uno slider (3 step: Piccolo, Medio, Grande, oppure un range continuo).
- Anteprima di un verso di esempio sotto lo slider.
- Salvataggio in `localStorage` (semplice preferenza).

#### [MODIFY] [ThemeProvider.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ThemeProvider.tsx)
- Aggiungere `fontSize` al contesto del tema e applicare una custom property `--verse-font-size` su `:root`.

#### [MODIFY] [ReaderScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ReaderScreen.tsx)
- Usare `var(--verse-font-size)` per il testo del verso al posto del valore hardcoded.

---

## 📑 7. Bottom Sheet libri — Barra di ricerca rapida

**Cosa**: Aggiungere un campo di ricerca rapida nel bottom sheet dei libri (AT/NT), per trovare subito un libro digitando le prime lettere.

**Perché**: Con 39 libri nell'AT, scorrere la griglia per trovare "Malachia" richiede molto scroll. Un filtro rapido migliora drasticamente la navigazione.

**Complessità**: 🟢 Bassa  
**Impatto**: ⭐⭐⭐

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/HomeScreen.tsx)
- Nel bottom sheet, sotto l'header e prima della griglia libri, aggiungere un input di ricerca con icona `Search`.
- Filtra la lista `otBooks`/`ntBooks` in base al testo digitato (match parziale, case-insensitive).
- L'input si nasconde quando il bottom sheet è chiuso (reset al re-open).

---

## 🌊 8. Bottom Nav — Effetto "active indicator" animato

**Cosa**: Aggiungere un indicatore visivo sotto l'icona attiva nella bottom nav (un pallino o una linea) che si sposta con un'animazione fluida da un'icona all'altra.

**Perché**: Attualmente l'unico feedback dell'icona attiva è il colore accent. Un indicatore animato che "scivola" da un bottone all'altro dà un feeling molto più premium (Material Design 3 lo fa).

**Complessità**: 🟢 Bassa  
**Impatto**: ⭐⭐⭐

#### [MODIFY] [BottomNav.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/BottomNav.tsx)
- Aggiungere un `<motion.div>` posizionato `absolute` come dot/line sotto i bottoni.
- Usare `layoutId` di Framer Motion per animare automaticamente la transizione tra le posizioni.
- Stile: pallino 4px di diametro, colore accent, con leggero glow (`shadow-accent/30`).

---

## 🔀 9. Verso casuale — Animazione "shuffle" migliorata

**Cosa**: Quando l'utente preme il bottone "casuale" (shuffle nella bottom nav), aggiungere un'animazione di transizione tipo "slot machine" o "flip card" prima di mostrare il verso.

**Perché**: Al momento il tap su shuffle carica direttamente un nuovo verso senza ceremonia. Un'animazione di transizione rende l'esperienza più divertente e "magica".

**Complessità**: 🟡 Media  
**Impatto**: ⭐⭐

#### [MODIFY] [App.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/App.tsx)
- Nel `handleRandomVerse`, aggiungere uno stato temporaneo `isShuffling` che mostra un overlay di transizione prima di rivelare il verso.

#### [NEW] [ShuffleOverlay.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ShuffleOverlay.tsx)
- Componente overlay a schermo intero con animazione: 3-4 testi di versi casuali che scorrono velocemente (blur) poi rallentano e si fermano sul verso scelto.
- Durata: ~1 secondo.

---

## 💬 10. Reader — Doppio tap to save: feedback cuore animato

**Cosa**: Migliorare il feedback del doppio tap per salvare un verso: mostrare un cuore grande animato (stile Instagram like) che appare al centro dello schermo e poi scompare.

**Perché**: Il feedback attuale è un toast in basso ("Salvato!"). Un cuore animato al centro schermo è molto più immediato, visivamente appagante, e coerente con le convenzioni mobile che gli utenti già conoscono.

**Complessità**: 🟢 Bassa  
**Impatto**: ⭐⭐⭐

#### [MODIFY] [ReaderScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/ReaderScreen.tsx)
- Sostituire il toast `showSaveConfirm` con un cuore SVG/emoji che scala da 0 a grande (es. `scale(0) → scale(1.2) → scale(1) → opacity 0`), posizionato `fixed` al centro dello schermo.
- Durata: ~0.8 secondi. Colore accent con leggero glow.

---

## Riepilogo priorità

| # | Miglioramento | Complessità | Impatto | Priorità |
|---|---|---|---|---|
| 4 | Statistiche di lettura (streak, capitoli, versi) | 🟡 Media | ⭐⭐⭐⭐⭐ | 🔴 Alta |
| 3 | Ricerca e filtri versi salvati | 🟡 Media | ⭐⭐⭐⭐ | 🔴 Alta |
| 5 | Transizione "capitolo completato" | 🟡 Media | ⭐⭐⭐⭐ | 🔴 Alta |
| 6 | Selettore dimensione font | 🟡 Media | ⭐⭐⭐⭐ | 🔴 Alta |
| 1 | Progress ring nella hero card | 🟢 Bassa | ⭐⭐⭐ | 🟡 Media |
| 2 | Numero verso decorativo watermark | 🟢 Bassa | ⭐⭐⭐ | 🟡 Media |
| 8 | Active indicator animato bottom nav | 🟢 Bassa | ⭐⭐⭐ | 🟡 Media |
| 10 | Cuore animato doppio tap | 🟢 Bassa | ⭐⭐⭐ | 🟡 Media |
| 7 | Ricerca rapida nel bottom sheet libri | 🟢 Bassa | ⭐⭐⭐ | 🟡 Media |
| 9 | Animazione shuffle migliorata | 🟡 Media | ⭐⭐ | 🟢 Bassa |

> [!IMPORTANT]
> **Gabriele**, quali miglioramenti vorresti implementare? Posso procedere con tutti (in ordine di priorità), oppure scegli quelli che ti interessano di più e procedo solo con quelli.

## Piano di verifica

### Verifica manuale
- Test su viewport mobile (375px) in Chrome DevTools per ogni modifica
- Verifica in dark mode e light mode
- Verifica che le animazioni siano fluide e non intrusive
- Conferma che IndexedDB e la persistenza esistente non siano rotti
