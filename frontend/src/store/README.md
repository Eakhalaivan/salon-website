# State Management Architecture

This document defines the boundaries between server-state and client-state for LuxeSuite.
Read this before adding new state to understand _where_ it belongs.

---

## Server State → `src/hooks/api/`

All data fetched from the backend API (appointments, services, customers, staff, products,
billing, subscriptions) is owned by **TanStack Query**. It lives in the hooks under `hooks/api/`.

**Rules:**
- ✅ Use `useQuery` for reads, `useMutation` for writes.
- ✅ Let TanStack Query handle caching, deduplication, loading/error states, and background refetching.
- ❌ **Never copy API response data into a Zustand store.** Doing so creates a second source of truth that falls stale and requires manual cache invalidation.

**Hooks:**
| Hook file | What it owns |
|-----------|--------------|
| `useAppointments.ts` | Appointments, services list |
| `useCustomers.ts` | Customer profiles |
| `useProducts.ts` | Product catalog |
| `useStaff.ts` | Staff members |
| `useSubscriptions.ts` | Subscription plans & customer subscriptions |
| `useBilling.ts` | Invoices & payments |

---

## Client / UI State → `src/store/`

UI-only state that has **no backend equivalent** lives in **Zustand stores**. This includes
auth session metadata, user preferences, and transient wizard state.

**Rules:**
- ✅ Use Zustand for state that is purely derived from user interaction, not from API data.
- ✅ Use `persist` middleware to survive page reloads where appropriate.
- ✅ Use `devtools` middleware in development to inspect store via Redux DevTools extension.
- ❌ **Never put raw JWT tokens into Zustand/localStorage.** Tokens are stored in HttpOnly cookies
  and are invisible to JavaScript — this is intentional XSS protection. The backend's
  `/auth/refresh` endpoint handles renewal automatically via `axiosClient.ts`.

**Stores:**
| Store file | What it owns |
|------------|--------------|
| `useAuthStore.ts` | `isLoggedIn`, `role`, `branchId`, user display info |
| `useThemeStore.ts` | `light/dark` theme preference |
| `useBookingStore.ts` | Multi-step booking wizard state (step, specialist, services, time) |

---

## Why Not Redux?

Redux (Redux Toolkit) was explicitly evaluated and rejected for this project:

1. **TanStack Query solves 80% of the problem.** Redux is commonly adopted for server-state
   management, but TQ already handles that better (with caching, automatic background refetching,
   and query deduplication that RTK Query cannot match without significant configuration).
2. **Client state is simple and lightweight.** The remaining purely client-side state doesn't have
   deeply nested cross-slice derived state, complex middleware pipelines, or team conventions that
   would justify Redux's boilerplate overhead.
3. **Zustand + React Query is the modern production standard** for React apps at this scale,
   used by companies like Linear, Vercel, and others.
