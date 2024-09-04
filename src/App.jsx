import React from 'react';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('userEmail');

  return isLoggedIn ? <MainMenu /> : <LoginPage />;
};

export default App;

