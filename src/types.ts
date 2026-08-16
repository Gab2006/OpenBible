/** Canali RGB separati da spazio, es. "250 246 239" — per Tailwind <alpha-value> */
export interface ThemeColors {
  bg: string;
  text: string;
}

export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  light: ThemeColors;
  dark: ThemeColors;
  /** Canali RGB per accent, es. "184 145 47" */
  accent: string;
  texture?: {
    light: string;
    dark: string;
  };
  backgroundImage?: {
    light: string;
    dark: string;
  };
  backgroundSize?: {
    light: string;
    dark: string;
  };
  patternOpacity: {
    light: number;
    dark: number;
  };
}

// Converte canali RGB "250 246 239" → "#FAF6EF"
export function rgbChannelsToHex(channels: string): string {
  return '#' + channels.split(' ').map(n => Number(n).toString(16).padStart(2, '0')).join('');
}

// ── Temi ────────────────────────────────────────────────────────

export const APP_THEMES: AppTheme[] = [
  {
    id: 'classic',
    name: 'Classico',
    emoji: '📖',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    patternOpacity: { light: 0, dark: 0 },
  },
  {
    id: 'cross',
    name: 'La Croce',
    emoji: '✝️',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    backgroundImage: {
      light: '/themes/theme-cross-light.png',
      dark: '/themes/theme-cross.png'
    },
    patternOpacity: { light: 0.04, dark: 0.03 },
    texture: {
      light: 'radial-gradient(circle at 30% 70%, rgba(139,105,20,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,105,20,0.03) 0%, transparent 50%)',
      dark: 'radial-gradient(circle at 30% 70%, rgba(232,217,192,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(232,217,192,0.02) 0%, transparent 50%)',
    },
  },
  {
    id: 'angel',
    name: 'Angelo',
    emoji: '👼',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    backgroundImage: {
      light: '/themes/theme-angel-light.png',
      dark: '/themes/theme-angel.png'
    },
    backgroundSize: {
      light: '200%', // Zoom compensato per pareggiare la versione scura
      dark: '150%'
    },
    patternOpacity: { light: 0.04, dark: 0.03 },
    texture: {
      light: 'radial-gradient(ellipse at 50% 0%, rgba(108,123,212,0.05) 0%, transparent 60%)',
      dark: 'radial-gradient(ellipse at 50% 0%, rgba(108,123,212,0.04) 0%, transparent 50%), radial-gradient(ellipse at center, transparent 40%, rgba(10,15,30,0.15) 100%)',
    },
  },
  {
    id: 'halo',
    name: 'Aureola',
    emoji: '⭕',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    backgroundImage: {
      light: '/themes/theme-halo-light.png',
      dark: '/themes/theme-halo.png'
    },
    patternOpacity: { light: 0.04, dark: 0.03 },
    texture: {
      light: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(107,142,35,0.015) 3px, rgba(107,142,35,0.015) 4px)',
      dark: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(216,222,200,0.02) 3px, rgba(216,222,200,0.02) 4px)',
    },
  },
  {
    id: 'face',
    name: 'Il Volto',
    emoji: '👤',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    backgroundImage: {
      light: '/themes/theme-face-light.png',
      dark: '/themes/theme-face.png'
    },
    patternOpacity: { light: 0.04, dark: 0.03 },
    texture: {
      light: 'linear-gradient(135deg, rgba(184,92,110,0.03) 0%, transparent 50%, rgba(184,92,110,0.02) 100%)',
      dark: 'linear-gradient(135deg, rgba(232,214,218,0.02) 0%, transparent 50%, rgba(232,214,218,0.015) 100%)',
    },
  },
  {
    id: 'dove',
    name: 'Colomba',
    emoji: '🕊️',
    light: { bg: '250 246 239', text: '43 38 32' },
    dark: { bg: '26 25 23', text: '237 230 217' },
    accent: '184 145 47',
    backgroundImage: {
      light: '/themes/theme-dove-light.png',
      dark: '/themes/theme-dove.png'
    },
    patternOpacity: { light: 0.04, dark: 0.03 },
    texture: {
      light: 'linear-gradient(180deg, rgba(74,144,217,0.04) 0%, transparent 40%, rgba(74,144,217,0.02) 100%)',
      dark: 'linear-gradient(180deg, rgba(74,144,217,0.03) 0%, transparent 40%, rgba(74,144,217,0.02) 100%)',
    },
  },
];
