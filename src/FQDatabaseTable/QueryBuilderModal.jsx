import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  Typography,
  Button,
  Box,
  Select,
  Option,
  Input,
  IconButton,
} from '@mui/joy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ALL_FIELDS = [
    'id',
    'barcode',
    'genotype',
    'stage',
    'site',
    'block',
    'project',
    'post_harvest',
    'bush_plant_number',
    'notes',
    'mass',
    'x_berry_mass',
    'number_of_berries',
    'ph',
    'brix',
    'juicemass',
    'tta',
    'mladded',
    'avg_firmness',
    'avg_diameter',
    'sd_firmness',
    'sd_diameter',
    'box',
    'week',
    'timestamp'
  ];
  

const ALL_OPERATORS = ['includes', 'excludes'];

function QueryBuilderModal({ open, onClose, onApply, initialFilters = [] }) {
  // We keep a local copy of the filters while editing in the modal
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    // Whenever we open the modal, copy the filters
    if (open) {
      setLocalFilters(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAddFilter = () => {
    setLocalFilters((prev) => [
      ...prev,
      { field: 'barcode', operator: 'includes', value: '' },
    ]);
  };

  const handleRemoveFilter = (idx) => {
    setLocalFilters((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx, newField) => {
    setLocalFilters((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, field: newField } : f))
    );
  };

  const handleOperatorChange = (idx, newOp) => {
    setLocalFilters((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, operator: newOp } : f))
    );
  };

  const handleValueChange = (idx, newVal) => {
    setLocalFilters((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, value: newVal } : f))
    );
  };

  // Called when user clicks "Apply"
  const handleApply = () => {
    // Return the final filter array to the parent
    onApply(localFilters);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Typography level="h5" sx={{ mb: 2 }}>
          Advanced Search
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {localFilters.map((filter, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                backgroundColor: '#f7f7f7',
                p: 1,
                borderRadius: '4px',
              }}
            >
              {/* Field Dropdown */}
              <Select
                value={filter.field}
                onChange={(e, val) => handleFieldChange(idx, val)}
                sx={{ minWidth: 100 }}
              >
                {ALL_FIELDS.map((field) => (
                  <Option key={field} value={field}>
                    {field}
                  </Option>
                ))}
              </Select>

              {/* Operator Dropdown */}
              <Select
                value={filter.operator}
                onChange={(e, val) => handleOperatorChange(idx, val)}
                sx={{ minWidth: 100 }}
              >
                {ALL_OPERATORS.map((op) => (
                  <Option key={op} value={op}>
                    {op}
                  </Option>
                ))}
              </Select>

              {/* Value Input */}
              <Input
                placeholder="Enter text"
                value={filter.value}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                sx={{ flex: 1 }}
              />

              {/* Remove This Filter */}
              <IconButton variant="soft" color="danger" onClick={() => handleRemoveFilter(idx)}>
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add Filter Button */}
          <Button variant="soft" onClick={handleAddFilter}>
            Add Filter
          </Button>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="plain" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="solid" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default QueryBuilderModal;
