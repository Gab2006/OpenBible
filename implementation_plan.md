# Redesign menu Testamento

## Contesto

Le card "Antico Testamento" e "Nuovo Testamento" nella home e il bottom sheet con la lista dei libri sono funzionali ma essenziali. Si può aggiungere personalità senza rompere lo stile editoriale dell'app.

---

## Idee proposte

### 1. 📊 Progress integrato nelle card (home)

Sostituire il semplice testo "39 libri · Da Genesi a Malachia" con:
- Una **barra di progresso sottile e animata** (stile pill) in fondo alla card che mostra la % di capitoli completati per quel testamento, colorata con l'accent dorato
- Una riga "**X di Y capitoli letti**" in piccolo, sotto il sottotitolo
- Il bordo sinistro della card diventa una **barra verticale accent** più marcata (effetto "segnalibro"), simile alle card dei versetti salvati
- L'emoji viene sostituita con un **cerchio progress animato** in SVG (come quello nella card "Continua a leggere"), con la percentuale al centro

### 2. 🗂️ Raggruppamento per sezioni nel bottom sheet

Invece della griglia piatta di libri, organizzare in **sezioni tematiche** con intestazioni in stile label (già usate nell'app):

**Antico Testamento:**
- Pentateuco (5) — Genesi · Esodo · Levitico · Numeri · Deuteronomio
- Libri Storici (12) — Giosuè → Ester
- Libri Sapienziali (7) — Giobbe → Siracide
- Profeti Maggiori (5) — Isaia → Daniele
- Profeti Minori (12) — Osea → Malachia

**Nuovo Testamento:**
- Vangeli & Atti (5) — Matteo → Atti
- Lettere di Paolo (13) — Romani → Filemone
- Lettere Cattoliche (7) — Ebrei → Giuda
- Apocalisse (1)

Ogni intestazione di sezione ha il solito stile `text-xs uppercase tracking-widest text-accent/70`.

### 3. 📈 Mini-progress per libro nel bottom sheet

Ogni libro nella griglia mostra un **indicatore di progresso** compatto:
- Una piccola pill in basso a destra con "X/Y cap" in micro-testo
- Se completato al 100% → pill verde con ✓
- Se iniziato ma non finito → pill accent con la percentuale
- Se non iniziato → nessuna pill (il libro appare pulito)

---

## Raccomandazione

L'ideale sarebbe combinare **tutte e tre** le idee:
1. Le card nella home mostrano il cerchio progress (come "Continua a leggere") e la barra sottile
2. Il bottom sheet raggruppa i libri per sezione
3. Ogni libro mostra il mini-progress

> [!IMPORTANT]
> **Dimmi quali idee ti convincono**, anche solo alcune o tutte e tre, e procedo con l'implementazione.

## File coinvolti

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/HomeScreen.tsx)
- Card `testament-ot` e `testament-nt`: aggiunta progress circle e barra
- `renderBookList`: raggruppamento per sezioni + mini-progress per libro

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Gabriele%20Tosti/Desktop/OpenBible/src/components/HomeScreen.tsx)
- Calcolo % completamento per testamento (già abbiamo `completedChapters` in state)

> [!NOTE]
> Il dato `completedChapters` è già disponibile in state, quindi nessuna chiamata extra al DB — zero impatto sulle performance.
