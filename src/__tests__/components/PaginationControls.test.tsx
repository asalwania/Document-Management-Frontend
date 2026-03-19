import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import PaginationControls from '../../components/common/Pagination';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  totalCount: 25,
  page: 1,
  pageSize: 10,
  totalPages: 3,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Desktop viewport
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
});

describe('PaginationControls', () => {
  it('shows "Showing X-Y of Z documents" text', () => {
    renderWithTheme(<PaginationControls {...defaultProps} />);

    expect(screen.getByText(/Showing 1–10 of 25 documents/)).toBeInTheDocument();
  });

  it('shows correct range on page 2', () => {
    renderWithTheme(<PaginationControls {...defaultProps} page={2} />);

    expect(screen.getByText(/Showing 11–20 of 25 documents/)).toBeInTheDocument();
  });

  it('shows correct range on last page', () => {
    renderWithTheme(<PaginationControls {...defaultProps} page={3} />);

    expect(screen.getByText(/Showing 21–25 of 25 documents/)).toBeInTheDocument();
  });

  it('renders page size selector with options', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PaginationControls {...defaultProps} />);

    // Open the select dropdown
    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
  });

  it('calls onPageChange when a page button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PaginationControls {...defaultProps} />);

    // Click page 2
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageSizeChange when page size is changed', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PaginationControls {...defaultProps} />);

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: '20' }));

    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
