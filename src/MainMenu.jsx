import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CssVarsProvider, Sheet } from '@mui/joy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DatabaseIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ScienceIcon from '@mui/icons-material/Science';
import '@fontsource/roboto';

const MainMenu = ({ setView }) => {
  const [userGroup, setUserGroup] = useState(localStorage.getItem('userGroup') || '');
  const userEmail = localStorage.getItem('userEmail') || '';
  const croppedEmail = userEmail.split('@')[0];
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGroup');
    window.location.reload();
  };

  useEffect(() => {
    const fetchUserGroup = async () => {
      try {
        const response = await fetch(`/get_user_group?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          localStorage.setItem('userGroup', data.user_group);
          setUserGroup(data.user_group);
        } else {
          setErrorMessage('User group not found or access denied');
        }
      } catch (error) {
        console.error('Error fetching user group:', error);
        setErrorMessage('Error fetching user group');
      }
    };

    if (userEmail && !userGroup) {
      fetchUserGroup();
    } else if (!userEmail) {
      setErrorMessage('User email not found, please log in');
    }
  }, [userEmail, userGroup]);

  const renderButtons = () => {
    if (userGroup === 'ops') {
      return (
        <>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('addSamples')}
          >
            <AddCircleOutlineIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Add Samples</Typography>
          </IconButton>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('fqLab')}
          >
            <ScienceIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Lab</Typography>
          </IconButton>
        </>
      );
    } else if (userGroup === 'admin') {
      return (
        <>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('addSamples')}
          >
            <AddCircleOutlineIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Add Samples</Typography>
          </IconButton>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('fqLab')}
          >
            <ScienceIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Lab</Typography>
          </IconButton>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('fqDatabase')}
          >
            <DatabaseIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Database</Typography>
          </IconButton>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('searchPedigree')}
          >
            <SearchIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Pedigree Database</Typography>
          </IconButton>
          <IconButton
            sx={buttonStyles}
            variant="solid"
            onClick={() => setView('configureApp')}
          >
            <SettingsIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Configure BlueWeb</Typography>
          </IconButton>
        </>
      );
    } else {
      return null; // No buttons for other user groups or if there's an error
    }
  };

  const buttonStyles = {
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

          {errorMessage ? (
            <Typography color="error">{errorMessage}</Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {renderButtons()}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <Typography sx={{ color: 'black', marginRight: 1 }}>{croppedEmail}</Typography>
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

