import React, { useState } from 'react';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import SearchPedigreeDatabase from './SearchPedigreeDatabase';
import AddSamples from './AddSamples'; 
import ConfigureApp from './ConfigureApp';
import { GlobalStyles, CssVarsProvider } from '@mui/joy';

const App = () => {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'mainMenu' : 'login');

  const handleLoginSuccess = (email) => {
    localStorage.setItem('userEmail', email);
    setView('mainMenu');
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
          scrollbarWidth: 'thin', // For Firefox
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
    </>
    </CssVarsProvider>
  );
};

export default App;


