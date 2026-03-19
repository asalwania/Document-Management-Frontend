import { describe, expect, it } from 'vitest';
import {
  DESCRIPTION_MAX_LENGTH,
  validateCreateDocument,
  validateUpdateDocument,
  validateLineItemAmount,
  hasErrors,
} from '../../utils/validation';

describe('DESCRIPTION_MAX_LENGTH', () => {
  it('is 30', () => {
    expect(DESCRIPTION_MAX_LENGTH).toBe(30);
  });
});

describe('hasErrors', () => {
  it('returns false for empty object', () => {
    expect(hasErrors({})).toBe(false);
  });

  it('returns true when errors exist', () => {
    expect(hasErrors({ reference: 'Required' })).toBe(true);
  });
});

describe('validateCreateDocument', () => {
  const validData = {
    reference: 'INV-001',
    description: 'Test doc',
    document_type: 'invoice' as const,
    line_item_limit: 10,
  };

  it('returns no errors for valid data', () => {
    expect(hasErrors(validateCreateDocument(validData))).toBe(false);
  });

  it('requires reference', () => {
    const errors = validateCreateDocument({ ...validData, reference: '' });
    expect(errors.reference).toBe('Reference is required');
  });

  it('requires reference to be non-whitespace', () => {
    const errors = validateCreateDocument({ ...validData, reference: '   ' });
    expect(errors.reference).toBe('Reference is required');
  });

  it('requires description', () => {
    const errors = validateCreateDocument({ ...validData, description: '' });
    expect(errors.description).toBe('Description is required');
  });

  it('rejects description longer than 30 characters', () => {
    const longDesc = 'a'.repeat(31);
    const errors = validateCreateDocument({ ...validData, description: longDesc });
    expect(errors.description).toBe('Description must be 30 characters or less');
  });

  it('accepts description of exactly 30 characters', () => {
    const exactDesc = 'a'.repeat(30);
    const errors = validateCreateDocument({ ...validData, description: exactDesc });
    expect(errors.description).toBeUndefined();
  });

  it('requires document_type', () => {
    const errors = validateCreateDocument({ ...validData, document_type: undefined });
    expect(errors.document_type).toBe('Document type is required');
  });

  it('requires line_item_limit >= 1', () => {
    const errors = validateCreateDocument({ ...validData, line_item_limit: 0 });
    expect(errors.line_item_limit).toBe('Line item limit must be at least 1');
  });

  it('rejects null line_item_limit', () => {
    const errors = validateCreateDocument({ ...validData, line_item_limit: undefined });
    expect(errors.line_item_limit).toBeDefined();
  });

  it('returns multiple errors at once', () => {
    const errors = validateCreateDocument({});
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
  });
});

describe('validateUpdateDocument', () => {
  const validData = { description: 'Updated desc', line_item_limit: 5 };

  it('returns no errors for valid data', () => {
    expect(hasErrors(validateUpdateDocument(validData))).toBe(false);
  });

  it('requires description', () => {
    const errors = validateUpdateDocument({ ...validData, description: '' });
    expect(errors.description).toBe('Description is required');
  });

  it('rejects description longer than 30 characters', () => {
    const errors = validateUpdateDocument({ ...validData, description: 'a'.repeat(31) });
    expect(errors.description).toBe('Description must be 30 characters or less');
  });

  it('requires line_item_limit >= 1', () => {
    const errors = validateUpdateDocument({ ...validData, line_item_limit: 0 });
    expect(errors.line_item_limit).toBe('Line item limit must be at least 1');
  });
});

describe('validateLineItemAmount', () => {
  it('returns no errors for amount >= 1', () => {
    expect(hasErrors(validateLineItemAmount(1))).toBe(false);
    expect(hasErrors(validateLineItemAmount(100))).toBe(false);
  });

  it('rejects amount < 1', () => {
    const errors = validateLineItemAmount(0);
    expect(errors.amount).toBe('Amount must be at least 1');
  });

  it('rejects undefined amount', () => {
    const errors = validateLineItemAmount(undefined);
    expect(errors.amount).toBeDefined();
  });
});
