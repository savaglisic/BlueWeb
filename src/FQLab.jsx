import React, { useState, useEffect, useRef } from 'react'; 
import { Box, Typography, Input, IconButton, CssVarsProvider, Grid, Select, Option, Button } from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';

const FQLab = ({ setView }) => {
  const [barcode, setBarcode] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [error, setError] = useState('');
  const barcodeInputRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [inputValue, setInputValue] = useState('');

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

  const handleUpdate = () => {
    const dataToSend = {
      barcode,
      [selectedProperty]: inputValue,
    };

    axios
      .post('http://localhost:5000/add_plant_data', dataToSend)
      .then((response) => {
        if (response.data.status === 'success') {
          alert(response.data.message);
          // Refresh plant data
          axios.post('http://localhost:5000/check_barcode', { barcode }).then((response) => {
            if (response.data.status === 'success') {
              setPlantData(response.data.data);
            }
          });
          setInputValue('');
          setSelectedProperty('');
        } else {
          alert(response.data.message || 'Error updating plant data');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Error updating plant data');
      });
  };

  // Function to conditionally style missing or null values
  const renderDataField = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Typography
        variant="body1"
        sx={{
          backgroundColor: !value ? '#FFCCCB' : 'transparent', // Light red for missing values
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <strong>{label}:</strong> <span>{value || 'N/A'}</span>
      </Typography>
    </Grid>
  );

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
          className="scrollable-box"
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
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
        >
          <IconButton sx={{ position: 'absolute', top: 10, left: 10 }} onClick={() => setView('mainMenu')}>
            <HomeIcon />
          </IconButton>
          <Select
            value={selectedProperty}
            onChange={(e, newValue) => setSelectedProperty(newValue)}
            placeholder="Select Property"
            sx={{ position: 'absolute', top: 10, right: 10, minWidth: '120px' }}
          >
            <Option value="ph">pH</Option>
            <Option value="brix">Brix</Option>
            <Option value="tta">TTA</Option>
          </Select>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
            Fruit Quality
          </Typography>

          {/* Barcode Entry Section */}
          <Box>
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

          {/* Conditional Input Field and Update Button */}
          {plantData && selectedProperty && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter new ${selectedProperty}`}
                type="text"
                sx={{ width: '100%' }}
              />
              <Button variant="solid" color="primary" sx={{ mt: 1 }} onClick={handleUpdate}>
                Update
              </Button>
            </Box>
          )}

          {/* Data Preview Section */}
          <Box sx={{ marginTop: 1, width: '100%' }}>
            {plantData ? (
              <Box sx={{ marginTop: 2, width: '100%' }}>
                {/* Large styled Genotype */}
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontSize: '42px',
                  }}
                >
                  {plantData.genotype || 'N/A'}
                </Typography>
                {/* Render data fields in a responsive grid */}
                <Grid container spacing={2}>
                  {renderDataField('Stage', plantData.stage)}
                  {renderDataField('Site', plantData.site)}
                  {renderDataField('Block', plantData.block)}
                  {renderDataField('Project', plantData.project)}
                  {renderDataField('Post Harvest', plantData.post_harvest)}
                  {renderDataField('Bush Plant Number', plantData.bush_plant_number)}
                  {renderDataField('Mass', plantData.mass)}
                  {renderDataField('Number of Berries', plantData.number_of_berries)}
                  {renderDataField('X Berry Mass', plantData.x_berry_mass)}
                  {renderDataField('pH', plantData.ph)}
                  {renderDataField('Brix', plantData.brix)}
                  {renderDataField('TTA', plantData.tta)}
                  {renderDataField('Avg Firmness', plantData.avg_firmness)}
                  {renderDataField('Avg Diameter', plantData.avg_diameter)}
                  {renderDataField('SD Firmness', plantData.sd_firmness)}
                  {renderDataField('SD Diameter', plantData.sd_diameter)}
                </Grid>
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
