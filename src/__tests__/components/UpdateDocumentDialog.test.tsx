import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import UpdateDocumentDialog from '../../components/DocumentForm/UpdateDocumentDialog';
import type { Document } from '../../types/document';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockDoc: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 3,
  line_item_limit: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultProps = {
  open: true,
  document: mockDoc,
  onSave: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UpdateDocumentDialog', () => {
  it('renders dialog with "Edit Document" title', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    expect(screen.getByText('Edit Document')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Edit Document')).not.toBeInTheDocument();
  });

  it('pre-fills form with document data', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    expect(screen.getByDisplayValue('Test invoice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('shows reference as read-only', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const refInput = screen.getByDisplayValue('INV-001');
    expect(refInput).toBeDisabled();
  });

  it('shows document type as read-only', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const typeInput = screen.getByDisplayValue('invoice');
    expect(typeInput).toBeDisabled();
  });

  it('shows character counter for description', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    expect(screen.getByText('12/30')).toBeInTheDocument();
  });

  it('updates character counter when typing', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Updated' } });

    expect(screen.getByText('7/30')).toBeInTheDocument();
  });

  it('shows validation error when description exceeds 30 chars', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'a'.repeat(31) } });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Description must be 30 characters or less')).toBeInTheDocument();
    });
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('shows validation error when description is empty', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: '' } });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('calls onSave with updated data on valid submit', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Updated description' } });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith({
        description: 'Updated description',
        line_item_limit: 10,
      });
    });
  });

  it('shows API error when onSave rejects', async () => {
    defaultProps.onSave.mockRejectedValueOnce(new Error('Server error'));
    const user = userEvent.setup();
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows Save and Cancel buttons', () => {
    renderWithTheme(<UpdateDocumentDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
