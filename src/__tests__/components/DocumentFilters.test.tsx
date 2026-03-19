import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import DocumentFilters from '../../components/DocumentList/DocumentFilters';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  search: '',
  documentType: '' as const,
  onSearchChange: vi.fn(),
  onDocumentTypeChange: vi.fn(),
  onCreateClick: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DocumentFilters', () => {
  it('renders search input', () => {
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search by reference...')).toBeInTheDocument();
  });

  it('renders type toggle buttons', () => {
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invoice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Receipt' })).toBeInTheDocument();
  });

  it('renders "New Document" button', () => {
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    expect(screen.getByRole('button', { name: /New Document/i })).toBeInTheDocument();
  });

  it('calls onCreateClick when "New Document" is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /New Document/i }));

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDocumentTypeChange when a type toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Invoice' }));

    expect(defaultProps.onDocumentTypeChange).toHaveBeenCalledWith('invoice');
  });

  it('debounces search input by 300ms', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DocumentFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by reference...');
    await user.type(searchInput, 'INV');

    // Should not fire immediately
    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();

    // Should fire after debounce
    await waitFor(() => {
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('INV');
    });
  });

  it('shows initial search value', () => {
    renderWithTheme(<DocumentFilters {...defaultProps} search="existing" />);

    expect(screen.getByDisplayValue('existing')).toBeInTheDocument();
  });
});
