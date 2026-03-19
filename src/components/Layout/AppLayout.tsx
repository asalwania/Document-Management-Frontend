import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AppBar position="sticky" elevation={1}>
        <Toolbar variant={isMobile ? 'dense' : 'regular'}>
          <DescriptionIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
            Document Management
          </Typography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 3 },
          flex: 1,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
