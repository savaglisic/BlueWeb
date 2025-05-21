import React from 'react';
import { Box, Sheet } from '@mui/joy';
import '@fontsource/roboto'; // Ensure fonts are loaded

const PageLayout = ({ children, maxWidth = '600px', sx: innerSheetSx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#87CEEB', // The common blue background
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          gap: 2, // Default gap, can be overridden by page-specific content
          borderRadius: 'md',
          boxShadow: 'md',
          backgroundColor: '#ffffff', // Default white card background
          width: '100%',
          maxWidth: maxWidth,
          boxSizing: 'border-box',
          ...innerSheetSx, // Allow overriding or extending styles for the Sheet
        }}
      >
        {children}
      </Sheet>
    </Box>
  );
};

export default PageLayout;
