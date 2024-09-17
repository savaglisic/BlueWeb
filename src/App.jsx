import React, { useState } from 'react';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import SearchPedigreeDatabase from './SearchPedigreeDatabase';

const App = () => {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'mainMenu' : 'login');

  const handleLoginSuccess = (email) => {
    localStorage.setItem('userEmail', email);
    setView('mainMenu');
  };

  return (
    <>
      {view === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
      {view === 'mainMenu' && <MainMenu setView={setView} />}
      {view === 'searchPedigree' && <SearchPedigreeDatabase setView={setView} />}
    </>
  );
};

export default App;

