/**
 * useAuthStore — Client-side auth session state (Zustand).
 *
 * Stores only the metadata needed for UI routing and display:
 *   - isLoggedIn / role / branchId: drive ProtectedRoute gating and navigation.
 *   - user: display name and email for profile UI, populated after login.
 *
 * ⚠️  JWTs are intentionally NOT stored here. The access token is handled via
 * HttpOnly cookies and transparently refreshed by axiosClient.ts interceptors.
 * Storing tokens in localStorage would create an XSS vulnerability.
 *
 * Server-state (profile details, appointments, etc.) → hooks/api/, not this store.
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UserInfo {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  staffId?: number;
  customerId?: number;
}

interface AuthState {
  // --- State ---
  isLoggedIn: boolean;
  role: string | null;
  branchId: number | null;
  user: UserInfo | null;

  // --- Actions ---
  setAuth: (role: string, branchId: number | null, user?: UserInfo) => void;
  logout: () => void;

  // --- Selectors (use as: useAuthStore(selectIsAuthenticated)) ---
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isLoggedIn: false,
        role: null,
        branchId: null,
        user: null,

        // Actions
        setAuth: (role, branchId, user) =>
          set({ isLoggedIn: true, role, branchId, user: user ?? null }, false, 'auth/setAuth'),

        logout: () =>
          set({ isLoggedIn: false, role: null, branchId: null, user: null }, false, 'auth/logout'),

        // Selector-style helper (avoids coupling callers to isLoggedIn naming)
        isAuthenticated: () => get().isLoggedIn,
      }),
      {
        name: 'luxesuite-auth',
        // Only persist non-sensitive UI metadata.
        // Tokens live in HttpOnly cookies and are never put in storage.
        partialize: (state) => ({
          isLoggedIn: state.isLoggedIn,
          role: state.role,
          branchId: state.branchId,
          user: state.user,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// --- Colocated Selectors ---
// Usage: const role = useAuthStore(selectRole);
// This is more efficient than destructuring the whole store.
export const selectIsLoggedIn = (s: AuthState) => s.isLoggedIn;
export const selectRole = (s: AuthState) => s.role;
export const selectBranchId = (s: AuthState) => s.branchId;
export const selectUser = (s: AuthState) => s.user;
