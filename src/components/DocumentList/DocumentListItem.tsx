import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { Document } from '../../types/document';

interface DocumentListItemProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onAddItems: (doc: Document) => void;
  onRemoveItems: (doc: Document) => void;
}

const typeConfig = {
  invoice: { label: 'Invoice', color: 'primary' as const },
  receipt: { label: 'Receipt', color: 'success' as const },
};

function LineItemProgress({ count, limit }: { count: number; limit: number }) {
  const pct = limit > 0 ? (count / limit) * 100 : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        sx={{ flex: 1, height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {count} / {limit}
      </Typography>
    </Box>
  );
}

function ActionButtons({
  doc,
  onEdit,
  onDelete,
  onAddItems,
  onRemoveItems,
}: Omit<DocumentListItemProps, 'document'> & { doc: Document }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => onEdit(doc)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Line Items">
        <IconButton size="small" color="primary" onClick={() => onAddItems(doc)}>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Remove Line Items">
        <span>
          <IconButton
            size="small"
            color="warning"
            onClick={() => onRemoveItems(doc)}
            disabled={doc.line_item_count === 0}
          >
            <RemoveCircleOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => onDelete(doc)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function DocumentListItem({
  document: doc,
  onEdit,
  onDelete,
  onAddItems,
  onRemoveItems,
}: DocumentListItemProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Card sx={{ mb: 1.5 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {doc.reference}
              </Typography>
              <Chip
                label={typeConfig[doc.document_type].label}
                color={typeConfig[doc.document_type].color}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {new Date(doc.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} noWrap>
            {doc.description}
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Line Items
            </Typography>
            <LineItemProgress count={doc.line_item_count} limit={doc.line_item_limit} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ActionButtons
              doc={doc}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddItems={onAddItems}
              onRemoveItems={onRemoveItems}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {doc.reference}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
          {doc.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={typeConfig[doc.document_type].label}
          color={typeConfig[doc.document_type].color}
          size="small"
        />
      </TableCell>
      <TableCell>
        <LineItemProgress count={doc.line_item_count} limit={doc.line_item_limit} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {new Date(doc.created_at).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <ActionButtons
          doc={doc}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddItems={onAddItems}
          onRemoveItems={onRemoveItems}
        />
      </TableCell>
    </TableRow>
  );
}
