import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../store/useAuthStore';
import React from 'react';
import '@testing-library/jest-dom';

// Mock the auth store
vi.mock('../../../store/useAuthStore', () => {
  const useAuthStore = vi.fn();
  return {
    useAuthStore,
    selectHasHydrated: (state: any) => true,
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement, initialEntry = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/unauthorized" element={<div data-testid="unauthorized-page">Unauthorized</div>} />
          <Route path="/" element={ui}>
            <Route index element={<div data-testid="protected-content">Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('should redirect to /login if not authenticated', () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { isLoggedIn: false, role: null };
      return selector(state);
    });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to /unauthorized if role is not allowed', () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { isLoggedIn: true, role: 'CUSTOMER' };
      return selector(state);
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to /unauthorized when STAFF tries to access ADMIN route (e.g. branch settings)', () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { isLoggedIn: true, role: 'STAFF' };
      return selector(state);
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
        <div data-testid="branch-settings-view">Branch Settings View</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    expect(screen.queryByTestId('branch-settings-view')).not.toBeInTheDocument();
  });

  it('should render children if authenticated and role is allowed', () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { isLoggedIn: true, role: 'ADMIN' };
      return selector(state);
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render children if authenticated and no roles are specified', () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { isLoggedIn: true, role: 'CUSTOMER' };
      return selector(state);
    });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
