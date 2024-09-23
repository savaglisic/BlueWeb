import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Input,
  Button,
  CssVarsProvider,
  Textarea,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean formData to handle empty strings and convert them to null
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });
    
    // Post form data to Flask backend
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
        >
          {/* Home Icon */}
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

          <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Add Samples
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                placeholder="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                required
              />
              <Input
                placeholder="Genotype"
                name="genotype"
                value={formData.genotype}
                onChange={handleChange}
              />
              <Input
                placeholder="Stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
              />
              <Input
                placeholder="Site"
                name="site"
                value={formData.site}
                onChange={handleChange}
              />
              <Input
                placeholder="Block"
                name="block"
                value={formData.block}
                onChange={handleChange}
              />
              <Input
                placeholder="Project"
                name="project"
                value={formData.project}
                onChange={handleChange}
              />
              <Input
                placeholder="Post Harvest"
                name="post_harvest"
                value={formData.post_harvest}
                onChange={handleChange}
              />
              <Input
                placeholder="Bush Plant Number"
                name="bush_plant_number"
                value={formData.bush_plant_number}
                onChange={handleChange}
              />
              <Textarea
                placeholder="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <Input
                placeholder="Mass"
                name="mass"
                value={formData.mass}
                onChange={handleChange}
              />
              <Input
                placeholder="Number of Berries"
                name="number_of_berries"
                value={formData.number_of_berries}
                onChange={handleChange}
              />
              <Input
                placeholder="pH"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
              />
              <Input
                placeholder="Brix"
                name="brix"
                value={formData.brix}
                onChange={handleChange}
              />
              <Input
                placeholder="Juice Mass"
                name="juicemass"
                value={formData.juicemass}
                onChange={handleChange}
              />
              <Input
                placeholder="TTA"
                name="tta"
                value={formData.tta}
                onChange={handleChange}
              />
              <Input
                placeholder="ML Added"
                name="mladded"
                value={formData.mladded}
                onChange={handleChange}
              />
              <Input
                placeholder="Avg Firmness"
                name="avg_firmness"
                value={formData.avg_firmness}
                onChange={handleChange}
              />
              <Input
                placeholder="Avg Diameter"
                name="avg_diameter"
                value={formData.avg_diameter}
                onChange={handleChange}
              />
              <Input
                placeholder="SD Firmness"
                name="sd_firmness"
                value={formData.sd_firmness}
                onChange={handleChange}
              />
              <Input
                placeholder="SD Diameter"
                name="sd_diameter"
                value={formData.sd_diameter}
                onChange={handleChange}
              />
              <Input
                placeholder="Box"
                name="box"
                value={formData.box}
                onChange={handleChange}
              />
              <Input
                placeholder="Bush"
                name="bush"
                value={formData.bush}
                onChange={handleChange}
              />
            </Box>

            <Button type="submit" variant="solid" sx={{ mt: 3 }}>
              Submit
            </Button>
          </form>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default AddSamples;
