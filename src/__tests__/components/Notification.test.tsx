import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import Notification from '../../components/common/ErrorAlert';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('Notification', () => {
  it('renders success message', () => {
    renderWithTheme(
      <Notification open message="Document created" severity="success" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Document created')).toBeInTheDocument();
  });

  it('renders error message', () => {
    renderWithTheme(
      <Notification open message="Something went wrong" severity="error" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithTheme(
      <Notification open={false} message="Hidden" severity="success" onClose={vi.fn()} />,
    );

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<Notification open message="Closeable" severity="success" onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    await user.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
