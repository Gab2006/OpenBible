export type HomeCardId = 'continue-reading' | 'daily-verse' | 'stats' | 'testament-ot' | 'testament-nt';
export type StatCardId = 'chapters' | 'saved' | 'streak';

export const DEFAULT_HOME_ORDER: HomeCardId[] = [
  'continue-reading',
  'daily-verse',
  'stats',
  'testament-ot',
  'testament-nt'
];

export const DEFAULT_STATS_ORDER: StatCardId[] = [
  'chapters',
  'saved',
  'streak'
];
