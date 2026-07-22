import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, selectHasHydrated } from '../../store/useAuthStore';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const hasHydrated = useAuthStore(selectHasHydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);

  // Wait for the persist middleware to rehydrate from localStorage before
  // making any redirect decisions. Without this guard, `isLoggedIn` is always
  // `false` on the first render after a login navigation, which causes the
  // page to redirect back to /login even though authentication succeeded.
  if (!hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
