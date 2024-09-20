import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Input,
  Button,
  List,
  ListItem,
  CssVarsProvider,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';

const ConfigureApp = ({ setView }) => {
  const [emailWhitelist, setEmailWhitelist] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [optionConfigs, setOptionConfigs] = useState({});
  const [newOptionTexts, setNewOptionTexts] = useState({});

  useEffect(() => {
    // Fetch Email Whitelist
    fetch('http://localhost:5000/email_whitelist')
      .then((response) => response.json())
      .then((data) => {
        setEmailWhitelist(data.emails);
      });

    // Fetch Option Configs
    fetch('http://localhost:5000/option_config')
      .then((response) => response.json())
      .then((data) => {
        const groupedOptions = {};
        data.options.forEach((option) => {
          const { id, option_type, option_text } = option;
          if (!groupedOptions[option_type]) {
            groupedOptions[option_type] = [];
          }
          groupedOptions[option_type].push({ id, option_text });
        });
        setOptionConfigs(groupedOptions);
      });
  }, []);

  const handleAddEmail = () => {
    if (!newEmail) return;
    fetch('http://localhost:5000/email_whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setEmailWhitelist([...emailWhitelist, newEmail]);
          setNewEmail('');
        } else {
          alert(data.message);
        }
      });
  };

  const handleDeleteEmail = (email) => {
    fetch(`http://localhost:5000/email_whitelist/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setEmailWhitelist(emailWhitelist.filter((e) => e !== email));
        } else {
          alert(data.message);
        }
      });
  };

  const handleAddOption = (optionType) => {
    const optionText = newOptionTexts[optionType];
    if (!optionText) return;
    fetch('http://localhost:5000/option_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_type: optionType, option_text: optionText }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          const newOption = { id: data.id, option_text: optionText };
          setOptionConfigs({
            ...optionConfigs,
            [optionType]: [...optionConfigs[optionType], newOption],
          });
          setNewOptionTexts({ ...newOptionTexts, [optionType]: '' });
        } else {
          alert(data.message);
        }
      });
  };

  const handleDeleteOption = (optionType, id) => {
    fetch(`http://localhost:5000/option_config/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setOptionConfigs({
            ...optionConfigs,
            [optionType]: optionConfigs[optionType].filter(
              (option) => option.id !== id
            ),
          });
        } else {
          alert(data.message);
        }
      });
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
          overflowY: 'auto',
          padding: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 'md',
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '800px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Home Icon */}
          <IconButton
            sx={{ position: 'absolute', top: 10, left: 10 }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography variant="h5" sx={{fontWeight: 'bold'}}>
            Configure BlueWeb
          </Typography>

          {/* Email Whitelist */}
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography level="h6" sx={{fontWeight: 'bold'}}>Email Whitelist</Typography>
            <List>
              {emailWhitelist.map((email, index) => (
                <ListItem
                  key={index}
                  endAction={
                    <IconButton
                      variant="plain"
                      color="danger"
                      onClick={() => handleDeleteEmail(email)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {email}
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Input
                placeholder="Add Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button variant="solid" onClick={handleAddEmail}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Option Configs */}
          {Object.keys(optionConfigs).map((optionType) => (
            <Box key={optionType} sx={{ width: '100%', mt: 4 }}>
              <Typography level="h6" sx={{fontWeight: 'bold'}}>{optionType}</Typography>
              <List>
                {optionConfigs[optionType].map((option) => (
                  <ListItem
                    key={option.id}
                    endAction={
                      <IconButton
                        variant="plain"
                        color="danger"
                        onClick={() =>
                          handleDeleteOption(optionType, option.id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    {option.option_text}
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <Input
                  placeholder={`Add ${optionType}`}
                  value={newOptionTexts[optionType] || ''}
                  onChange={(e) =>
                    setNewOptionTexts({
                      ...newOptionTexts,
                      [optionType]: e.target.value,
                    })
                  }
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button
                  variant="solid"
                  onClick={() => handleAddOption(optionType)}
                >
                  Add
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default ConfigureApp;

