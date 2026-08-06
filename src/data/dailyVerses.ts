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
    text: "Poiché Iddio ha tanto amato il mondo, che ha dato il suo unigenito Figliuolo, affinché chiunque crede in lui non perisca, ma abbia vita eterna.",
    bookName: "Giovanni", reference: "Giovanni 3:16", bookId: "JHN", chapter: 3, verse: 16,
  },
  {
    text: "Il Signore è il mio pastore; nulla mi mancherà.",
    bookName: "Salmi", reference: "Salmo 23:1", bookId: "PSA", chapter: 23, verse: 1,
  },
  {
    text: "Io sono la via, la verità e la vita; nessuno viene al Padre se non per mezzo di me.",
    bookName: "Giovanni", reference: "Giovanni 14:6", bookId: "JHN", chapter: 14, verse: 6,
  },
  {
    text: "Or la fede è certezza di cose che si sperano, dimostrazione di realtà che non si vedono.",
    bookName: "Ebrei", reference: "Ebrei 11:1", bookId: "HEB", chapter: 11, verse: 1,
  },
  {
    text: "Io posso ogni cosa in colui che mi fortifica.",
    bookName: "Filippesi", reference: "Filippesi 4:13", bookId: "PHP", chapter: 4, verse: 13,
  },
  {
    text: "Nel principio era la Parola, e la Parola era con Dio, e la Parola era Dio.",
    bookName: "Giovanni", reference: "Giovanni 1:1", bookId: "JHN", chapter: 1, verse: 1,
  },
  {
    text: "Confida nell'Eterno con tutto il cuore e non ti appoggiare sul tuo discernimento.",
    bookName: "Proverbi", reference: "Proverbi 3:5", bookId: "PRO", chapter: 3, verse: 5,
  },
  {
    text: "L'amor non fa male alcuno al prossimo; l'amore, quindi, è l'adempimento della legge.",
    bookName: "Romani", reference: "Romani 13:10", bookId: "ROM", chapter: 13, verse: 10,
  },
  {
    text: "Venite a me, voi tutti che siete travagliati e aggravati, e io vi darò riposo.",
    bookName: "Matteo", reference: "Matteo 11:28", bookId: "MAT", chapter: 11, verse: 28,
  },
  {
    text: "Non temere, perché io sono con te; non ti smarrire, perché io sono il tuo Dio.",
    bookName: "Isaia", reference: "Isaia 41:10", bookId: "ISA", chapter: 41, verse: 10,
  },
  {
    text: "L'Eterno benedica e ti guardi! L'Eterno faccia risplendere il suo volto su di te e ti sia propizio!",
    bookName: "Numeri", reference: "Numeri 6:24-25", bookId: "NUM", chapter: 6, verse: 24,
  },
  {
    text: "Ma quelli che sperano nell'Eterno acquistano nuove forze, s'alzano a volo come aquile.",
    bookName: "Isaia", reference: "Isaia 40:31", bookId: "ISA", chapter: 40, verse: 31,
  },
  {
    text: "La tua parola è una lampada al mio piede e una luce sul mio sentiero.",
    bookName: "Salmi", reference: "Salmo 119:105", bookId: "PSA", chapter: 119, verse: 105,
  },
  {
    text: "Poiché io conosco i pensieri che medito per voi, dice l'Eterno: pensieri di pace e non di male.",
    bookName: "Geremia", reference: "Geremia 29:11", bookId: "JER", chapter: 29, verse: 11,
  },
  {
    text: "L'Eterno è la mia luce e la mia salvezza; di chi temerò?",
    bookName: "Salmi", reference: "Salmo 27:1", bookId: "PSA", chapter: 27, verse: 1,
  },
  {
    text: "Siate forti e coraggiosi, non temete e non vi sgomentate, perché l'Eterno, il vostro Dio, è con voi dovunque andiate.",
    bookName: "Giosuè", reference: "Giosuè 1:9", bookId: "JOS", chapter: 1, verse: 9,
  },
  {
    text: "La carità è paziente, è benigna; la carità non invidia, non si vanta, non si gonfia.",
    bookName: "1 Corinzi", reference: "1 Corinzi 13:4", bookId: "1CO", chapter: 13, verse: 4,
  },
  {
    text: "Se dunque uno è in Cristo, egli è una nuova creatura; le cose vecchie sono passate: ecco, tutte le cose son diventate nuove.",
    bookName: "2 Corinzi", reference: "2 Corinzi 5:17", bookId: "2CO", chapter: 5, verse: 17,
  },
  {
    text: "Io ti ho amato di un amore eterno; perciò ti ho attirato con la mia benignità.",
    bookName: "Geremia", reference: "Geremia 31:3", bookId: "JER", chapter: 31, verse: 3,
  },
  {
    text: "L'Eterno è il mio rifugio e la mia fortezza, il mio Dio in cui confido.",
    bookName: "Salmi", reference: "Salmo 91:2", bookId: "PSA", chapter: 91, verse: 2,
  },
  {
    text: "Il frutto dello Spirito è amore, gioia, pace, pazienza, benignità, bontà, fedeltà, mansuetudine, temperanza.",
    bookName: "Galati", reference: "Galati 5:22", bookId: "GAL", chapter: 5, verse: 22,
  },
  {
    text: "E noi sappiamo che tutte le cose cooperano al bene di quelli che amano Dio.",
    bookName: "Romani", reference: "Romani 8:28", bookId: "ROM", chapter: 8, verse: 28,
  },
  {
    text: "Questa è la giornata che l'Eterno ha fatta; rallegriamoci e giubiliamo in essa.",
    bookName: "Salmi", reference: "Salmo 118:24", bookId: "PSA", chapter: 118, verse: 24,
  },
  {
    text: "L'Eterno è vicino a quelli che hanno il cuor rotto, e salva quelli che hanno lo spirito contrito.",
    bookName: "Salmi", reference: "Salmo 34:18", bookId: "PSA", chapter: 34, verse: 18,
  },
  {
    text: "Io sono la risurrezione e la vita; chi crede in me, anche se muore, vivrà.",
    bookName: "Giovanni", reference: "Giovanni 11:25", bookId: "JHN", chapter: 11, verse: 25,
  },
  {
    text: "Beati i puri di cuore, perché vedranno Iddio.",
    bookName: "Matteo", reference: "Matteo 5:8", bookId: "MAT", chapter: 5, verse: 8,
  },
  {
    text: "Getta sull'Eterno il tuo peso, ed egli ti sosterrà; egli non permetterà mai che il giusto sia smosso.",
    bookName: "Salmi", reference: "Salmo 55:22", bookId: "PSA", chapter: 55, verse: 22,
  },
  {
    text: "Io sono con voi tutti i giorni, sino alla fine dell'età presente.",
    bookName: "Matteo", reference: "Matteo 28:20", bookId: "MAT", chapter: 28, verse: 20,
  },
  {
    text: "La grazia del Signore Gesù Cristo sia con lo spirito vostro.",
    bookName: "Filemone", reference: "Filemone 1:25", bookId: "PHM", chapter: 1, verse: 25,
  },
  {
    text: "Cercate prima il regno di Dio e la sua giustizia, e tutte queste cose vi saranno sopraggiunte.",
    bookName: "Matteo", reference: "Matteo 6:33", bookId: "MAT", chapter: 6, verse: 33,
  },
  {
    text: "Chi dimora nel riparo dell'Altissimo, riposa all'ombra dell'Onnipotente.",
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
