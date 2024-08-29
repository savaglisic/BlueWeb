import { CssVarsProvider, Sheet, Box, Typography, Input, Button } from '@mui/joy';
import '@fontsource/roboto';

const LoginPage = () => {
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
          <Input placeholder="Email" type="email" sx={{ mb: 1, width: '100%' }} />
          <Input placeholder="Password" type="password" sx={{ mb: 1, width: '100%' }} />
          <Button variant="solid" color="primary">
            Login
          </Button>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
};

export default LoginPage;




