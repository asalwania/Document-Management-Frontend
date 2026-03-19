import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import LineItemDialog from '../../components/DocumentForm/LineItemDialog';
import type { Document } from '../../types/document';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockDoc: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 5,
  line_item_limit: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultProps = {
  open: true,
  mode: 'add' as const,
  document: mockDoc,
  onSave: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LineItemDialog', () => {
  describe('add mode', () => {
    it('renders dialog with "Add Line Items" title', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      expect(screen.getByText(/Add Line Items/)).toBeInTheDocument();
      expect(screen.getByText(/INV-001/)).toBeInTheDocument();
    });

    it('shows current line item count', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('shows preview after adding', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      // Default amount is 1, so preview should be 6/10
      expect(screen.getByText('6 / 10')).toBeInTheDocument();
    });

    it('updates preview when amount changes', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '3' } });

      expect(screen.getByText('8 / 10')).toBeInTheDocument();
    });

    it('shows warning when approaching limit', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '4' } });

      expect(screen.getByText(/Approaching limit/)).toBeInTheDocument();
    });

    it('shows warning when filling to limit', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '5' } });

      expect(screen.getByText(/fill the document to its limit/)).toBeInTheDocument();
    });

    it('shows error when exceeding limit', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '6' } });

      expect(screen.getByText(/would exceed the limit/)).toBeInTheDocument();
    });

    it('blocks submit when exceeding limit', async () => {
      const user = userEvent.setup();
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '6' } });

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText(/Cannot exceed limit/)).toBeInTheDocument();
      });
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with amount on valid submit', async () => {
      const user = userEvent.setup();
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '3' } });

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(3);
      });
    });

    it('shows API error when onSave rejects', async () => {
      defaultProps.onSave.mockRejectedValueOnce(new Error('Limit exceeded'));
      const user = userEvent.setup();
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText('Limit exceeded')).toBeInTheDocument();
      });
    });

    it('shows Add button with primary color', () => {
      renderWithTheme(<LineItemDialog {...defaultProps} />);

      const addBtn = screen.getByRole('button', { name: 'Add' });
      expect(addBtn).toBeInTheDocument();
    });
  });

  describe('remove mode', () => {
    const removeProps = { ...defaultProps, mode: 'remove' as const };

    it('renders dialog with "Remove Line Items" title', () => {
      renderWithTheme(<LineItemDialog {...removeProps} />);

      expect(screen.getByText(/Remove Line Items/)).toBeInTheDocument();
    });

    it('shows preview after removing', () => {
      renderWithTheme(<LineItemDialog {...removeProps} />);

      // Default amount 1, so preview should be 4/10
      expect(screen.getByText('4 / 10')).toBeInTheDocument();
    });

    it('shows error when removing more than available', () => {
      renderWithTheme(<LineItemDialog {...removeProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '6' } });

      expect(screen.getByText(/Cannot remove 6 items/)).toBeInTheDocument();
    });

    it('blocks submit when removing more than available', async () => {
      const user = userEvent.setup();
      renderWithTheme(<LineItemDialog {...removeProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '6' } });

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => {
        expect(screen.getByText(/Cannot remove more than 5/)).toBeInTheDocument();
      });
      expect(removeProps.onSave).not.toHaveBeenCalled();
    });

    it('shows warning when removing all items', () => {
      renderWithTheme(<LineItemDialog {...removeProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '5' } });

      expect(screen.getByText(/remove all line items/)).toBeInTheDocument();
    });

    it('calls onSave with amount on valid submit', async () => {
      const user = userEvent.setup();
      renderWithTheme(<LineItemDialog {...removeProps} />);

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '2' } });

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => {
        expect(removeProps.onSave).toHaveBeenCalledWith(2);
      });
    });

    it('shows Remove button with warning color', () => {
      renderWithTheme(<LineItemDialog {...removeProps} />);

      const removeBtn = screen.getByRole('button', { name: 'Remove' });
      expect(removeBtn).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    renderWithTheme(<LineItemDialog {...defaultProps} open={false} />);

    expect(screen.queryByText(/Line Items/)).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<LineItemDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets amount to 1 when dialog opens', () => {
    const { rerender } = renderWithTheme(<LineItemDialog {...defaultProps} open={false} />);

    rerender(
      <ThemeProvider theme={theme}>
        <LineItemDialog {...defaultProps} open />
      </ThemeProvider>,
    );

    const amountInput = screen.getByLabelText(/Amount/i);
    expect(amountInput).toHaveValue(1);
  });
});
