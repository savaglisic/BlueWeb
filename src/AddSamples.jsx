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
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const PortalListbox = React.forwardRef(function PortalListbox(props, ref) {
  return ReactDOM.createPortal(<ul {...props} ref={ref} />, document.body);
});

const AddSamples = ({ setView }) => {
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
  const [options, setOptions] = useState({
    stage: [],
    site: [],
    block: [],
    project: [],
    post_harvest: [],
  });
  
  const barcodeRef = useRef(null);
  const genotypeRef = useRef(null);
  const typingTimer = useRef(null); // For debouncing

  useEffect(() => {
    // Focus the barcode input field on component mount
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Fetch options for select fields
    fetch('http://localhost:5000/option_config')
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
  }, [formData.barcode]);

  const handleChange = (event, newValue) => {
    const name = event.target ? event.target.name : event;
    const value = newValue !== undefined ? newValue : event.target.value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkBarcodeInBackend = (barcode) => {
    fetch('http://localhost:5000/check_barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setFormData((prevData) => ({
            ...prevData,
            ...data.data,
          }));
        }
      })
      .catch((error) => console.error('Error checking barcode:', error));
  };

  const handleBarcodeChange = (event) => {
    const value = event.target.value;
    if (/^\d{0,7}$/.test(value)) {
      handleChange(event);
    }
  };

  const handleGenotypeChange = (event) => {
    handleChange(event);
    const value = event.target.value;

    if (value.length > 2) {
      // Clear the debounce timer
      clearTimeout(typingTimer.current);
      
      // Set a new timer to wait before calling spell check
      typingTimer.current = setTimeout(() => {
        spellCheckGenotype(value);
      }, 500); 
    }
  };

  const spellCheckGenotype = (inputGenotype) => {
    fetch('http://localhost:5000/spell_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_string: inputGenotype }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Exact match found') {
          if (isNaN(inputGenotype) && inputGenotype[0] !== inputGenotype[0].toUpperCase()) {
            const correctedGenotype = inputGenotype.charAt(0).toUpperCase() + inputGenotype.slice(1);
            setGenotypeSuggestion(`to capitalize genotype ${correctedGenotype}`);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });

    fetch('http://localhost:5000/add_plant_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          alert('Plant data added successfully!');
          setFormData(initialFormData);
          if (barcodeRef.current) {
            barcodeRef.current.focus();
          }
        } else {
          alert('Error: ' + data.message);
        }
      });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  };

  return (
    <CssVarsProvider>
      <GlobalStyles />
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
              </FormControl>

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
                      ? 'No exact match found'
                      : `Did you mean: ${genotypeSuggestion}?`}
                  </Typography>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Stage</FormLabel>
                <Select
                  name="stage"
                  value={formData.stage}
                  onChange={(_, newValue) => handleChange('stage', newValue)}
                  required
                  slotProps={{
                    listbox: {
                      component: PortalListbox,
                    },
                  }}
                >
                  {options.stage.map((stage, idx) => (
                    <Option key={idx} value={stage}>
                      {stage}
                    </Option>
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
                  slotProps={{
                    listbox: {
                      component: PortalListbox,
                    },
                  }}
                >
                  {options.site.map((site, idx) => (
                    <Option key={idx} value={site}>
                      {site}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Block</FormLabel>
                <Select
                  name="block"
                  value={formData.block}
                  onChange={(_, newValue) => handleChange('block', newValue)}
                  slotProps={{
                    listbox: {
                      component: PortalListbox,
                    },
                  }}
                >
                  {options.block.map((block, idx) => (
                    <Option key={idx} value={block}>
                      {block}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Project</FormLabel>
                <Select
                  name="project"
                  value={formData.project}
                  onChange={(_, newValue) => handleChange('project', newValue)}
                  slotProps={{
                    listbox: {
                      component: PortalListbox,
                    },
                  }}
                >
                  {options.project.map((project, idx) => (
                    <Option key={idx} value={project}>
                      {project}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Post Harvest</FormLabel>
                <Select
                  name="post_harvest"
                  value={formData.post_harvest}
                  onChange={(_, newValue) => handleChange('post_harvest', newValue)}
                  slotProps={{
                    listbox: {
                      component: PortalListbox,
                    },
                  }}
                >
                  {options.post_harvest.map((ph, idx) => (
                    <Option key={idx} value={ph}>
                      {ph}
                    </Option>
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
                <FormLabel>X Berry Mass</FormLabel>
                <Input
                  name="x_berry_mass"
                  value={formData.x_berry_mass}
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
    </CssVarsProvider>
  );
};

export default AddSamples;

