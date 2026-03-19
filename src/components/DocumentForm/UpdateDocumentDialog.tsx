import { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { Document, UpdateDocumentPayload } from '../../types/document';
import { validateUpdateDocument, hasErrors, DESCRIPTION_MAX_LENGTH } from '../../utils/validation';

interface UpdateDocumentDialogProps {
  open: boolean;
  document: Document | null;
  onSave: (data: UpdateDocumentPayload) => Promise<void>;
  onCancel: () => void;
}

export default function UpdateDocumentDialog({
  open,
  document: doc,
  onSave,
  onCancel,
}: UpdateDocumentDialogProps) {
  const [form, setForm] = useState({ description: '', line_item_limit: 10 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doc) {
      setForm({
        description: doc.description,
        line_item_limit: doc.line_item_limit,
      });
      setErrors({});
      setApiError(null);
    }
  }, [doc]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setApiError(null);
  };

  const handleClose = () => {
    setErrors({});
    setApiError(null);
    onCancel();
  };

  const handleSubmit = async () => {
    if (!doc) return;
    const validationErrors = validateUpdateDocument(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      await onSave(form);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update document');
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

  const descLen = form.description.length;
  const descOverLimit = descLen > DESCRIPTION_MAX_LENGTH;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="update-document-dialog-title"
    >
      <DialogTitle id="update-document-dialog-title">Edit Document</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
          {apiError && (
            <Alert severity="error" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}
          <TextField
            label="Reference"
            value={doc?.reference ?? ''}
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Document Type"
            value={doc?.document_type ?? ''}
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
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
            autoFocus
          />
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
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
