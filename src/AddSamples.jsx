import React, { useState, useEffect, useRef } from 'react';
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
  // Current year checks
  const currentYear = new Date().getFullYear();
  const lastTwoDigits = currentYear.toString().slice(-2);

  // Initial blank form
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

  // Dropdown options for stage, site, etc.
  const [options, setOptions] = useState({
    stage: [],
    site: [],
    block: [],
    project: [],
    post_harvest: [],
  });

  // Warnings / checks
  const [barcodeExistsWarning, setBarcodeExistsWarning] = useState(false);
  const [yearWarning, setYearWarning] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

  // Input refs
  const barcodeRef = useRef(null);
  const genotypeRef = useRef(null);

  // For debouncing genotype checks
  const typingTimer = useRef(null);

  // Track the previous barcode so we know when the user has changed it
  const prevBarcodeRef = useRef('');

  useEffect(() => {
    // Focus on the barcode field initially
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Fetch select dropdown options on mount
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
    const currentBarcode = formData.barcode;
    const prevBarcode = prevBarcodeRef.current;

    // If user changes from one 7-digit barcode to a different input (either <7 or a new 7),
    // we might want to reset the form if it's not the same barcode.
    if (currentBarcode !== prevBarcode) {
      // If previously we had a 7-digit code loaded, and now it's no longer that code => reset the form
      if (prevBarcode.length === 7 && currentBarcode !== prevBarcode) {
        // Clear if the new code is NOT exactly the same as the old
        // (i.e. user typed a brand new code or shortened it)
        setFormData((old) => ({ ...initialFormData, barcode: currentBarcode }));
        setBarcodeExistsWarning(false);
      }
      // Update prevBarcode
      prevBarcodeRef.current = currentBarcode;
    }

    // If we do have 7 digits now, check DB
    if (currentBarcode.length === 7) {
      // Move focus to genotype
      if (genotypeRef.current) genotypeRef.current.focus();
      // Check in DB
      checkBarcodeInBackend(currentBarcode);
    }

    // Year warning if at least 2 digits exist
    if (currentBarcode.length >= 2 && currentBarcode.slice(0, 2) !== lastTwoDigits) {
      setYearWarning(true);
    } else {
      setYearWarning(false);
    }
  }, [formData.barcode, lastTwoDigits]);

  // Barcode "re-check" logic
  const checkBarcodeInBackend = (barcode) => {
    fetch('/api/check_barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          // If success => it's an existing code
          setBarcodeExistsWarning(true);
          // Merge existing DB data into our form
          setFormData((prevData) => ({
            ...prevData,
            ...data.data,
          }));
        } else {
          // Not found => no warning, keep user input
          setBarcodeExistsWarning(false);
        }
      })
      .catch((error) => console.error('Error checking barcode:', error));
  };

  // Called whenever user changes ANY field. newValue is for the Joy UI <Select>.
  const handleChange = (event, newValue) => {
    const name = event.target ? event.target.name : event; // e.g. "barcode"
    const value = newValue !== undefined ? newValue : event.target.value; // e.g. "1234567"

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Barcode must always be numeric up to 7
  const handleBarcodeChange = (event) => {
    const value = event.target.value;
    if (/^\d{0,7}$/.test(value)) {
      handleChange(event);
    }
  };

  // Genotype with spell-check after 2+ letters typed
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
          if (
            isNaN(inputGenotype) &&
            inputGenotype[0] !== inputGenotype[0].toUpperCase()
          ) {
            const corrected =
              inputGenotype.charAt(0).toUpperCase() + inputGenotype.slice(1);
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

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    // If barcode < 7 => show modal
    if (formData.barcode.length < 7) {
      setBarcodeModalOpen(true);
      return;
    }

    // Clean up empty strings => null
    const cleanedData = { ...formData };
    for (const key in cleanedData) {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    }

    fetch('/api/add_plant_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          alert('Plant data added successfully!');
          setFormData(initialFormData);
          setBarcodeExistsWarning(false);
          // Refocus barcode
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

  // Render
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
          {/* Nav Icons */}
          <IconButton
            sx={{ position: 'absolute', top: 10, left: 10 }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>
          <IconButton
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={handleReset}
          >
            <RestartAltIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
            Define New Samples
          </Typography>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Barcode */}
              <FormControl>
                <FormLabel>Barcode</FormLabel>
                <Input
                  name="barcode"
                  value={formData.barcode || ''}
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
                {barcodeExistsWarning && (
                  <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                    WARNING: This Barcode Already Exists in the Database. You can modify it here or
                    delete it in the FQ Database Menu.
                  </Typography>
                )}
                {yearWarning && formData.barcode.length >= 2 && (
                  <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                    Barcodes should begin with "{lastTwoDigits}" if harvested in {currentYear}.
                    Must be 7 digits. For testing, use "0000001" etc and put "TEST" in genotype.
                  </Typography>
                )}
              </FormControl>

              {/* Genotype */}
              <FormControl>
                <FormLabel>Genotype</FormLabel>
                <Input
                  name="genotype"
                  value={formData.genotype || ''}
                  onChange={handleGenotypeChange}
                  required
                  ref={genotypeRef}
                />
                {genotypeSuggestion && (
                  <Typography sx={{ color: 'red', fontStyle: 'italic' }}>
                    {genotypeSuggestion === 'No match found'
                      ? 'Are you sure? Not in Database.'
                      : `${genotypeSuggestion}?`}
                  </Typography>
                )}
              </FormControl>

              {/* stage, site, block, project, post_harvest */}
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
        <ModalDialog variant="outlined" sx={{ maxWidth: 500, textAlign: 'center' }}>
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

