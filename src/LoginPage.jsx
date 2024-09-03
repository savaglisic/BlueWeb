import React, { useState } from 'react';
import axios from 'axios';
import { CssVarsProvider, Sheet, Box, Typography, Input, Button, Alert } from '@mui/joy';
import '@fontsource/roboto';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.status === 'login_successful') {
        setMessage('Login successful! Redirecting...');
        setError(false);
        // Implement redirection logic here, e.g., redirect to a dashboard
      } else if (response.data.status === 'incorrect_password') {
        setMessage('Incorrect password. Please try again.');
        setError(true);
      } else if (response.data.status === 'email_not_whitelisted') {
        setMessage('Email not whitelisted. Please contact support.');
        setError(true);
      }
    } catch (error) {
      setMessage('An error occurred during login. Please try again later.');
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
            Welcome!
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
          {message && (
            <Alert
              sx={{ mb: 1, width: '100%' }}
              variant="soft"
              color={error ? 'danger' : 'success'}
            >
              {message}
            </Alert>
          )}
          <Button variant="solid" color="primary" onClick={handleLogin}>
            Login
          </Button>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
};

export default LoginPage;





