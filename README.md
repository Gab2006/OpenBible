# OpenBible - Bible Verse Reader

Un'applicazione web progressiva (PWA) progettata per offrire un'esperienza di lettura della Bibbia elegante, veloce e fruibile anche offline.

## Scopo del Progetto
L'app è pensata per consentire agli utenti di leggere la Bibbia, scoprire nuovi versi, salvare i preferiti e mantenere la posizione di lettura in modo fluido. Pone grande enfasi sull'estetica (modalità chiara/scura, tipografia curata) e sull'usabilità, essendo ottimizzata prioritariamente per dispositivi mobili.

## Caratteristiche Principali
- **Completamente Statica e Offline**: Nessun backend o database remoto necessario. I dati (storico lettura, versi salvati, capitoli scaricati) vengono salvati localmente sul dispositivo dell'utente tramite IndexedDB.
- **Progressive Web App (PWA)**: Installabile sulla schermata Home dello smartphone per un'esperienza simile a un'app nativa, funzionante anche senza connessione internet.
- **Design Elegante e Fluido**: Animazioni morbide, palette di colori armoniosa (ispirata alla carta e a toni editoriali), font tipografici pensati per la lettura prolungata.
- **Interazioni Naturali**: Supporto per gesti swipe per cambiare capitolo o interagire con gli elementi.
- **Verso del Giorno**: Selezione automatica di un verso quotidiano da leggere o salvare.

## Stack Tecnologico
- **React 18** + **TypeScript**
- **Vite**: per un ambiente di sviluppo rapido e build altamente ottimizzate.
- **Tailwind CSS**: per lo styling strutturato e reattivo.
- **Framer Motion**: per gestire le animazioni, le transizioni di pagina e le gesture (swipe).
- **idb**: per interagire con IndexedDB per la persistenza dei dati.
- **Lucide React**: libreria per le icone dell'interfaccia.
- **vite-plugin-pwa**: per la gestione automatizzata del service worker e del manifest dell'app.

## Sviluppo Locale

1. **Installazione delle dipendenze:**
   ```bash
   npm install
   ```

2. **Avvio del server di sviluppo:**
   ```bash
   npm run dev
   ```

3. **Build per la produzione:**
   ```bash
   npm run build
   ```

## Regole Architetturali
Tutto il codice rispetta linee guida precise definite internamente:
- La logica di persistenza (dati) vive sempre all'interno della cartella `services/`.
- Nessun uso di backend o server; l'app è 100% statica.
- Le unità di misura (specialmente per il testo) utilizzano valori relativi (rem, clamp) per garantire responsività massima, e viene usato `100dvh` al posto di `100vh` per il corretto funzionamento su mobile (in particolare iOS Safari).
