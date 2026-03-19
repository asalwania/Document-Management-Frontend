import { useState, useEffect } from 'react';
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

interface DocumentFiltersProps {
  search: string;
  documentType: 'invoice' | 'receipt' | '';
  onSearchChange: (value: string) => void;
  onDocumentTypeChange: (value: 'invoice' | 'receipt' | '') => void;
  onCreateClick: () => void;
}

export default function DocumentFilters({
  search,
  documentType,
  onSearchChange,
  onDocumentTypeChange,
  onCreateClick,
}: DocumentFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ mb: 3 }}
    >
      <TextField
        placeholder="Search by reference..."
        size="small"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { sm: 240 }, flex: { sm: 1 }, maxWidth: { sm: 360 } }}
      />
      <ToggleButtonGroup
        value={documentType}
        exclusive
        onChange={(_e, val) => {
          onDocumentTypeChange(val ?? '');
        }}
        size="small"
      >
        <ToggleButton value="">All</ToggleButton>
        <ToggleButton value="invoice">Invoice</ToggleButton>
        <ToggleButton value="receipt">Receipt</ToggleButton>
      </ToggleButtonGroup>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
        sx={{ ml: { sm: 'auto' }, whiteSpace: 'nowrap' }}
      >
        New Document
      </Button>
    </Stack>
  );
}
