// EditPlantDataDialog.jsx

import React from 'react';
import {
  Modal,
  ModalDialog,
  Typography,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
} from '@mui/joy';

/**
 * Props:
 *  - open (boolean): Is the dialog open?
 *  - onClose (function): Closes the dialog
 *  - sortedColumns (array): The full column definitions
 *  - selectedPlant (object|null): The plant data we are editing
 *  - handleEditChange (function): Called when any field changes
 *  - handleSaveChanges (function): Called when user clicks "Save"
 */
const EditPlantDataDialog = ({
  open,
  onClose,
  sortedColumns,
  selectedPlant,
  handleEditChange,
  handleSaveChanges,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: '90%',
          maxWidth: '500px',
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
      >
        <Typography level="h5" sx={{ mb: 2 }}>
          Edit Plant Data
        </Typography>

        {selectedPlant &&
          sortedColumns.map((col) => (
            <FormControl key={col.field} sx={{ marginBottom: 2 }}>
              <FormLabel>{col.label}</FormLabel>
              <Input
                value={selectedPlant[col.field] || ''}
                onChange={(e) => handleEditChange(col.field, e.target.value)}
              />
            </FormControl>
          ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="plain" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save</Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default EditPlantDataDialog;
