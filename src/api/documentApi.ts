import axiosClient from './axiosClient';
import type {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  LineItemPayload,
  DocumentFilters,
  PaginatedResponse,
} from '../types/document';

export async function createDocument(payload: CreateDocumentPayload): Promise<Document> {
  const response = await axiosClient.post<Document>('/documents/', payload);
  return response.data;
}

export async function getDocument(reference: string): Promise<Document> {
  const response = await axiosClient.get<Document>(`/documents/${reference}/`);
  return response.data;
}

export async function listDocuments(
  filters: DocumentFilters,
): Promise<PaginatedResponse<Document>> {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.page_size,
  };
  if (filters.search) params.search = filters.search;
  if (filters.document_type) params.document_type = filters.document_type;

  const response = await axiosClient.get<PaginatedResponse<Document>>('/documents/', { params });
  return response.data;
}

export async function updateDocument(
  reference: string,
  payload: UpdateDocumentPayload,
): Promise<Document> {
  const response = await axiosClient.put<Document>(`/documents/${reference}/`, payload);
  return response.data;
}

export async function deleteDocument(reference: string, forceDelete: boolean): Promise<void> {
  await axiosClient.delete(`/documents/${reference}/`, {
    data: { force_delete: forceDelete },
  });
}

export async function addLineItems(reference: string, payload: LineItemPayload): Promise<Document> {
  const response = await axiosClient.put<Document>(`/documents/${reference}/line-items/`, payload);
  return response.data;
}

export async function removeLineItems(
  reference: string,
  payload: LineItemPayload,
): Promise<Document> {
  const response = await axiosClient.delete<Document>(`/documents/${reference}/line-items/`, {
    data: payload,
  });
  return response.data;
}
