import {
  Box,
  Paper,
  Skeleton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import type { Document } from '../../types/document';
import DocumentListItem from './DocumentListItem';
import DocumentFilters from './DocumentFilters';
import PaginationControls from '../common/Pagination';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  search: string;
  documentType: 'invoice' | 'receipt' | '';
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onDocumentTypeChange: (value: 'invoice' | 'receipt' | '') => void;
  onCreateClick: () => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onAddItems: (doc: Document) => void;
  onRemoveItems: (doc: Document) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onErrorClose: () => void;
}

function LoadingSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Paper key={`skeleton-card-${i}`} sx={{ p: 2, mb: 1.5 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
            <Skeleton variant="rectangular" height={6} sx={{ mt: 1.5, borderRadius: 3 }} />
          </Paper>
        ))}
      </Box>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={`skeleton-row-${i}`}>
              {Array.from({ length: 6 }).map((__, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <TableCell key={`skeleton-cell-${i}-${j}`}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function EmptyState() {
  return (
    <Paper sx={{ py: 8, textAlign: 'center' }}>
      <FolderOpenIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No documents found
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Create a new document or adjust your filters.
      </Typography>
    </Paper>
  );
}

export default function DocumentList({
  documents,
  loading,
  error,
  search,
  documentType,
  totalCount,
  page,
  pageSize,
  totalPages,
  onSearchChange,
  onDocumentTypeChange,
  onCreateClick,
  onEdit,
  onDelete,
  onAddItems,
  onRemoveItems,
  onPageChange,
  onPageSizeChange,
  onErrorClose,
}: DocumentListProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  return (
    <Box>
      <DocumentFilters
        search={search}
        documentType={documentType}
        onSearchChange={onSearchChange}
        onDocumentTypeChange={onDocumentTypeChange}
        onCreateClick={onCreateClick}
      />

      {loading && <LoadingSkeleton isMobile={isMobile} />}

      {!loading && documents.length === 0 && <EmptyState />}

      {!loading && documents.length > 0 && isMobile && (
        <Box>
          {documents.map((doc) => (
            <DocumentListItem
              key={doc.reference}
              document={doc}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddItems={onAddItems}
              onRemoveItems={onRemoveItems}
            />
          ))}
        </Box>
      )}

      {!loading && documents.length > 0 && !isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Line Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <DocumentListItem
                  key={doc.reference}
                  document={doc}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddItems={onAddItems}
                  onRemoveItems={onRemoveItems}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && documents.length > 0 && (
        <PaginationControls
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={onErrorClose}>
        <Alert severity="error" onClose={onErrorClose} variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
