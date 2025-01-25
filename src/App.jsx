import React, { useState } from 'react';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import SearchPedigreeDatabase from './SearchPedigreeDatabase';
import AddSamples from './AddSamples'; 
import ConfigureApp from './ConfigureApp';
import FQLab from './FQLab';
import FQDatabase from './FQDatabaseTable/FQDatabase';
import { GlobalStyles, CssVarsProvider } from '@mui/joy';

const App = () => {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'mainMenu' : 'login');

  const handleLoginSuccess = async (email) => {
    localStorage.setItem('userEmail', email);
    try {
      const response = await fetch(`/api/get_user_group?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        localStorage.setItem('userGroup', data.user_group);
        setView('mainMenu'); 
      } else {
        console.error('User group not found or request failed:', data);
      }
    } catch (error) {
      console.error('Error fetching user group:', error);
    }
  };

  return (
    <CssVarsProvider>
    <GlobalStyles
      styles={{
        '::-webkit-scrollbar': {
          width: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        '::-webkit-scrollbar-thumb:active': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        '*': {
          scrollbarWidth: 'thin', 
          scrollbarColor: 'rgba(0, 0, 0, 0.3) transparent',
        },
      }}
    />
    <>
      {view === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
      {view === 'mainMenu' && <MainMenu setView={setView} />}
      {view === 'searchPedigree' && <SearchPedigreeDatabase setView={setView} />}
      {view === 'addSamples' && <AddSamples setView={setView} />} 
      {view === 'configureApp' && <ConfigureApp setView={setView} />} 
      {view === 'fqLab' && <FQLab setView={setView} />} 
      {view === 'fqDatabase' && <FQDatabase setView={setView} />} 
    </>
    </CssVarsProvider>
  );
};

export default App;


