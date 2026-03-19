import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import DocumentList from '../../components/DocumentList/DocumentList';
import type { Document } from '../../types/document';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockDocs: Document[] = [
  {
    reference: 'INV-001',
    description: 'First invoice',
    document_type: 'invoice',
    line_item_count: 3,
    line_item_limit: 10,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    reference: 'REC-002',
    description: 'Second receipt',
    document_type: 'receipt',
    line_item_count: 0,
    line_item_limit: 5,
    created_at: '2024-02-01T12:00:00Z',
    updated_at: '2024-02-01T12:00:00Z',
  },
];

const defaultProps = {
  documents: mockDocs,
  loading: false,
  error: null,
  search: '',
  documentType: '' as const,
  totalCount: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  onSearchChange: vi.fn(),
  onDocumentTypeChange: vi.fn(),
  onCreateClick: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAddItems: vi.fn(),
  onRemoveItems: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onErrorClose: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default to desktop viewport
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

describe('DocumentList', () => {
  it('renders document references in the list', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('REC-002')).toBeInTheDocument();
  });

  it('renders document descriptions', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByText('First invoice')).toBeInTheDocument();
    expect(screen.getByText('Second receipt')).toBeInTheDocument();
  });

  it('renders type chips', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    // "Invoice" and "Receipt" appear in both filter toggles and type chips
    const invoiceElements = screen.getAllByText('Invoice');
    expect(invoiceElements.length).toBeGreaterThanOrEqual(2);
    const receiptElements = screen.getAllByText('Receipt');
    expect(receiptElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders line item counts', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    expect(screen.getByText('0 / 5')).toBeInTheDocument();
  });

  it('shows empty state when no documents', () => {
    renderWithTheme(<DocumentList {...defaultProps} documents={[]} totalCount={0} />);

    expect(screen.getByText('No documents found')).toBeInTheDocument();
    expect(screen.getByText(/Create a new document or adjust your filters/)).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    renderWithTheme(<DocumentList {...defaultProps} loading documents={[]} />);

    expect(screen.queryByText('INV-001')).not.toBeInTheDocument();
    expect(screen.queryByText('No documents found')).not.toBeInTheDocument();
  });

  it('does not show documents while loading', () => {
    renderWithTheme(<DocumentList {...defaultProps} loading />);

    expect(screen.queryByText('INV-001')).not.toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search by reference...')).toBeInTheDocument();
  });

  it('renders filter toggle buttons', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invoice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Receipt' })).toBeInTheDocument();
  });

  it('renders "New Document" button', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByRole('button', { name: /New Document/i })).toBeInTheDocument();
  });

  it('calls onCreateClick when "New Document" button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DocumentList {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /New Document/i }));

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders table headers on desktop', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders pagination when documents exist', () => {
    renderWithTheme(<DocumentList {...defaultProps} />);

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
  });

  it('does not render pagination when no documents', () => {
    renderWithTheme(<DocumentList {...defaultProps} documents={[]} totalCount={0} />);

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('shows error snackbar when error is set', () => {
    renderWithTheme(<DocumentList {...defaultProps} error="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('search input triggers debounced search', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DocumentList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by reference...');
    await user.type(searchInput, 'INV');

    // Wait for debounce (300ms) to fire
    await waitFor(() => {
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('INV');
    });
  });
});
