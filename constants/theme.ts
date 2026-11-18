export const THEME = {
  colors: {
    // Backgrounds
    background: '#0c0e0c', // Deep warm earthy charcoal
    surface: '#131613',    // Card surface
    surfaceSubtle: '#181c18',
    surfaceActive: '#1f241f',

    // Borders
    border: '#262c26',     // Subtle moss border
    borderHighlight: '#364036',

    // Primary Accents (Botanical Forest Green)
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    primaryGlow: 'rgba(16, 185, 129, 0.15)',

    // Mitti / Clay / Warm Sand Accents
    mitti: '#dcae7c',
    mittiLight: '#e2b887',
    mittiDark: '#be8c59',
    mittiGlow: 'rgba(220, 174, 124, 0.15)',

    // Text & Foregrounds
    text: '#f3f4f1',         // Warm off-white
    textMuted: '#a8a29e',    // Stone muted
    textSubtle: '#78716c',

    // Feedback
    success: '#10b981',
    error: '#f87171',
    errorSurface: '#2b1414',
    warning: '#f59e0b',
  },
  gradients: {
    primaryButton: ['#059669', '#10b981', '#dcae7c'] as const,
    progressBar: ['#059669', '#10b981', '#dcae7c'] as const,
    heroText: ['#10b981', '#dcae7c'] as const,
    brandIcon: ['#059669', '#dcae7c'] as const,
    cardGlow: ['rgba(16, 185, 129, 0.08)', 'rgba(220, 174, 124, 0.03)'] as const,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  }
};
