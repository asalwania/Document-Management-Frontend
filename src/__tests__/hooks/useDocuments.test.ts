import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocuments } from '../../hooks/useDocuments';
import * as documentApi from '../../api/documentApi';
import type { Document, PaginatedResponse } from '../../types/document';

vi.mock('../../api/documentApi');

const mockDoc: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 3,
  line_item_limit: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPaginated: PaginatedResponse<Document> = {
  count: 1,
  page: 1,
  page_size: 10,
  results: [mockDoc],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(documentApi.listDocuments).mockResolvedValue(mockPaginated);
});

describe('useDocuments', () => {
  it('fetches documents when fetchDocuments is called', async () => {
    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.fetchDocuments();
    });

    expect(documentApi.listDocuments).toHaveBeenCalled();
    expect(result.current.documents).toEqual([mockDoc]);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.loading).toBe(false);
  });

  it('sets loading state during fetch', async () => {
    let resolvePromise: (value: PaginatedResponse<Document>) => void;
    vi.mocked(documentApi.listDocuments).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { result } = renderHook(() => useDocuments());

    act(() => {
      result.current.fetchDocuments();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!(mockPaginated);
    });

    expect(result.current.loading).toBe(false);
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(documentApi.listDocuments).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.fetchDocuments();
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.documents).toEqual([]);
  });

  it('handles non-Error rejection', async () => {
    vi.mocked(documentApi.listDocuments).mockRejectedValue('unknown');

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.fetchDocuments();
    });

    expect(result.current.error).toBe('Failed to fetch documents');
  });

  it('refreshes list after createDocument', async () => {
    vi.mocked(documentApi.createDocument).mockResolvedValue(mockDoc);

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.createDocument({
        reference: 'INV-001',
        description: 'Test',
        document_type: 'invoice',
        line_item_limit: 10,
      });
    });

    expect(documentApi.createDocument).toHaveBeenCalled();
    expect(documentApi.listDocuments).toHaveBeenCalled();
  });

  it('refreshes list after updateDocument', async () => {
    vi.mocked(documentApi.updateDocument).mockResolvedValue(mockDoc);

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.updateDocument('INV-001', {
        description: 'Updated',
        line_item_limit: 10,
      });
    });

    expect(documentApi.updateDocument).toHaveBeenCalledWith('INV-001', {
      description: 'Updated',
      line_item_limit: 10,
    });
    expect(documentApi.listDocuments).toHaveBeenCalled();
  });

  it('refreshes list after deleteDocument', async () => {
    vi.mocked(documentApi.deleteDocument).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.deleteDocument('INV-001', true);
    });

    expect(documentApi.deleteDocument).toHaveBeenCalledWith('INV-001', true);
    expect(documentApi.listDocuments).toHaveBeenCalled();
  });

  it('refreshes list after addLineItems', async () => {
    vi.mocked(documentApi.addLineItems).mockResolvedValue({ ...mockDoc, line_item_count: 5 });

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.addLineItems('INV-001', { amount: 2 });
    });

    expect(documentApi.addLineItems).toHaveBeenCalledWith('INV-001', { amount: 2 });
    expect(documentApi.listDocuments).toHaveBeenCalled();
  });

  it('refreshes list after removeLineItems', async () => {
    vi.mocked(documentApi.removeLineItems).mockResolvedValue({ ...mockDoc, line_item_count: 1 });

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.removeLineItems('INV-001', { amount: 2 });
    });

    expect(documentApi.removeLineItems).toHaveBeenCalledWith('INV-001', { amount: 2 });
    expect(documentApi.listDocuments).toHaveBeenCalled();
  });

  it('sets error and re-throws on mutation failure', async () => {
    vi.mocked(documentApi.createDocument).mockRejectedValue(new Error('Duplicate ref'));

    const { result } = renderHook(() => useDocuments());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.createDocument({
          reference: 'INV-001',
          description: 'Test',
          document_type: 'invoice',
          line_item_limit: 10,
        });
      } catch (err) {
        caughtError = err as Error;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError!.message).toBe('Duplicate ref');
    expect(result.current.error).toBe('Duplicate ref');
  });

  it('resets page when search changes', async () => {
    const { result } = renderHook(() => useDocuments());

    act(() => {
      result.current.setSearch('test');
    });

    expect(result.current.search).toBe('test');
    expect(result.current.pagination.page).toBe(1);
  });

  it('resets page when document type changes', async () => {
    const { result } = renderHook(() => useDocuments());

    act(() => {
      result.current.setDocumentType('receipt');
    });

    expect(result.current.documentType).toBe('receipt');
    expect(result.current.pagination.page).toBe(1);
  });
});
