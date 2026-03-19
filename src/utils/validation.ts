import type { CreateDocumentPayload, UpdateDocumentPayload } from '../types/document';

export const DESCRIPTION_MAX_LENGTH = 30;

export interface ValidationErrors {
  [key: string]: string;
}

export function validateCreateDocument(data: Partial<CreateDocumentPayload>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.reference?.trim()) {
    errors.reference = 'Reference is required';
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
  }

  if (!data.document_type) {
    errors.document_type = 'Document type is required';
  }

  if (data.line_item_limit == null || data.line_item_limit < 1) {
    errors.line_item_limit = 'Line item limit must be at least 1';
  }

  return errors;
}

export function validateUpdateDocument(data: Partial<UpdateDocumentPayload>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
  }

  if (data.line_item_limit == null || data.line_item_limit < 1) {
    errors.line_item_limit = 'Line item limit must be at least 1';
  }

  return errors;
}

export function validateLineItemAmount(amount: number | undefined): ValidationErrors {
  const errors: ValidationErrors = {};

  if (amount == null || amount < 1) {
    errors.amount = 'Amount must be at least 1';
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
