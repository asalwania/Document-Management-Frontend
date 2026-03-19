import { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Document } from '../../types/document';

interface ConfirmDialogProps {
  open: boolean;
  document: Document | null;
  onConfirm: (forceDelete: boolean) => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  document: doc,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [forceDelete, setForceDelete] = useState(false);

  const hasLineItems = (doc?.line_item_count ?? 0) > 0;

  useEffect(() => {
    if (open) {
      setForceDelete(false);
    }
  }, [open]);

  const canConfirm = !hasLineItems || forceDelete;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
    >
      <DialogTitle
        id="confirm-delete-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <WarningAmberIcon color="error" />
        Delete Document
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          Are you sure you want to delete &ldquo;{doc?.reference}&rdquo;? This action cannot be
          undone.
        </DialogContentText>

        {hasLineItems && (
          <>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This document has {doc?.line_item_count} line item
              {doc?.line_item_count !== 1 ? 's' : ''}. Deleting it will permanently remove them.
            </Alert>
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  color="error"
                />
              }
              label="Force delete (including all line items)"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onConfirm(forceDelete)}
          color="error"
          variant="contained"
          disabled={!canConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
