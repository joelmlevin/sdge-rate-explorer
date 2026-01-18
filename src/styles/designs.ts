/**
 * Design system variants for the calendar UI
 * Each design has its own color palette and spacing
 */

export type DesignVariant = 'minimal' | 'professional' | 'geometric';

export interface DesignSystem {
  name: string;
  colors: {
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderLight: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    weekend: {
      bg: string;
      text: string;
    };
    accent: string;
    accentHover: string;
  };
  typography: {
    fontFamily: string;
    dayNumber: string;
    rateValue: string;
    label: string;
  };
  spacing: {
    cellPadding: string;
    cellGap: string;
    sectionGap: string;
  };
  borders: {
    radius: string;
    width: string;
  };
}

export const designs: Record<DesignVariant, DesignSystem> = {
  minimal: {
    name: 'Minimal Modern',
    colors: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceHover: '#F5F5F5',
      border: '#E0E0E0',
      borderLight: '#F0F0F0',
      text: {
        primary: '#1A1A1A',
        secondary: '#666666',
        tertiary: '#999999',
      },
      weekend: {
        bg: '#F8F9FA',
        text: '#495057',
      },
      accent: '#2563EB',
      accentHover: '#1D4ED8',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      dayNumber: 'text-lg font-medium',
      rateValue: 'text-sm font-semibold tabular-nums',
      label: 'text-xs font-medium uppercase tracking-wide',
    },
    spacing: {
      cellPadding: 'p-3',
      cellGap: 'gap-1',
      sectionGap: 'gap-6',
    },
    borders: {
      radius: 'rounded-lg',
      width: 'border',
    },
  },

  professional: {
    name: 'Data-Dense Professional',
    colors: {
      background: '#F8F9FA',
      surface: '#FFFFFF',
      surfaceHover: '#F1F3F5',
      border: '#DEE2E6',
      borderLight: '#E9ECEF',
      text: {
        primary: '#212529',
        secondary: '#495057',
        tertiary: '#6C757D',
      },
      weekend: {
        bg: '#E7F5FF',
        text: '#1971C2',
      },
      accent: '#1971C2',
      accentHover: '#1864AB',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      dayNumber: 'text-base font-semibold',
      rateValue: 'text-xs font-bold tabular-nums',
      label: 'text-[10px] font-semibold uppercase tracking-wider',
    },
    spacing: {
      cellPadding: 'p-2',
      cellGap: 'gap-px',
      sectionGap: 'gap-4',
    },
    borders: {
      radius: 'rounded',
      width: 'border',
    },
  },

  geometric: {
    name: 'Clean Geometric',
    colors: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      surfaceHover: '#F5F5F5',
      border: '#000000',
      borderLight: '#E0E0E0',
      text: {
        primary: '#000000',
        secondary: '#404040',
        tertiary: '#808080',
      },
      weekend: {
        bg: '#FFF9E6',
        text: '#806600',
      },
      accent: '#000000',
      accentHover: '#333333',
    },
    typography: {
      fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
      dayNumber: 'text-xl font-bold',
      rateValue: 'text-sm font-mono tabular-nums',
      label: 'text-xs font-bold uppercase tracking-widest',
    },
    spacing: {
      cellPadding: 'p-4',
      cellGap: 'gap-2',
      sectionGap: 'gap-8',
    },
    borders: {
      radius: 'rounded-none',
      width: 'border-2',
    },
  },
};
