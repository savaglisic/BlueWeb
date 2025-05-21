import React, { useState } from 'react';
import axios from 'axios';
import { Sheet, Box, Typography, Input, Button, Alert } from '@mui/joy'; // Sheet and Box might still be used for internal structuring or can be removed if PageLayout handles all needs.
import '@fontsource/roboto';
import PageLayout from './PageLayout'; // Import the new PageLayout component

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { status } = response.data;
  
      if (status === 'login_successful') {
        setMessage('Login successful!');
        setError(false);
        onLoginSuccess(email);
      } else if (status === 'incorrect_password') {
        setMessage('Incorrect password. Please try again.');
        setError(true);
      } else if (status === 'email_not_whitelisted') {
        setMessage('Email not whitelisted. Please contact support.');
        setError(true);
      } else if (status === 'user_not_found_but_whitelisted') {
        setMessage('No account found. Please create an account.');
        setIsNewUser(true);
        setError(false);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
        setError(true);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.status) {
        const status = error.response.data.status;
        if (status === 'incorrect_password') {
          setMessage('Incorrect password. Please try again.');
        } else if (status === 'email_not_whitelisted') {
          setMessage('Email not whitelisted. Please contact support.');
        } else if (status === 'user_not_found_but_whitelisted') {
          setMessage('No account found. Please create an account.');
          setIsNewUser(true);
        } else {
          setMessage('An unexpected error occurred. Please try again.');
        }
      } else {
        setMessage('An error occurred during login. Please try again later.');
      }
      setError(true);
    }
  };

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      setError(true);
      return;
    }

    try {
      const response = await axios.put('/api/update_user', {
        email,
        user_name: email.split('@')[0],
        password,
      });
      if (response.data.status === 'user_created_successfully') {
        setMessage('Account created successfully! You can now log in.');
        setError(false);
        setIsNewUser(false);
      } else {
        setMessage('Failed to create account. Please try again.');
        setError(true);
      }
    } catch (error) {
      setMessage('An error occurred during account creation. Please try again later.');
      setError(true);
    }
  };

  // Note: The original Sheet had:
  // variant="outlined"
  // sx={{
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'center',
  //   padding: 3,
  //   gap: 2,
  //   borderRadius: 'md',
  //   boxShadow: 'md',
  //   backgroundColor: '#e0f7fa', // This is the specific background color for login page
  //   width: '100%',
  //   maxWidth: '400px',
  //   boxSizing: 'border-box',
  // }}
  // PageLayout defaults will cover most of these. We pass maxWidth="400px"
  // and the specific backgroundColor via sx to PageLayout.
  // The internal structure (flexDirection, alignItems, gap, padding) is now within the PageLayout's Sheet.
  // If these specific layout properties (flexDirection, alignItems, gap, padding) are crucial
  // for the *content itself* within the sheet, they might need to be applied to a Box *inside* PageLayout
  // or PageLayout's sheet's default padding and gap might be sufficient.
  // For now, we assume PageLayout's defaults for padding and gap are fine.

  return (
    <PageLayout maxWidth="400px" innerSheetSx={{ backgroundColor: '#e0f7fa' }}>
      <img src="/blueweblogo.png" alt="Blue Web Logo" style={{ width: '200px', height: 'auto' }} />
      <Typography level="h4" component="h1" mb={2}>
        {isNewUser ? 'Create Account' : 'Welcome!'}
      </Typography>
      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 1, width: '100%' }}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 1, width: '100%' }}
      />
      {isNewUser && (
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 1, width: '100%' }}
        />
      )}
      {message && (
        <Alert
          sx={{ mb: 1, width: '100%' }}
          variant="soft"
          color={error ? 'danger' : 'success'}
        >
          {message}
        </Alert>
      )}
      <Button variant="solid" color="primary" onClick={isNewUser ? handleCreateAccount : handleLogin} sx={{width: '100%'}}>
        {isNewUser ? 'Create Account' : 'Login'}
      </Button>
    </PageLayout>
  );
};

export default LoginPage;
