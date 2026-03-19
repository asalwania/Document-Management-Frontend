import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import AppLayout from '../../components/Layout/AppLayout';

function renderWithTheme(ui: React.ReactElement) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('AppLayout', () => {
  it('renders the app title', () => {
    renderWithTheme(<AppLayout>Content</AppLayout>);

    expect(screen.getByText('Document Management')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithTheme(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders a sticky app bar', () => {
    renderWithTheme(<AppLayout>Content</AppLayout>);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
