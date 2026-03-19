import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { CreateDocumentPayload } from '../../types/document';
import { validateCreateDocument, hasErrors, DESCRIPTION_MAX_LENGTH } from '../../utils/validation';

interface CreateDocumentDialogProps {
  open: boolean;
  onSave: (data: CreateDocumentPayload) => Promise<void>;
  onCancel: () => void;
}

const defaultForm: Partial<CreateDocumentPayload> = {
  reference: '',
  description: '',
  document_type: 'invoice',
  line_item_limit: 10,
};

export default function CreateDocumentDialog({
  open,
  onSave,
  onCancel,
}: CreateDocumentDialogProps) {
  const [form, setForm] = useState<Partial<CreateDocumentPayload>>({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setApiError(null);
  };

  const resetAndClose = () => {
    setForm({ ...defaultForm });
    setErrors({});
    setApiError(null);
    onCancel();
  };

  const handleSubmit = async () => {
    const validationErrors = validateCreateDocument(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      await onSave({
        reference: form.reference!,
        description: form.description!,
        document_type: form.document_type!,
        line_item_limit: form.line_item_limit!,
      });
      setForm({ ...defaultForm });
      setErrors({});
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !submitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const descLen = form.description?.length ?? 0;
  const descOverLimit = descLen > DESCRIPTION_MAX_LENGTH;

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-document-dialog-title"
    >
      <DialogTitle id="create-document-dialog-title">Create Document</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
          {apiError && (
            <Alert severity="error" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}
          <TextField
            label="Reference"
            value={form.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            error={!!errors.reference}
            helperText={errors.reference}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description || descOverLimit}
            helperText={errors.description || `${descLen}/${DESCRIPTION_MAX_LENGTH}`}
            fullWidth
            multiline
            rows={2}
            required
          />
          <FormControl fullWidth required error={!!errors.document_type}>
            <InputLabel id="create-doc-type-label">Document Type</InputLabel>
            <Select
              labelId="create-doc-type-label"
              value={form.document_type || ''}
              label="Document Type"
              onChange={(e) => handleChange('document_type', e.target.value)}
            >
              <MenuItem value="invoice">Invoice</MenuItem>
              <MenuItem value="receipt">Receipt</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Line Item Limit"
            type="number"
            value={form.line_item_limit}
            onChange={(e) => handleChange('line_item_limit', Number(e.target.value))}
            error={!!errors.line_item_limit}
            helperText={errors.line_item_limit}
            inputProps={{ min: 1 }}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
