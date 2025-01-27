import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
  GlobalStyles,
  Modal,
  ModalDialog,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const AddSamples = ({ setView }) => {
  const currentYear = new Date().getFullYear();
  const lastTwoDigits = currentYear.toString().slice(-2);

  const initialFormData = {
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
    x_berry_mass: '',
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
    bush: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [genotypeSuggestion, setGenotypeSuggestion] = useState('');

  // For dropdown options
  const [options, setOptions] = useState({
    stage: [],
    site: [],
    block: [],
    project: [],
    post_harvest: [],
  });

  // Refs
  const barcodeRef = useRef(null);
  const genotypeRef = useRef(null);

  // Debounce timer
  const typingTimer = useRef(null);

  // --- New state for warnings ---
  const [barcodeExistsWarning, setBarcodeExistsWarning] = useState(false); // If the barcode is found in DB
  const [yearWarning, setYearWarning] = useState(false); // If first 2 digits != current year
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false); // If user tries to submit < 7 digits

  useEffect(() => {
    // Focus the barcode input field on component mount
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Fetch options for select fields
    fetch('/api/option_config')
      .then((response) => response.json())
      .then((data) => {
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
          post_harvest: groupedOptions.post_harvest || [],
        });
      })
      .catch((error) => console.error('Error fetching options:', error));
  }, []);

  useEffect(() => {
    // When barcode reaches 7 digits, move focus to genotype and check backend
    if (formData.barcode.length === 7) {
      if (genotypeRef.current) {
        genotypeRef.current.focus();
      }
      checkBarcodeInBackend(formData.barcode);
    }

    // Check year warning if at least 2 digits
    if (
      formData.barcode.length >= 2 &&
      formData.barcode.slice(0, 2) !== lastTwoDigits
    ) {
      setYearWarning(true);
    } else {
      setYearWarning(false);
    }
  }, [formData.barcode, lastTwoDigits]);

  // Whenever the user changes a form field
  const handleChange = (event, newValue) => {
    const name = event.target ? event.target.name : event;
    const value = newValue !== undefined ? newValue : event.target.value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Check backend for existing barcode
  const checkBarcodeInBackend = (barcode) => {
    fetch('/api/check_barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          // If we get success, it means barcode already exists => show warning
          setBarcodeExistsWarning(true);
          // Also fill in existing data
          setFormData((prevData) => ({
            ...prevData,
            ...data.data,
          }));
        } else {
          // If not found or error, no warning
          setBarcodeExistsWarning(false);
        }
      })
      .catch((error) => console.error('Error checking barcode:', error));
  };

  // Only allow up to 7 numeric digits in the barcode
  const handleBarcodeChange = (event) => {
    const value = event.target.value;
    if (/^\d{0,7}$/.test(value)) {
      handleChange(event);
    }
  };

  // Genotype change with spellcheck
  const handleGenotypeChange = (event) => {
    handleChange(event);
    const value = event.target.value;

    if (value.length > 2) {
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        spellCheckGenotype(value);
      }, 500);
    }
  };

  // Spellcheck genotype
  const spellCheckGenotype = (inputGenotype) => {
    fetch('/api/spell_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_string: inputGenotype }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Exact match found') {
          if (isNaN(inputGenotype) && inputGenotype[0] !== inputGenotype[0].toUpperCase()) {
            const corrected = inputGenotype.charAt(0).toUpperCase() + inputGenotype.slice(1);
            setGenotypeSuggestion(`Did you mean to capitalize genotype ${corrected}`);
          } else {
            setGenotypeSuggestion('');
          }
        } else if (data.message === 'Partial match found') {
          setGenotypeSuggestion(`Did you mean: ${data.genotype}`);
        } else {
          setGenotypeSuggestion('No match found');
        }
      })
      .catch((error) => {
        console.error('Error checking genotype:', error);
      });
  };

  // --- Handle Form Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // If barcode < 7 digits => show modal & block
    if (formData.barcode.length < 7) {
      setBarcodeModalOpen(true);
      return;
    }

    // Otherwise, proceed with submission
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });

    fetch('/api/add_plant_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          alert('Plant data added successfully!');
          setFormData(initialFormData);
          setBarcodeExistsWarning(false);
          if (barcodeRef.current) {
            barcodeRef.current.focus();
          }
        } else {
          alert('Error: ' + data.message);
        }
      });
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormData);
    setBarcodeExistsWarning(false);
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  };

  return (
    <CssVarsProvider>
      <GlobalStyles
        styles={`
          body {
            overflow: hidden; /* Prevent body from scrolling */
          }
          .scrollable-box {
            overflow-y: auto;
            max-height: 90vh;
          }
          /* Custom scrollbar styles */
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
        `}
      />
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
            maxWidth: '600px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
        >
          {/* NAV Buttons */}
          <IconButton sx={{ position: 'absolute', top: 10, left: 10 }} onClick={() => setView('mainMenu')}>
            <HomeIcon />
          </IconButton>
          <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={handleReset}>
            <RestartAltIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
            Define New Samples
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Barcode Field */}
              <FormControl>
                <FormLabel>Barcode</FormLabel>
                <Input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleBarcodeChange}
                  required
                  inputProps={{
                    maxLength: 7,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  inputRef={barcodeRef}
                  autoFocus
                />
                {/* Barcode Warnings */}
                {barcodeExistsWarning && (
                  <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                    WARNING: This Barcode Already Exists in the Database. You can modify it here or
                    delete it in the FQ Database Menu.
                  </Typography>
                )}
                {yearWarning && formData.barcode.length >= 2 && (
                  <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                    Barcodes should begin with "{lastTwoDigits}" if harvested in {currentYear},
                    and be 7 digits total. For testing, use the format "0000001" etc and denote "TEST" in genotype.
                  </Typography>
                )}
              </FormControl>

              {/* Genotype */}
              <FormControl>
                <FormLabel>Genotype</FormLabel>
                <Input
                  name="genotype"
                  value={formData.genotype}
                  onChange={handleGenotypeChange}
                  required
                  inputRef={genotypeRef}
                />
                {genotypeSuggestion && (
                  <Typography sx={{ color: 'red', fontStyle: 'italic' }}>
                    {genotypeSuggestion === 'No match found'
                      ? 'Are you sure? Not in Database.'
                      : `${genotypeSuggestion}?`}
                  </Typography>
                )}
              </FormControl>

              {/* Stage, Site, Block, Project, Post Harvest */}
              {['stage', 'site', 'block', 'project', 'post_harvest'].map((field) => (
                <FormControl key={field}>
                  <FormLabel>
                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                  </FormLabel>
                  <Select
                    name={field}
                    value={formData[field] || ''}
                    onChange={(_, newValue) => handleChange(field, newValue)}
                    required={['stage', 'site'].includes(field)}
                    slotProps={{
                      popper: {
                        disablePortal: false,
                      },
                      listbox: {
                        sx: {
                          position: 'absolute',
                          zIndex: 1300,
                        },
                      },
                    }}
                  >
                    {(options[field] || []).map((optionValue, idx) => (
                      <Option key={idx} value={optionValue}>
                        {optionValue}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              ))}

              <FormControl>
                <FormLabel>Bush Plant Number</FormLabel>
                <Input
                  name="bush_plant_number"
                  value={formData.bush_plant_number || ''}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Mass</FormLabel>
                <Input
                  name="mass"
                  value={formData.mass || ''}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Number of Berries</FormLabel>
                <Input
                  name="number_of_berries"
                  value={formData.number_of_berries || ''}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>X Berry Mass</FormLabel>
                <Input
                  name="x_berry_mass"
                  value={formData.x_berry_mass || ''}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes || ''}
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

      {/* Modal for short barcodes */}
      <Modal open={barcodeModalOpen} onClose={() => setBarcodeModalOpen(false)}>
        <ModalDialog
          variant="outlined"
          sx={{ maxWidth: 500, textAlign: 'center' }}
        >
          <Typography level="h5" sx={{ mb: 2 }}>
            Invalid Barcode
          </Typography>
          <Typography sx={{ mb: 2 }}>
            A valid barcode must be 7 digits long and typically begins with "{lastTwoDigits}" if
            harvested in {currentYear}. 
            <br />
            For testing, you can use "0000001" or "0000002" and put "TEST" in the genotype field.
          </Typography>
          <Button variant="solid" onClick={() => setBarcodeModalOpen(false)}>
            OK
          </Button>
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
};

export default AddSamples;

