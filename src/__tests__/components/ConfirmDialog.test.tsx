import type React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Document } from '../../types/document';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const docWithoutItems: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 0,
  line_item_limit: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const docWithItems: Document = {
  ...docWithoutItems,
  reference: 'INV-002',
  line_item_count: 5,
};

const defaultProps = {
  open: true,
  document: docWithoutItems,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmDialog', () => {
  it('renders dialog with document reference', () => {
    renderWithTheme(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Document')).toBeInTheDocument();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithTheme(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Delete Document')).not.toBeInTheDocument();
  });

  it('shows "Are you sure" confirmation message', () => {
    renderWithTheme(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  describe('document without line items', () => {
    it('does not show warning alert', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} />);

      expect(screen.queryByText(/line item/i)).not.toBeInTheDocument();
    });

    it('does not show force delete checkbox', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('Delete button is enabled', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    });

    it('calls onConfirm with forceDelete=false on click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ConfirmDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(false);
    });
  });

  describe('document with line items', () => {
    it('shows warning about line items', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} document={docWithItems} />);

      expect(screen.getByText(/This document has 5 line items/)).toBeInTheDocument();
    });

    it('shows force delete checkbox', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} document={docWithItems} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/Force delete/)).toBeInTheDocument();
    });

    it('Delete button is disabled until checkbox checked', () => {
      renderWithTheme(<ConfirmDialog {...defaultProps} document={docWithItems} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    it('enables Delete button after checking force delete', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ConfirmDialog {...defaultProps} document={docWithItems} />);

      await user.click(screen.getByRole('checkbox'));

      expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    });

    it('calls onConfirm with forceDelete=true after checking', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ConfirmDialog {...defaultProps} document={docWithItems} />);

      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(true);
    });
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows singular "item" for count of 1', () => {
    const docWith1Item = { ...docWithItems, line_item_count: 1 };
    renderWithTheme(<ConfirmDialog {...defaultProps} document={docWith1Item} />);

    expect(screen.getByText(/This document has 1 line item\./)).toBeInTheDocument();
  });
});
