import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/joy'; // Sheet removed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DatabaseIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ScienceIcon from '@mui/icons-material/Science';
import '@fontsource/roboto';
import PageLayout from './PageLayout'; // Import PageLayout

const MainMenu = ({ setView }) => {
  const [userGroup, setUserGroup] = useState(() => localStorage.getItem('userGroup') || '');
  const [userEmail, setUserEmail] = useState(() => {
    const storedEmail = localStorage.getItem('userEmail') || '';
    return storedEmail.trim().toLowerCase();
  });
  
  const croppedEmail = userEmail.split('@')[0];
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGroup');
    window.location.reload();
  };

  useEffect(() => {
    console.log('Debug: userEmail =', userEmail);
    console.log('Debug: userGroup =', userGroup);
  }, [userEmail, userGroup]);

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

  const buttonStyles = {
    flex: 1,
    padding: 2,
    backgroundColor: '#1976d2', // These are specific to buttons, not the card
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

  const renderButtons = () => {
    console.log('renderButtons: userGroup =', userGroup, ' userEmail =', userEmail);
  
    if (userGroup === 'admin' || userEmail === 'savaglisic@ufl.edu') {
      return (
        <>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('addSamples')}>
            <AddCircleOutlineIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Add Samples</Typography>
          </IconButton>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('fqLab')}>
            <ScienceIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Lab</Typography>
          </IconButton>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('fqDatabase')}>
            <DatabaseIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Database</Typography>
          </IconButton>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('searchPedigree')}>
            <SearchIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Pedigree Database</Typography>
          </IconButton>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('configureApp')}>
            <SettingsIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Configure BlueWeb</Typography>
          </IconButton>
        </>
      );
    } else if (userGroup === 'ops') {
      return (
        <>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('addSamples')}>
            <AddCircleOutlineIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>Add Samples</Typography>
          </IconButton>
          <IconButton sx={buttonStyles} variant="solid" onClick={() => setView('fqLab')}>
            <ScienceIcon fontSize="large" />
            <Typography sx={{ color: 'white', marginTop: '8px' }}>FQ Lab</Typography>
          </IconButton>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <PageLayout maxWidth="600px" innerSheetSx={{ gap: 3 }}> {/* Passing gap: 3 */}
      <img
        src="/blueweblogo.png"
        alt="Blue Web Logo"
        style={{ width: '200px', height: 'auto', marginBottom: '20px' }}
      />

      {errorMessage ? (
        <Typography color="error">{errorMessage}</Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, // This gap is for the buttons inside the Box
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
            color: 'black', 
            '&:hover': {
              backgroundColor: '#d32f2f',
              color: 'white', 
            },
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>
    </PageLayout>
  );
};

export default MainMenu;
