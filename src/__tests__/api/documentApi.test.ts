import { describe, expect, it, vi, beforeEach } from 'vitest';
import axiosClient from '../../api/axiosClient';
import {
  createDocument,
  getDocument,
  listDocuments,
  updateDocument,
  deleteDocument,
  addLineItems,
  removeLineItems,
} from '../../api/documentApi';
import type { Document, PaginatedResponse } from '../../types/document';

vi.mock('../../api/axiosClient');

const mockDoc: Document = {
  reference: 'INV-001',
  description: 'Test invoice',
  document_type: 'invoice',
  line_item_count: 3,
  line_item_limit: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createDocument', () => {
  it('posts to /documents/ and returns the document', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: mockDoc });

    const payload = {
      reference: 'INV-001',
      description: 'Test invoice',
      document_type: 'invoice' as const,
      line_item_limit: 10,
    };
    const result = await createDocument(payload);

    expect(axiosClient.post).toHaveBeenCalledWith('/documents/', payload);
    expect(result).toEqual(mockDoc);
  });
});

describe('getDocument', () => {
  it('gets /documents/:reference/ and returns the document', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: mockDoc });

    const result = await getDocument('INV-001');

    expect(axiosClient.get).toHaveBeenCalledWith('/documents/INV-001/');
    expect(result).toEqual(mockDoc);
  });
});

describe('listDocuments', () => {
  it('passes filters as query params', async () => {
    const paginated: PaginatedResponse<Document> = {
      count: 1,
      page: 1,
      page_size: 10,
      results: [mockDoc],
    };
    vi.mocked(axiosClient.get).mockResolvedValue({ data: paginated });

    const result = await listDocuments({ page: 1, page_size: 10 });

    expect(axiosClient.get).toHaveBeenCalledWith('/documents/', {
      params: { page: 1, page_size: 10 },
    });
    expect(result.results).toHaveLength(1);
  });

  it('includes search and document_type when provided', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: { count: 0, page: 1, page_size: 10, results: [] },
    });

    await listDocuments({
      page: 1,
      page_size: 10,
      search: 'INV',
      document_type: 'invoice',
    });

    expect(axiosClient.get).toHaveBeenCalledWith('/documents/', {
      params: { page: 1, page_size: 10, search: 'INV', document_type: 'invoice' },
    });
  });
});

describe('updateDocument', () => {
  it('patches /documents/:reference/ and returns updated document', async () => {
    const updated = { ...mockDoc, description: 'Updated' };
    vi.mocked(axiosClient.put).mockResolvedValue({ data: updated });

    const payload = { description: 'Updated', line_item_limit: 10 };
    const result = await updateDocument('INV-001', payload);

    expect(axiosClient.put).toHaveBeenCalledWith('/documents/INV-001/', payload);
    expect(result.description).toBe('Updated');
  });
});

describe('deleteDocument', () => {
  it('sends DELETE with force_delete in body', async () => {
    vi.mocked(axiosClient.delete).mockResolvedValue({ data: undefined });

    await deleteDocument('INV-001', true);

    expect(axiosClient.delete).toHaveBeenCalledWith('/documents/INV-001/', {
      data: { force_delete: true },
    });
  });

  it('sends force_delete false by default', async () => {
    vi.mocked(axiosClient.delete).mockResolvedValue({ data: undefined });

    await deleteDocument('INV-001', false);

    expect(axiosClient.delete).toHaveBeenCalledWith('/documents/INV-001/', {
      data: { force_delete: false },
    });
  });
});

describe('addLineItems', () => {
  it('puts to /documents/:reference/line-items/', async () => {
    const updated = { ...mockDoc, line_item_count: 5 };
    vi.mocked(axiosClient.put).mockResolvedValue({ data: updated });

    const result = await addLineItems('INV-001', { amount: 2 });

    expect(axiosClient.put).toHaveBeenCalledWith('/documents/INV-001/line-items/', { amount: 2 });
    expect(result.line_item_count).toBe(5);
  });
});

describe('removeLineItems', () => {
  it('sends DELETE to /documents/:reference/line-items/ with body', async () => {
    const updated = { ...mockDoc, line_item_count: 1 };
    vi.mocked(axiosClient.delete).mockResolvedValue({ data: updated });

    const result = await removeLineItems('INV-001', { amount: 2 });

    expect(axiosClient.delete).toHaveBeenCalledWith('/documents/INV-001/line-items/', {
      data: { amount: 2 },
    });
    expect(result.line_item_count).toBe(1);
  });
});

describe('error handling', () => {
  it('propagates axios errors', async () => {
    vi.mocked(axiosClient.get).mockRejectedValue(new Error('Network error'));

    await expect(getDocument('INV-001')).rejects.toThrow('Network error');
  });
});
