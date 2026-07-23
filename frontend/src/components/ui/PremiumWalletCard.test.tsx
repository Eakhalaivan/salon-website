import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { PremiumWalletCard } from './PremiumWalletCard';

describe('PremiumWalletCard Component', () => {
  it('renders correctly with default props', () => {
    render(<PremiumWalletCard />);
    expect(screen.getByText(/Lumina/i)).toBeInTheDocument();
    expect(screen.getByText(/Elite Premier Member/i)).toBeInTheDocument();
    expect(screen.getByText(/0\.00/i)).toBeInTheDocument();
  });

  it('displays the correct balance and wallet id', () => {
    render(<PremiumWalletCard balance={1500.5} walletId="1234" />);
    expect(screen.getByText(/1,500\.50/)).toBeInTheDocument();
    expect(screen.getByText(/1234/)).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<PremiumWalletCard isLoading={true} />);
    expect(screen.getByText(/---/)).toBeInTheDocument();
  });
});
