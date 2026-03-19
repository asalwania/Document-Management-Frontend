import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock('react-dom/client', () => ({
  __esModule: true,
  default: {
    createRoot: createRootMock,
  },
}));

describe('main', () => {
  it('mounts app to #root with ThemeProvider and App', async () => {
    const rootEl = document.createElement('div');
    rootEl.id = 'root';
    document.body.appendChild(rootEl);

    await import('../main');

    expect(createRootMock).toHaveBeenCalledWith(rootEl);
    expect(renderMock).toHaveBeenCalledTimes(1);
    const [app] = renderMock.mock.calls[0];
    expect(app.type).toBe(React.StrictMode);
    const themeProvider = app.props.children;
    expect(themeProvider.type.toString()).toContain('ThemeProvider');

    document.body.removeChild(rootEl);
  });
});
