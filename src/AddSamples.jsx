import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Input,
  Button,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
} from '@mui/joy'; // CssVarsProvider, GlobalStyles removed
import HomeIcon from '@mui/icons-material/Home';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import PageLayout from './PageLayout'; // Import PageLayout

const AddSamples = ({ setView }) => {
  const currentYear = new Date().getFullYear();
  const lastTwoDigits = currentYear.toString().slice(-2);

  const initialFormData = {
    barcode: '', genotype: '', stage: '', site: '', block: '',
    project: '', post_harvest: '', bush_plant_number: '', notes: '',
    mass: '', number_of_berries: '', x_berry_mass: '', ph: '',
    brix: '', juicemass: '', tta: '', mladded: '', avg_firmness: '',
    avg_diameter: '', sd_firmness: '', sd_diameter: '', box: '', bush: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [genotypeSuggestion, setGenotypeSuggestion] = useState('');
  const [options, setOptions] = useState({
    stage: [], site: [], block: [], project: [], post_harvest: [],
  });
  const [barcodeExistsWarning, setBarcodeExistsWarning] = useState(false);
  const [yearWarning, setYearWarning] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const barcodeRef = useRef(null);
  const genotypeRef = useRef(null);
  const typingTimer = useRef(null);
  const prevBarcodeRef = useRef('');

  useEffect(() => {
    if (barcodeRef.current) barcodeRef.current.focus();
  }, []);

  useEffect(() => {
    fetch('/api/option_config')
      .then((res) => res.json())
      .then((data) => {
        const grouped = data.options.reduce((acc, o) => {
          acc[o.option_type] = acc[o.option_type] || [];
          acc[o.option_type].push(o.option_text);
          return acc;
        }, {});
        setOptions({
          stage: grouped.stage || [],
          site: grouped.site || [],
          block: grouped.block || [],
          project: grouped.project || [],
          post_harvest: grouped.post_harvest || [],
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const cur = formData.barcode;
    const prev = prevBarcodeRef.current;
    if (cur !== prev) {
      if (prev.length === 7 && cur !== prev) {
        setFormData((_) => ({ ...initialFormData, barcode: cur }));
        setBarcodeExistsWarning(false);
      }
      prevBarcodeRef.current = cur;
    }
    if (cur.length === 7) {
      if (genotypeRef.current) genotypeRef.current.focus();
      checkBarcodeInBackend(cur);
    }
    setYearWarning(cur.length >= 2 && cur.slice(0, 2) !== lastTwoDigits);
  }, [formData.barcode, lastTwoDigits]); // initialFormData removed from deps to match example

  const checkBarcodeInBackend = (barcode) => {
    fetch('/api/check_barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setBarcodeExistsWarning(true);
          setFormData((p) => ({ ...p, ...data.data }));
        } else {
          setBarcodeExistsWarning(false);
        }
      })
      .catch(console.error);
  };

  // Matched handleChange to the example
  const handleChange = (event, newValue) => {
    const name = event.target ? event.target.name : event; // For Select, event is name. For Input, event is the event object.
    const value = newValue !== undefined ? newValue : event.target.value;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleBarcodeChange = (e) => {
    const v = e.target.value;
    if (/^\d{0,7}$/.test(v)) handleChange(e);
  };

  const handleGenotypeChange = (e) => {
    handleChange(e);
    const v = e.target.value;
    if (v.length > 2) {
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => spellCheckGenotype(v), 500);
    }
  };

  const spellCheckGenotype = (inputGenotype) => {
    fetch('/api/spell_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_string: inputGenotype }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message === 'Exact match found') {
          if (isNaN(inputGenotype) && inputGenotype[0] !== inputGenotype[0].toUpperCase()) {
            const corr = inputGenotype.charAt(0).toUpperCase() + inputGenotype.slice(1);
            setGenotypeSuggestion(`Did you mean to capitalize genotype ${corr}`);
          } else {
            setGenotypeSuggestion('');
          }
        } else if (data.message === 'Partial match found') {
          setGenotypeSuggestion(`Did you mean: ${data.genotype}`);
        } else {
          setGenotypeSuggestion('No match found');
        }
      })
      .catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.barcode.length < 7) {
      setBarcodeModalOpen(true);
      return;
    }
    const cleaned = { ...formData };
    Object.keys(cleaned).forEach((k) => { if (cleaned[k] === '') cleaned[k] = null; });
    fetch('/api/add_plant_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          alert('Plant data added successfully!');
          setFormData(initialFormData);
          setBarcodeExistsWarning(false);
          barcodeRef.current?.focus();
        } else {
          alert('Error: ' + data.message);
        }
      });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setBarcodeExistsWarning(false);
    barcodeRef.current?.focus();
  };

  // Matched handleScan to the example
  const handleScan = (err, result) => {
    if (result) {
      setFormData((p) => ({ ...p, barcode: result.text }));
      setScannerOpen(false);
    }
  };
  
  const scrollableSheetSx = {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    overflowY: 'auto',
    maxHeight: '90vh', 
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
  };

  return (
    <PageLayout maxWidth="600px" innerSheetSx={scrollableSheetSx}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={() => setView('mainMenu')}>
          <HomeIcon />
        </IconButton>
        <Typography level="h5" sx={{ fontWeight: 'bold', color: 'black' }}> {/* variant="h5" changed to level="h5" for Joy UI */}
          Define New Samples
        </Typography>
        <IconButton onClick={handleReset}>
          <RestartAltIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 16 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel>Barcode</FormLabel>
            <Input
              name="barcode"
              value={formData.barcode}
              onChange={handleBarcodeChange}
              required
              inputProps={{ maxLength: 7, inputMode: 'numeric', pattern: '[0-9]*' }} // Matched example
              inputRef={barcodeRef} // Matched example
              endDecorator={
                <IconButton onClick={() => setScannerOpen(true)}>
                  <CameraAltIcon />
                </IconButton>
              }
            />
            {barcodeExistsWarning && (
              <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                WARNING: This Barcode Already Exists in the Database…
              </Typography>
            )}
            {yearWarning && (
              <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1 }}>
                Barcodes should begin with "{lastTwoDigits}" if harvested in {currentYear}.…
              </Typography>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Genotype</FormLabel>
            <Input
              name="genotype"
              value={formData.genotype}
              onChange={handleGenotypeChange}
              required
              ref={genotypeRef} // Matched example
            />
            {genotypeSuggestion && (
              <Typography sx={{ color: 'red', fontStyle: 'italic' }}>
                {genotypeSuggestion === 'No match found'
                  ? 'Are you sure? Not in Database.'
                  : `${genotypeSuggestion}?`}
              </Typography>
            )}
          </FormControl>

          {['stage', 'site', 'block', 'project', 'post_harvest'].map((field) => (
            <FormControl key={field}>
              <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}</FormLabel>
              <Select
                name={field}
                value={formData[field] || ''}
                onChange={(_, v) => handleChange(field, v)} // Matched example's way of calling handleChange
                required={['stage', 'site'].includes(field)}
                slotProps={{
                  popper: { disablePortal: false }, 
                  listbox: { sx: { position: 'absolute', zIndex: 1300 } }, // Matched example
                }}
              >
                {options[field].map((opt, i) => (
                  <Option key={i} value={opt}>{opt}</Option>
                ))}
              </Select>
            </FormControl>
          ))}

          <FormControl><FormLabel>Bush Plant Number</FormLabel><Input name="bush_plant_number" value={formData.bush_plant_number} onChange={handleChange} /></FormControl>
          <FormControl><FormLabel>Mass</FormLabel><Input name="mass" value={formData.mass} onChange={handleChange} /></FormControl>
          <FormControl><FormLabel>Number of Berries</FormLabel><Input name="number_of_berries" value={formData.number_of_berries} onChange={handleChange} /></FormControl>
          <FormControl><FormLabel>X Berry Mass</FormLabel><Input name="x_berry_mass" value={formData.x_berry_mass} onChange={handleChange} /></FormControl>
          <FormControl><FormLabel>Notes</FormLabel><Textarea name="notes" value={formData.notes} onChange={handleChange} minRows={3} /></FormControl>
        </Box>
        <Button type="submit" sx={{ mt: 3, width: '100%' }}>Submit</Button>
      </form>

      <Modal open={barcodeModalOpen} onClose={() => setBarcodeModalOpen(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography level="h5" sx={{ mb: 2 }}>Invalid Barcode</Typography> {/* variant="h5" changed to level="h5" */}
          <Typography sx={{ mb: 2 }}>A valid barcode must be 7 digits long and typically begins with "{lastTwoDigits}" for {currentYear}.…</Typography>
          <Button onClick={() => setBarcodeModalOpen(false)}>OK</Button>
        </ModalDialog>
      </Modal>

      <Modal open={scannerOpen} onClose={() => setScannerOpen(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 460, textAlign: 'center' }}>
          <Typography level="h6" sx={{ mb: 1 }}>Scan Barcode</Typography> {/* variant="h6" changed to level="h6" */}
          <BarcodeScannerComponent width={400} height={300} onUpdate={(err, result) => handleScan(err, result)} />
          <Button sx={{ mt: 2 }} onClick={() => setScannerOpen(false)}>Cancel</Button>
        </ModalDialog>
      </Modal>
    </PageLayout>
  );
};

export default AddSamples;
