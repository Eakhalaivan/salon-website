/**
 * useThemeStore — User's visual theme preference (Zustand).
 *
 * Manages light/dark mode and persists the preference so it survives
 * page reloads. Also respects the OS-level prefers-color-scheme on first visit.
 *
 * Server-state is not involved here; this is purely a client-side preference.
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  // --- State ---
  theme: Theme;

  // --- Actions ---
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/** Reads the OS media preference as a fallback on first visit. */
const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        // Default to OS preference; overridden by persisted value on subsequent visits.
        theme: getSystemTheme(),

        toggleTheme: () =>
          set(
            (state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }),
            false,
            'theme/toggle'
          ),

        setTheme: (theme) =>
          set({ theme }, false, 'theme/set'),
      }),
      {
        name: 'luxesuite-theme', // localStorage key
      }
    ),
    { name: 'ThemeStore' }
  )
);

// --- Colocated Selectors ---
export const selectTheme = (s: ThemeState) => s.theme;
export const selectIsDark = (s: ThemeState) => s.theme === 'dark';
