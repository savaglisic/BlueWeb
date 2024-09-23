import React from 'react';
import { Box, Typography, IconButton, CssVarsProvider } from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';

const FQLab = ({ setView }) => {
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
            position: 'relative', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 'md',
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '600px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Home Icon */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
            }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography variant="h5" sx={{fontWeight: 'bold'}}>
            FQ Lab Data Entry
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            Placeholder content for adding samples.
          </Typography>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQLab;