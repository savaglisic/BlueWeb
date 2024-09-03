import React, { useState } from 'react';
import axios from 'axios';
import { CssVarsProvider, Sheet, Box, Typography, Input, Button, Alert } from '@mui/joy';
import '@fontsource/roboto';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // State to track if it's a new user

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { status } = response.data;
  
      if (status === 'login_successful') {
        setMessage('Login successful! Redirecting...');
        setError(false);
        // Implement redirection logic here, e.g., redirect to a dashboard
      } else if (status === 'incorrect_password') {
        setMessage('Incorrect password. Please try again.');
        setError(true);
      } else if (status === 'email_not_whitelisted') {
        setMessage('Email not whitelisted. Please contact support.');
        setError(true);
      } else if (status === 'user_not_found_but_whitelisted') {
        setMessage('No account found. Please create an account.');
        setIsNewUser(true); // Trigger account creation mode
        setError(false);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
        setError(true);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.status) {
        // Map the backend error to a user-friendly message
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
        // Network error or other unexpected errors
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
        user_name: email.split('@')[0], // Simple username generation, you can adjust this
        password,
      });
      if (response.data.status === 'update_successful') {
        setMessage('Account created successfully! You can now log in.');
        setError(false);
        setIsNewUser(false); // Revert to login mode
      } else {
        setMessage('Failed to create account. Please try again.');
        setError(true);
      }
    } catch (error) {
      setMessage('An error occurred during account creation. Please try again later.');
      setError(true);
    }
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
            gap: 2,
            borderRadius: 'md',
            boxShadow: 'md',
            backgroundColor: '#e0f7fa',
            width: '100%',
            maxWidth: '400px',
            boxSizing: 'border-box',
          }}
        >
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
          <Button variant="solid" color="primary" onClick={isNewUser ? handleCreateAccount : handleLogin}>
            {isNewUser ? 'Create Account' : 'Login'}
          </Button>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
};

export default LoginPage;
