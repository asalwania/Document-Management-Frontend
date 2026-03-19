import {
  Box,
  FormControl,
  MenuItem,
  Pagination as MuiPagination,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface PaginationProps {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function PaginationControls({
  totalCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', sm: 'center' },
        gap: 2,
        mt: 2.5,
        py: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {start}–{end} of {totalCount} documents
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <Select value={pageSize} onChange={(e) => onPageSizeChange(e.target.value as number)}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(_e, p) => onPageChange(p)}
          size={isMobile ? 'small' : 'medium'}
          shape="rounded"
        />
      </Box>
    </Box>
  );
}
