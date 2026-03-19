import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import type { Document } from '../../types/document';
import { validateLineItemAmount, hasErrors } from '../../utils/validation';

interface LineItemDialogProps {
  open: boolean;
  mode: 'add' | 'remove';
  document: Document | null;
  onSave: (amount: number) => Promise<void>;
  onCancel: () => void;
}

export default function LineItemDialog({
  open,
  mode,
  document: doc,
  onSave,
  onCancel,
}: LineItemDialogProps) {
  const [amount, setAmount] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(1);
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  const handleClose = () => {
    setAmount(1);
    setErrors({});
    setApiError(null);
    onCancel();
  };

  const currentCount = doc?.line_item_count ?? 0;
  const limit = doc?.line_item_limit ?? 0;

  const previewCount = mode === 'add' ? currentCount + amount : currentCount - amount;
  const fillPct = limit > 0 ? (previewCount / limit) * 100 : 0;

  let warningText: string | null = null;
  if (mode === 'add') {
    if (previewCount > limit) {
      warningText = `Adding ${amount} would exceed the limit of ${limit}`;
    } else if (previewCount === limit) {
      warningText = 'This will fill the document to its limit';
    } else if (fillPct >= 80) {
      warningText = `Approaching limit: ${previewCount} / ${limit}`;
    }
  } else if (amount > currentCount) {
    warningText = `Cannot remove ${amount} items \u2014 only ${currentCount} exist`;
  } else if (mode === 'remove' && previewCount === 0) {
    warningText = 'This will remove all line items';
  }

  const handleSave = async () => {
    const validationErrors = validateLineItemAmount(amount);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    if (mode === 'add' && previewCount > limit) {
      setErrors({ amount: `Cannot exceed limit of ${limit}` });
      return;
    }
    if (mode === 'remove' && amount > currentCount) {
      setErrors({ amount: `Cannot remove more than ${currentCount}` });
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      await onSave(amount);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : `Failed to ${mode} line items`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      e.preventDefault();
      handleSave();
    }
  };

  const title =
    mode === 'add'
      ? `Add Line Items \u2014 ${doc?.reference ?? ''}`
      : `Remove Line Items \u2014 ${doc?.reference ?? ''}`;

  const actionLabel = mode === 'add' ? 'Add' : 'Remove';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="line-item-dialog-title"
    >
      <DialogTitle id="line-item-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
          {apiError && (
            <Alert severity="error" onClose={() => setApiError(null)} sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Current line items
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {currentCount} / {limit}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={limit > 0 ? Math.min((currentCount / limit) * 100, 100) : 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value));
              setErrors({});
              setApiError(null);
            }}
            error={!!errors.amount}
            helperText={errors.amount}
            inputProps={{ min: 1 }}
            fullWidth
            autoFocus
          />

          {amount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  After {mode === 'add' ? 'adding' : 'removing'}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={previewCount > limit || previewCount < 0 ? 'error.main' : 'text.primary'}
                >
                  {Math.max(0, previewCount)} / {limit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={limit > 0 ? Math.min(Math.max(fillPct, 0), 100) : 0}
                color={
                  // eslint-disable-next-line no-nested-ternary
                  previewCount > limit || previewCount < 0
                    ? 'error'
                    : fillPct >= 80
                      ? 'warning'
                      : 'primary'
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {warningText && (
            <Alert
              severity={
                (mode === 'add' && previewCount > limit) ||
                (mode === 'remove' && amount > currentCount)
                  ? 'error'
                  : 'warning'
              }
              sx={{ mt: 2 }}
            >
              {warningText}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color={mode === 'remove' ? 'warning' : 'primary'}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? `${actionLabel}ing...` : actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
