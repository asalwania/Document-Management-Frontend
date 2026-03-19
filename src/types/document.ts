export interface Document {
  reference: string;
  description: string;
  document_type: 'invoice' | 'receipt';
  line_item_count: number;
  line_item_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentPayload {
  reference: string;
  description: string;
  document_type: 'invoice' | 'receipt';
  line_item_limit: number;
}

export interface UpdateDocumentPayload {
  description: string;
  line_item_limit: number;
}

export interface LineItemPayload {
  amount: number;
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  results: T[];
}

export interface DocumentFilters {
  search?: string;
  document_type?: 'invoice' | 'receipt' | '';
  page: number;
  page_size: number;
}

export interface ApiError {
  error: string;
}
