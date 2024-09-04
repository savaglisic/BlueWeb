import React from 'react';
import { Box, Typography, IconButton, CssVarsProvider } from '@mui/joy';
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
          flexDirection: 'column',
          backgroundColor: '#87CEEB',
        }}
      >
        <img src="/blueweblogo.png" alt="Blue Web Logo" style={{ width: '200px', height: 'auto', marginBottom: '20px' }} />
        <Typography level="h4" component="h1" mb={2} sx={{ textAlign: 'center' }}>
          Main Menu
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <IconButton sx={{ flex: 1 }} variant="solid" color="primary">
            <AddCircleOutlineIcon />
            <Typography>Add Samples</Typography>
          </IconButton>
          <IconButton sx={{ flex: 1 }} variant="solid" color="primary">
            <DatabaseIcon />
            <Typography>Fruit Quality Database</Typography>
          </IconButton>
          <IconButton sx={{ flex: 1 }} variant="solid" color="primary">
            <SearchIcon />
            <Typography>Search Pedigree Database</Typography>
          </IconButton>
          <IconButton sx={{ flex: 1 }} variant="solid" color="primary">
            <SettingsIcon />
            <Typography>Configure Sensory Panels</Typography>
          </IconButton>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default MainMenu;
