import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Input,
  Button,
  List,
  ListItem,
} from '@mui/joy'; // CssVarsProvider removed
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import PageLayout from './PageLayout'; // Import PageLayout

const ConfigureApp = ({ setView }) => {
  const [emailWhitelist, setEmailWhitelist] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [optionConfigs, setOptionConfigs] = useState({});
  const [newOptionTexts, setNewOptionTexts] = useState({});

  useEffect(() => {
    fetch('/api/email_whitelist')
      .then((response) => response.json())
      .then((data) => { setEmailWhitelist(data.emails); });

    fetch('/api/option_config')
      .then((response) => response.json())
      .then((data) => {
        const groupedOptions = {};
        const initialOptionTexts = {};
        data.options.forEach((option) => {
          const { id, option_type, option_text } = option;
          if (!groupedOptions[option_type]) {
            groupedOptions[option_type] = [];
          }
          groupedOptions[option_type].push({ id, option_text });
          if (option_type.includes('range')) {
            initialOptionTexts[option_type] = option_text;
          }
        });
        setOptionConfigs(groupedOptions);
        setNewOptionTexts(initialOptionTexts);
      });
  }, []);

  const handleAddEmail = () => {
    if (!newEmail) return;
    fetch('/api/email_whitelist', {
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
    fetch(`/api/email_whitelist/${encodeURIComponent(email)}`, { method: 'DELETE' })
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
    fetch('/api/option_config', {
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
    fetch(`/api/option_config/${id}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setOptionConfigs({
            ...optionConfigs,
            [optionType]: optionConfigs[optionType].filter((option) => option.id !== id),
          });
        } else {
          alert(data.message);
        }
      });
  };

  const handleEditOption = (optionType, id) => {
    const optionText = newOptionTexts[optionType];
    if (!optionText) return;
    const isValidRange = /^\d+(\.\d+)?-\d+(\.\d+)?$/.test(optionText);
    if (!isValidRange) {
      alert('Please enter a valid range in the format "min-max", where min and max are numbers, no spaces please');
      return;
    }
    if (id) {
      fetch(`/api/option_config/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_text: optionText }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            setOptionConfigs({ ...optionConfigs, [optionType]: [{ id, option_text: optionText }] });
            setNewOptionTexts({ ...newOptionTexts, [optionType]: optionText });
          } else {
            alert(data.message);
          }
        });
    } else {
      fetch('/api/option_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_type: optionType, option_text: optionText }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            const newOption = { id: data.id, option_text: optionText };
            setOptionConfigs({ ...optionConfigs, [optionType]: [newOption] });
            setNewOptionTexts({ ...newOptionTexts, [optionType]: optionText });
          } else {
            alert(data.message);
          }
        });
    }
  };

  const pageSheetSx = {
    height: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
  };

  return (
    <PageLayout maxWidth="800px" innerSheetSx={pageSheetSx}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={() => setView('mainMenu')}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}> {/* Using variant="h5" as per example */}
          Configure BlueWeb
        </Typography>
        <Box sx={{ width: 40 }} /> {/* Placeholder for spacing */}
      </Box>

      {/* Email Whitelist */}
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography level="h6" sx={{ fontWeight: 'bold', color: 'black' }}>Email Whitelist</Typography>
        <List>
          {emailWhitelist.map((email, index) => (
            <ListItem
              key={index}
              endAction={
                <IconButton variant="plain" color="danger" onClick={() => handleDeleteEmail(email)}>
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
          <Button variant="solid" onClick={handleAddEmail}>Add</Button>
        </Box>
      </Box>

      {/* Option Configs */}
      {Object.keys(optionConfigs).map((optionType) => {
        if (optionType.includes('range')) {
          const existingOption = optionConfigs[optionType][0];
          return (
            <Box key={optionType} sx={{ width: '100%', mt: 4 }}>
              <Typography level="h6" sx={{ fontWeight: 'bold', color: 'black' }}>{optionType}</Typography>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <Input
                  placeholder={`Set ${optionType}`}
                  value={newOptionTexts[optionType] || ''}
                  onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [optionType]: e.target.value })}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button variant="solid" onClick={() => handleEditOption(optionType, existingOption ? existingOption.id : null)}>
                  {existingOption ? 'Update' : 'Set'}
                </Button>
              </Box>
            </Box>
          );
        } else {
          return (
            <Box key={optionType} sx={{ width: '100%', mt: 4 }}>
              <Typography level="h6" sx={{ fontWeight: 'bold', color: 'black' }}>{optionType}</Typography>
              <List>
                {optionConfigs[optionType].map((option) => (
                  <ListItem
                    key={option.id}
                    endAction={
                      <IconButton variant="plain" color="danger" onClick={() => handleDeleteOption(optionType, option.id)}>
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
                  onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [optionType]: e.target.value })}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button variant="solid" onClick={() => handleAddOption(optionType)}>Add</Button>
              </Box>
            </Box>
          );
        }
      })}
    </PageLayout>
  );
};

export default ConfigureApp;
