import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Input,
  Button,
  CssVarsProvider,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';

const AddSamples = ({ setView }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    genotype: '',
    stage: '',
    site: '',
    block: '',
    project: '',
    post_harvest: '',
    bush_plant_number: '',
    notes: '',
    mass: '',
    number_of_berries: '',
    ph: '',
    brix: '',
    juicemass: '',
    tta: '',
    mladded: '',
    avg_firmness: '',
    avg_diameter: '',
    sd_firmness: '',
    sd_diameter: '',
    box: '',
    bush: ''
  });

  const [options, setOptions] = useState({
    stage: [],
    site: [],
    block: [],
    project: [],
    post_harvest: [],
  });

  useEffect(() => {
    fetch('http://localhost:5000/option_config')
      .then(response => response.json())
      .then(data => {
        const groupedOptions = data.options.reduce((acc, option) => {
          if (!acc[option.option_type]) {
            acc[option.option_type] = [];
          }
          acc[option.option_type].push(option.option_text);
          return acc;
        }, {});

        setOptions({
          stage: groupedOptions.stage || [],
          site: groupedOptions.site || [],
          block: groupedOptions.block || [],
          project: groupedOptions.project || [],
          post_harvest: groupedOptions.post_harvest || []
        });
      })
      .catch(error => console.error('Error fetching options:', error));
  }, []);

  const handleChange = (event, newValue) => {
    const name = event.target ? event.target.name : event;
    const value = newValue !== undefined ? newValue : event.target.value;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });
    
    fetch('http://localhost:5000/add_plant_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Plant data added successfully!');
      } else {
        alert('Error: ' + data.message);
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
          overflow: 'hidden',
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
            maxWidth: '600px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
          className="scrollable-box"
        >
          <IconButton
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
            }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
            Define New Samples
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel>Barcode</FormLabel>
                <Input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Genotype</FormLabel>
                <Input
                  name="genotype"
                  value={formData.genotype}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Stage</FormLabel>
                <Select
                  name="stage"
                  value={formData.stage}
                  onChange={(_, newValue) => handleChange('stage', newValue)}
                  required
                >
                  {options.stage.map((stage, idx) => (
                    <Option key={idx} value={stage}>{stage}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Site</FormLabel>
                <Select
                  name="site"
                  value={formData.site}
                  onChange={(_, newValue) => handleChange('site', newValue)}
                  required
                >
                  {options.site.map((site, idx) => (
                    <Option key={idx} value={site}>{site}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Block</FormLabel>
                <Select
                  name="block"
                  value={formData.block}
                  onChange={(_, newValue) => handleChange('block', newValue)}
                >
                  {options.block.map((block, idx) => (
                    <Option key={idx} value={block}>{block}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Project</FormLabel>
                <Select
                  name="project"
                  value={formData.project}
                  onChange={(_, newValue) => handleChange('project', newValue)}
                >
                  {options.project.map((project, idx) => (
                    <Option key={idx} value={project}>{project}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Post Harvest</FormLabel>
                <Select
                  name="post_harvest"
                  value={formData.post_harvest}
                  onChange={(_, newValue) => handleChange('post_harvest', newValue)}
                >
                  {options.post_harvest.map((ph, idx) => (
                    <Option key={idx} value={ph}>{ph}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bush Plant Number</FormLabel>
                <Input
                  name="bush_plant_number"
                  value={formData.bush_plant_number}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mass</FormLabel>
                <Input
                  name="mass"
                  value={formData.mass}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Number of Berries</FormLabel>
                <Input
                  name="number_of_berries"
                  value={formData.number_of_berries}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  minRows={3}
                />
              </FormControl>
            </Box>
            <Button type="submit" sx={{ mt: 3 }}>
              Submit
            </Button>
          </form>
        </Box>
      </Box>
      <style>{`
        .scrollable-box {
          overflow-y: auto;
          max-height: 90vh;
        }
        .scrollable-box::-webkit-scrollbar {
          width: 8px;
        }
        .scrollable-box::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollable-box::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 10px;
        }
        .scrollable-box::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </CssVarsProvider>
  );
};

export default AddSamples;
