import React, { useState, useEffect, useRef } from 'react'; 
import {
  Box,
  Typography,
  Input,
  IconButton,
  Grid,
  Select,
  Option,
  Button,
} from '@mui/joy'; // CssVarsProvider removed
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import PageLayout from './PageLayout'; // Import PageLayout

const FQLab = ({ setView }) => {
  const [barcode, setBarcode] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [error, setError] = useState('');
  const barcodeInputRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [optionConfigs, setOptionConfigs] = useState({});
  const [rangeError, setRangeError] = useState('');
  const [override, setOverride] = useState(false);

  useEffect(() => {
    fetch('/api/option_config')
      .then((response) => response.json())
      .then((data) => {
        const ranges = {};
        data.options.forEach((option) => {
          if (option.option_type.includes('range')) {
            ranges[option.option_type] = option.option_text;
          }
        });
        setOptionConfigs(ranges);
      })
      .catch((error) => { console.error('Error fetching option configs:', error); });
  }, []);

  useEffect(() => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (barcode.length === 7) fetchPlantData();
    else if (barcode.length === 0) resetData();
  }, [barcode]);

  useEffect(() => {
    if (plantData && selectedProperty) setInputValue(plantData[selectedProperty] || '');
    else setInputValue('');
    setRangeError('');
    setOverride(false);
  }, [plantData, selectedProperty]);

  const fetchPlantData = () => {
    axios.post('/api/check_barcode', { barcode })
      .then((response) => {
        if (response.data.status === 'success') {
          setPlantData(response.data.data);
          setError('');
        } else if (response.data.status === 'not_found') {
          resetData();
          setError('Barcode not found');
        }
      })
      .catch((error) => {
        resetData();
        setError('Error fetching data');
        console.error(error);
      });
  };

  const resetData = () => {
    setPlantData(null);
    setError('');
    setInputValue('');
    setRangeError('');
    setOverride(false);
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,7}$/.test(value)) setBarcode(value);
  };

  const handleUpdate = () => {
    if (!override && !isValueInRange()) {
      setRangeError(`Value is out of expected range (${getExpectedRange()}).`);
      return;
    }
    const dataToSend = { barcode, [selectedProperty]: inputValue };
    axios.post('/api/add_plant_data', dataToSend)
      .then((response) => {
        if (response.data.status === 'success') {
          alert(response.data.message);
          resetData();
          setBarcode('');
          if (barcodeInputRef.current) {
            setTimeout(() => { barcodeInputRef.current.focus(); }, 0);
          }
        } else {
          alert(response.data.message || 'Error updating plant data');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Error updating plant data');
      });
  };

  const getExpectedRange = () => {
    const rangeKey = `${selectedProperty}_range`;
    return optionConfigs[rangeKey] || '';
  };

  const isValueInRange = () => {
    const range = getExpectedRange();
    if (!range) return true;
    const [minStr, maxStr] = range.split('-');
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    const value = parseFloat(inputValue);
    if (isNaN(value) || isNaN(min) || isNaN(max)) return false;
    return value >= min && value <= max;
  };

  const renderDataField = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Typography
        variant="body1" // Joy UI uses level="body1" but variant="body1" might work or be a typo in example
        sx={{
          backgroundColor: !value ? '#FFCCCB' : 'transparent',
          padding: '4px', borderRadius: '4px', display: 'flex',
          justifyContent: 'space-between', width: '100%',
        }}
      >
        <strong>{label}:</strong> <span>{value || 'N/A'}</span>
      </Typography>
    </Grid>
  );

  const pageSheetSx = {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
    maxHeight: '90vh',
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
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black', textAlign: 'center', flexGrow: 1 }}>
          Fruit Quality
        </Typography>
        <Select
          value={selectedProperty}
          onChange={(e, newValue) => setSelectedProperty(newValue)}
          placeholder="Select Property"
          sx={{ minWidth: '150px' }} 
        >
          <Option value="ph">pH</Option>
          <Option value="brix">Brix</Option>
          <Option value="tta">TTA</Option>
        </Select>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Input
          ref={barcodeInputRef} // Corrected: Joy UI uses ref directly on Input for focus management.
          value={barcode}
          onChange={handleBarcodeChange}
          placeholder="Scan or Enter Barcode"
          type="text"
          inputProps={{ maxLength: 7, pattern: '[0-9]*', inputMode: 'numeric' }}
          sx={{ marginTop: 2, width: '50%' }}
          autoFocus
        />
        <Typography variant="body2" sx={{ marginTop: 1, textAlign: 'center' }}> 
          Please enter a 7-digit barcode.
        </Typography>
      </Box>

      {plantData && selectedProperty && (
        <Box sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ marginBottom: 1 }}> 
            Expected Range for {selectedProperty.toUpperCase()}: {getExpectedRange() || 'N/A'}
          </Typography>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter new ${selectedProperty}`}
            type="text" 
            sx={{ width: '50%' }}
          />
          {rangeError && (
            <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>{rangeError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              variant="solid"
              color="primary"
              onClick={handleUpdate}
              disabled={!inputValue || (!override && rangeError)}
            >
              Update
            </Button>
            {rangeError && !override && (
              <Button variant="outlined" color="warning" onClick={() => setOverride(true)} sx={{ ml: 2 }}>
                Override and Submit
              </Button>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ marginTop: 1, width: '100%' }}>
        {plantData ? (
          <Box sx={{ marginTop: 2, width: '100%' }}>
            <Typography variant="h1" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginBottom: '16px', textAlign: 'center', fontSize: '42px' }}> 
              {plantData.genotype || 'N/A'}
            </Typography>
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
          <Typography variant="body2" sx={{ color: 'red' }}>{error}</Typography> 
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>No data to display</Typography> 
        )}
      </Box>
    </PageLayout>
  );
};

export default FQLab;
