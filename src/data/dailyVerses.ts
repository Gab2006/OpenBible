/**
 * Lista curata di versi biblici famosi e significativi per la sezione "Verso del Giorno".
 * Il verso viene selezionato in base al giorno dell'anno, ciclando sulla lista.
 */

export interface DailyVerse {
  text: string;
  bookName: string;
  reference: string; // es. "Giovanni 3:16"
  bookId: string;
  chapter: number;
  verse: number;
}

export const dailyVerses: DailyVerse[] = [
  {
    text: "Dio infatti ha tanto amato il mondo da dare il Figlio unigenito, perché chiunque crede in lui non vada perduto, ma abbia la vita eterna.",
    bookName: "Giovanni", reference: "Giovanni 3:16", bookId: "JHN", chapter: 3, verse: 16,
  },
  {
    text: "Il Signore è il mio pastore: non manco di nulla.",
    bookName: "Salmi", reference: "Salmo 23:1", bookId: "PSA", chapter: 23, verse: 1,
  },
  {
    text: "Io sono la via, la verità e la vita. Nessuno viene al Padre se non per mezzo di me.",
    bookName: "Giovanni", reference: "Giovanni 14:6", bookId: "JHN", chapter: 14, verse: 6,
  },
  {
    text: "La fede è fondamento di ciò che si spera e prova di ciò che non si vede.",
    bookName: "Ebrei", reference: "Ebrei 11:1", bookId: "HEB", chapter: 11, verse: 1,
  },
  {
    text: "Tutto posso in colui che mi dà la forza.",
    bookName: "Filippesi", reference: "Filippesi 4:13", bookId: "PHP", chapter: 4, verse: 13,
  },
  {
    text: "In principio era il Verbo, e il Verbo era presso Dio e il Verbo era Dio.",
    bookName: "Giovanni", reference: "Giovanni 1:1", bookId: "JHN", chapter: 1, verse: 1,
  },
  {
    text: "Confida nel Signore con tutto il tuo cuore e non affidarti alla tua intelligenza;",
    bookName: "Proverbi", reference: "Proverbi 3:5", bookId: "PRO", chapter: 3, verse: 5,
  },
  {
    text: "La carità non fa alcun male al prossimo: pienezza della Legge infatti è la carità.",
    bookName: "Romani", reference: "Romani 13:10", bookId: "ROM", chapter: 13, verse: 10,
  },
  {
    text: "Venite a me, voi tutti che siete stanchi e oppressi, e io vi darò ristoro.",
    bookName: "Matteo", reference: "Matteo 11:28", bookId: "MAT", chapter: 11, verse: 28,
  },
  {
    text: "Non temere, perché io sono con te; non smarrirti, perché io sono il tuo Dio. Ti rendo forte e ti vengo in aiuto e ti sostengo con la destra della mia giustizia.",
    bookName: "Isaia", reference: "Isaia 41:10", bookId: "ISA", chapter: 41, verse: 10,
  },
  {
    text: "Ti benedica il Signore e ti custodisca. Il Signore faccia risplendere per te il suo volto e ti faccia grazia.",
    bookName: "Numeri", reference: "Numeri 6:24-25", bookId: "NUM", chapter: 6, verse: 24,
  },
  {
    text: "ma quanti sperano nel Signore riacquistano forza, mettono ali come aquile, corrono senza affannarsi, camminano senza stancarsi.",
    bookName: "Isaia", reference: "Isaia 40:31", bookId: "ISA", chapter: 40, verse: 31,
  },
  {
    text: "Lampada per i miei passi è la tua parola, luce sul mio cammino.",
    bookName: "Salmi", reference: "Salmo 119:105", bookId: "PSA", chapter: 119, verse: 105,
  },
  {
    text: "Io conosco i progetti che ho fatto a vostro riguardo - oracolo del Signore -, progetti di pace e non di sventura, per concedervi un futuro pieno di speranza.",
    bookName: "Geremia", reference: "Geremia 29:11", bookId: "JER", chapter: 29, verse: 11,
  },
  {
    text: "Il Signore è mia luce e mia salvezza: di chi avrò timore? Il Signore è difesa della mia vita: di chi avrò paura?",
    bookName: "Salmi", reference: "Salmo 27:1", bookId: "PSA", chapter: 27, verse: 1,
  },
  {
    text: "Sii forte e coraggioso! Non aver paura e non spaventarti, perché il Signore, tuo Dio, è con te, dovunque tu vada.",
    bookName: "Giosuè", reference: "Giosuè 1:9", bookId: "JOS", chapter: 1, verse: 9,
  },
  {
    text: "La carità è magnanima, benevola è la carità; non è invidiosa, non si vanta, non si gonfia d'orgoglio,",
    bookName: "1 Corinzi", reference: "1 Corinzi 13:4", bookId: "1CO", chapter: 13, verse: 4,
  },
  {
    text: "Tanto che, se uno è in Cristo, è una nuova creatura; le cose vecchie sono passate; ecco, ne sono nate di nuove.",
    bookName: "2 Corinzi", reference: "2 Corinzi 5:17", bookId: "2CO", chapter: 5, verse: 17,
  },
  {
    text: "Ti ho amato di amore eterno, per questo continuo a esserti fedele.",
    bookName: "Geremia", reference: "Geremia 31:3", bookId: "JER", chapter: 31, verse: 3,
  },
  {
    text: "Io dico al Signore: \"Mio rifugio e mia fortezza, mio Dio in cui confido\".",
    bookName: "Salmi", reference: "Salmo 91:2", bookId: "PSA", chapter: 91, verse: 2,
  },
  {
    text: "Il frutto dello Spirito invece è amore, gioia, pace, magnanimità, benevolenza, bontà, fedeltà, mitezza, dominio di sé;",
    bookName: "Galati", reference: "Galati 5:22", bookId: "GAL", chapter: 5, verse: 22,
  },
  {
    text: "Del resto, noi sappiamo che tutto concorre al bene, per quelli che amano Dio, per coloro che sono stati chiamati secondo il suo disegno.",
    bookName: "Romani", reference: "Romani 8:28", bookId: "ROM", chapter: 8, verse: 28,
  },
  {
    text: "Questo è il giorno che ha fatto il Signore: rallegriamoci in esso ed esultiamo!",
    bookName: "Salmi", reference: "Salmo 118:24", bookId: "PSA", chapter: 118, verse: 24,
  },
  {
    text: "Il Signore è vicino a chi ha il cuore spezzato, egli salva gli spiriti affranti.",
    bookName: "Salmi", reference: "Salmo 34:19", bookId: "PSA", chapter: 34, verse: 19,
  },
  {
    text: "Io sono la risurrezione e la vita; chi crede in me, anche se muore, vivrà;",
    bookName: "Giovanni", reference: "Giovanni 11:25", bookId: "JHN", chapter: 11, verse: 25,
  },
  {
    text: "Beati i puri di cuore, perché vedranno Dio.",
    bookName: "Matteo", reference: "Matteo 5:8", bookId: "MAT", chapter: 5, verse: 8,
  },
  {
    text: "Affida al Signore il tuo peso ed egli ti sosterrà, mai permetterà che il giusto vacilli.",
    bookName: "Salmi", reference: "Salmo 55:23", bookId: "PSA", chapter: 55, verse: 23,
  },
  {
    text: "Ed ecco, io sono con voi tutti i giorni, fino alla fine del mondo.",
    bookName: "Matteo", reference: "Matteo 28:20", bookId: "MAT", chapter: 28, verse: 20,
  },
  {
    text: "La grazia del Signore Gesù Cristo sia con il vostro spirito.",
    bookName: "Filemone", reference: "Filemone 1:25", bookId: "PHM", chapter: 1, verse: 25,
  },
  {
    text: "Cercate invece, anzitutto, il regno di Dio e la sua giustizia, e tutte queste cose vi saranno date in aggiunta.",
    bookName: "Matteo", reference: "Matteo 6:33", bookId: "MAT", chapter: 6, verse: 33,
  },
  {
    text: "Chi abita al riparo dell'Altissimo passerà la notte all'ombra dell'Onnipotente.",
    bookName: "Salmi", reference: "Salmo 91:1", bookId: "PSA", chapter: 91, verse: 1,
  },
];

/** Restituisce il verso del giorno basato sulla data corrente, ciclando sulla lista */
export function getDailyVerse(): DailyVerse {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyVerses[dayOfYear % dailyVerses.length];
}
