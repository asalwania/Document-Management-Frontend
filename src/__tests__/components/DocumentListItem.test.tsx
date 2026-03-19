import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { Table, TableBody } from '@mui/material';
import { theme } from '../../theme';
import DocumentListItem from '../../components/DocumentList/DocumentListItem';
import type { Document } from '../../types/document';

function renderWithTheme(ui: React.ReactElement) {
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

  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockDoc: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 3,
  line_item_limit: 10,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const docNoItems: Document = {
  ...mockDoc,
  reference: 'REC-001',
  document_type: 'receipt',
  line_item_count: 0,
};

const defaultProps = {
  document: mockDoc,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAddItems: vi.fn(),
  onRemoveItems: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

function renderInTable(ui: React.ReactElement) {
  return renderWithTheme(
    <Table>
      <TableBody>{ui}</TableBody>
    </Table>,
  );
}

describe('DocumentListItem', () => {
  it('renders document reference', () => {
    renderInTable(<DocumentListItem {...defaultProps} />);

    expect(screen.getByText('INV-001')).toBeInTheDocument();
  });

  it('renders document description', () => {
    renderInTable(<DocumentListItem {...defaultProps} />);

    expect(screen.getByText('Test invoice')).toBeInTheDocument();
  });

  it('renders type chip', () => {
    renderInTable(<DocumentListItem {...defaultProps} />);

    expect(screen.getByText('Invoice')).toBeInTheDocument();
  });

  it('renders line item count', () => {
    renderInTable(<DocumentListItem {...defaultProps} />);

    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders created date', () => {
    renderInTable(<DocumentListItem {...defaultProps} />);

    const formatted = new Date('2024-01-15T10:00:00Z').toLocaleDateString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderInTable(<DocumentListItem {...defaultProps} />);

    await user.click(screen.getByLabelText('Edit'));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockDoc);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderInTable(<DocumentListItem {...defaultProps} />);

    await user.click(screen.getByLabelText('Delete'));

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockDoc);
  });

  it('calls onAddItems when add button is clicked', async () => {
    const user = userEvent.setup();
    renderInTable(<DocumentListItem {...defaultProps} />);

    await user.click(screen.getByLabelText('Add Line Items'));

    expect(defaultProps.onAddItems).toHaveBeenCalledWith(mockDoc);
  });

  it('calls onRemoveItems when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderInTable(<DocumentListItem {...defaultProps} />);

    // The Tooltip wraps with a span; find the actual button inside
    const removeSpan = screen.getByLabelText('Remove Line Items');
    const removeBtn = removeSpan.closest('button') ?? removeSpan.querySelector('button');
    await user.click(removeBtn!);

    expect(defaultProps.onRemoveItems).toHaveBeenCalledWith(mockDoc);
  });

  it('disables remove button when line_item_count is 0', () => {
    renderInTable(<DocumentListItem {...defaultProps} document={docNoItems} />);

    // MUI wraps disabled IconButton in a span for Tooltip; check the button element
    const removeSpan = screen.getByLabelText('Remove Line Items');
    const removeBtn = removeSpan.querySelector('button');
    expect(removeBtn).toBeDisabled();
  });

  it('renders receipt type chip for receipt documents', () => {
    renderInTable(<DocumentListItem {...defaultProps} document={docNoItems} />);

    expect(screen.getByText('Receipt')).toBeInTheDocument();
  });
});
