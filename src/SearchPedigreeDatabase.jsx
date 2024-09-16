import React from 'react';
import { Box, Typography, CssVarsProvider } from '@mui/joy';

const SearchPedigreeDatabase = () => {
  return (
    <CssVarsProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#87CEEB',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 'md',
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '600px',
            boxSizing: 'border-box',
          }}
        >
          <Typography variant="h4">Search Pedigree Database</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            This page will allow users to search the pedigree database. Content will be added later.
          </Typography>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default SearchPedigreeDatabase;
