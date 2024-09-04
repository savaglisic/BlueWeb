import React from 'react';
import { Box, Typography, IconButton, CssVarsProvider, Sheet } from '@mui/joy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DatabaseIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout'; // Add a logout icon
import '@fontsource/roboto';

const MainMenu = () => {
  // Get the userEmail from local storage
  const userEmail = localStorage.getItem('userEmail') || '';
  
  // Crop out the end of the email after the "@" symbol
  const croppedEmail = userEmail.split('@')[0];

  // Logout handler that clears localStorage and refreshes the page
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

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
        <Sheet
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            gap: 3,
            borderRadius: 'md',
            boxShadow: 'md',
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '600px',
            boxSizing: 'border-box',
          }}
        >
          <img src="/blueweblogo.png" alt="Blue Web Logo" style={{ width: '200px', height: 'auto', marginBottom: '20px' }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <IconButton
              sx={{
                flex: 1,
                padding: 2,
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '12px',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              variant="solid"
            >
              <AddCircleOutlineIcon fontSize="large" />
              <Typography sx={{ color: 'white', marginTop: '8px' }}>Add Samples</Typography>
            </IconButton>
            <IconButton
              sx={{
                flex: 1,
                padding: 2,
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '12px',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              variant="solid"
            >
              <DatabaseIcon fontSize="large" />
              <Typography sx={{ color: 'white', marginTop: '8px' }}>Fruit Quality Database</Typography>
            </IconButton>
            <IconButton
              sx={{
                flex: 1,
                padding: 2,
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '12px',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              variant="solid"
            >
              <SearchIcon fontSize="large" />
              <Typography sx={{ color: 'white', marginTop: '8px' }}>Search Pedigree Database</Typography>
            </IconButton>
            <IconButton
              sx={{
                flex: 1,
                padding: 2,
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '12px',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              variant="solid"
            >
              <SettingsIcon fontSize="large" />
              <Typography sx={{ color: 'white', marginTop: '8px' }}>Configure Sensory Panels</Typography>
            </IconButton>
          </Box>

          {/* Add a section to display cropped email and logout button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 1,
            }}
          >
            <Typography sx={{ color: 'black', marginRight: 1 }}>
              {croppedEmail}
            </Typography>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
};

export default MainMenu;
