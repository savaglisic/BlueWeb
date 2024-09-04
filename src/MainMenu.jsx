import React from 'react';
import { Box, Typography, IconButton, CssVarsProvider, Sheet } from '@mui/joy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DatabaseIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import '@fontsource/roboto';

const MainMenu = () => {
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
              }}
              variant="solid"
            >
              <AddCircleOutlineIcon />
              <Typography>Add Samples</Typography>
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
              }}
              variant="solid"
            >
              <DatabaseIcon />
              <Typography>Fruit Quality Database</Typography>
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
              }}
              variant="solid"
            >
              <SearchIcon />
              <Typography>Search Pedigree Database</Typography>
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
              }}
              variant="solid"
            >
              <SettingsIcon />
              <Typography>Configure Sensory Panels</Typography>
            </IconButton>
          </Box>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
};

export default MainMenu;
