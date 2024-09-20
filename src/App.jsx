import React, { useState } from 'react';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import SearchPedigreeDatabase from './SearchPedigreeDatabase';
import AddSamples from './AddSamples'; // Import the new AddSamples component

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
      {view === 'addSamples' && <AddSamples setView={setView} />} {/* Add new view */}
    </>
  );
};

export default App;


