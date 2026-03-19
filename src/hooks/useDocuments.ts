import { useState, useCallback } from 'react';
import type {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  LineItemPayload,
  DocumentFilters,
} from '../types/document';
import * as documentApi from '../api/documentApi';
import { usePagination } from './usePagination';

export function useDocuments() {
  const pagination = usePagination();
  const { page, pageSize, setTotalCount, resetPage } = pagination;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | ''>('');

  const filters: DocumentFilters = {
    page,
    page_size: pageSize,
    search: search || undefined,
    document_type: documentType || undefined,
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentFilters: DocumentFilters = {
        page,
        page_size: pageSize,
        search: search || undefined,
        document_type: documentType || undefined,
      };
      const data = await documentApi.listDocuments(currentFilters);
      setDocuments(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, documentType, setTotalCount]);

  const createDocument = useCallback(
    async (payload: CreateDocumentPayload) => {
      setError(null);
      try {
        const doc = await documentApi.createDocument(payload);
        await fetchDocuments();
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create document';
        setError(message);
        throw err;
      }
    },
    [fetchDocuments],
  );

  const updateDocument = useCallback(
    async (reference: string, payload: UpdateDocumentPayload) => {
      setError(null);
      try {
        const doc = await documentApi.updateDocument(reference, payload);
        await fetchDocuments();
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update document';
        setError(message);
        throw err;
      }
    },
    [fetchDocuments],
  );

  const deleteDocument = useCallback(
    async (reference: string, forceDelete = false) => {
      setError(null);
      try {
        await documentApi.deleteDocument(reference, forceDelete);
        await fetchDocuments();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete document';
        setError(message);
        throw err;
      }
    },
    [fetchDocuments],
  );

  const addLineItems = useCallback(
    async (reference: string, payload: LineItemPayload) => {
      setError(null);
      try {
        const doc = await documentApi.addLineItems(reference, payload);
        await fetchDocuments();
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add line items';
        setError(message);
        throw err;
      }
    },
    [fetchDocuments],
  );

  const removeLineItems = useCallback(
    async (reference: string, payload: LineItemPayload) => {
      setError(null);
      try {
        const doc = await documentApi.removeLineItems(reference, payload);
        await fetchDocuments();
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove line items';
        setError(message);
        throw err;
      }
    },
    [fetchDocuments],
  );

  return {
    documents,
    totalCount: pagination.totalCount,
    loading,
    error,
    filters,
    search,
    documentType,
    setSearch: (value: string) => {
      setSearch(value);
      resetPage();
    },
    setDocumentType: (value: 'invoice' | 'receipt' | '') => {
      setDocumentType(value);
      resetPage();
    },
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    addLineItems,
    removeLineItems,
    pagination,
  };
}
