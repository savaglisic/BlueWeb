import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Input, IconButton, CssVarsProvider } from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';

const FQLab = ({ setView }) => {
  const [barcode, setBarcode] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [error, setError] = useState('');
  const barcodeInputRef = useRef(null);

  // Automatically focus the barcode field on page load
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle the barcode search when 7 digits are entered
  useEffect(() => {
    if (barcode.length === 7) {
      axios
        .post('http://localhost:5000/check_barcode', { barcode })
        .then((response) => {
          if (response.data.status === 'success') {
            setPlantData(response.data.data);
            setError('');
          } else if (response.data.status === 'not_found') {
            setPlantData(null);
            setError('Barcode not found');
          }
        })
        .catch((error) => {
          setError('Error fetching data');
          console.error(error);
        });
    } else {
      // Clear the plant data if the barcode is modified (and is not 7 digits)
      setPlantData(null);
      setError('');
    }
  }, [barcode]);

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit to 7 digits
    if (/^\d{0,7}$/.test(value)) {
      setBarcode(value);
    }
  };

  return (
    <CssVarsProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', // One white box with column layout
          height: '100vh',
          width: '100vw',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#87CEEB',
        }}
      >
        {/* Single White Box Containing Both Sections */}
        <Box
          sx={{
            padding: 3,
            backgroundColor: '#ffffff',
            borderRadius: 'md',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '90%',
            maxWidth: '800px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
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

          {/* Barcode Entry Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Barcode Entry
            </Typography>
            <Input
              ref={barcodeInputRef}
              value={barcode}
              onChange={handleBarcodeChange}
              placeholder="Scan or Enter Barcode"
              type="text"
              inputProps={{ maxLength: 7, pattern: '[0-9]*', inputMode: 'numeric' }}
              sx={{ marginTop: 2, width: '100%' }}
              autoFocus
            />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Please enter a 7-digit barcode.
            </Typography>
          </Box>

          {/* Data Preview Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Data Preview
            </Typography>
            {plantData ? (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
                  Genotype: {plantData.genotype}
                </Typography>
                <Typography variant="body1">Stage: {plantData.stage}</Typography>
                <Typography variant="body1">Site: {plantData.site}</Typography>
                <Typography variant="body1">Block: {plantData.block}</Typography>
                {/* Add the rest of the plant data */}
                <Typography variant="body2">Project: {plantData.project}</Typography>
                <Typography variant="body2">Post Harvest: {plantData.post_harvest}</Typography>
                <Typography variant="body2">Bush Plant Number: {plantData.bush_plant_number}</Typography>
                <Typography variant="body2">Mass: {plantData.mass}</Typography>
                <Typography variant="body2">Number of Berries: {plantData.number_of_berries}</Typography>
                <Typography variant="body2">Berry Mass: {plantData.x_berry_mass}</Typography>
                <Typography variant="body2">pH: {plantData.ph}</Typography>
                <Typography variant="body2">Brix: {plantData.brix}</Typography>
                <Typography variant="body2">Juice Mass: {plantData.juicemass}</Typography>
                <Typography variant="body2">TTA: {plantData.tta}</Typography>
                <Typography variant="body2">ML Added: {plantData.mladded}</Typography>
                <Typography variant="body2">Average Firmness: {plantData.avg_firmness}</Typography>
                <Typography variant="body2">Average Diameter: {plantData.avg_diameter}</Typography>
                <Typography variant="body2">Firmness SD: {plantData.sd_firmness}</Typography>
                <Typography variant="body2">Diameter SD: {plantData.sd_diameter}</Typography>
                <Typography variant="body2">Box: {plantData.box}</Typography>
              </Box>
            ) : error ? (
              <Typography variant="body2" sx={{ color: 'red' }}>
                {error}
              </Typography>
            ) : (
              <Typography variant="body2">No data to display</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQLab;

