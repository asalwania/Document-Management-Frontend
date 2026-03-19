import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import CreateDocumentDialog from '../../components/DocumentForm/CreateDocumentDialog';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  open: true,
  onSave: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateDocumentDialog', () => {
  it('renders form fields when open', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    expect(screen.getByText('Create Document')).toBeInTheDocument();
    expect(screen.getByLabelText(/Reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Document Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Line Item Limit/i)).toBeInTheDocument();
  });

  it('does not render dialog content when closed', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Create Document')).not.toBeInTheDocument();
  });

  it('shows character counter for description', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    expect(screen.getByText('0/30')).toBeInTheDocument();
  });

  it('updates character counter when typing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    const descInput = screen.getByLabelText(/Description/i);
    await user.type(descInput, 'Hello');

    expect(screen.getByText('5/30')).toBeInTheDocument();
  });

  it('shows validation error when description exceeds 30 chars', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    const refInput = screen.getByLabelText(/Reference/i);
    await user.type(refInput, 'REF-001');

    const descInput = screen.getByLabelText(/Description/i);
    await user.type(descInput, 'a'.repeat(31));

    const createBtn = screen.getByRole('button', { name: 'Create' });
    await user.click(createBtn);

    expect(screen.getByText('Description must be 30 characters or less')).toBeInTheDocument();
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('shows validation error when reference is empty', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    const createBtn = screen.getByRole('button', { name: 'Create' });
    await user.click(createBtn);

    expect(screen.getByText('Reference is required')).toBeInTheDocument();
  });

  it('shows validation error when description is empty', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    const createBtn = screen.getByRole('button', { name: 'Create' });
    await user.click(createBtn);

    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('calls onSave with form data on valid submit', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Reference/i), 'INV-100');
    await user.type(screen.getByLabelText(/Description/i), 'New invoice');

    const createBtn = screen.getByRole('button', { name: 'Create' });
    await user.click(createBtn);

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith({
        reference: 'INV-100',
        description: 'New invoice',
        document_type: 'invoice',
        line_item_limit: 10,
      });
    });
  });

  it('shows API error when onSave rejects', async () => {
    defaultProps.onSave.mockRejectedValueOnce(new Error('Duplicate reference'));
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Reference/i), 'INV-DUP');
    await user.type(screen.getByLabelText(/Description/i), 'Duplicate test');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate reference')).toBeInTheDocument();
    });
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows Create and Cancel buttons', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('has default document type of invoice', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    expect(screen.getByText('Invoice')).toBeInTheDocument();
  });

  it('has default line item limit of 10', () => {
    renderWithTheme(<CreateDocumentDialog {...defaultProps} />);

    const limitInput = screen.getByLabelText(/Line Item Limit/i);
    expect(limitInput).toHaveValue(10);
  });
});
