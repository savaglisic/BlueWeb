// ColumnSelectionModal.jsx

import React from 'react';
import {
  Modal,
  ModalDialog,
  Checkbox,
  Box,
  Typography,
  Button,
} from '@mui/joy';

/**
 * Props:
 *  - open (boolean): Is the modal open?
 *  - onClose (function): Closes the modal
 *  - sortedColumns (array): All columns, sorted by priority
 *  - selectedFields (array): Fields that are currently selected
 *  - handleToggleColumn (function): Called when user toggles a column
 *  - importantFields (array): Fields that cannot be unchecked
 *  - MIN_COLUMNS (number): Minimum # of columns that must be selected
 *  - MAX_COLUMNS (number): Maximum # of columns allowed
 */
const ColumnSelectionModal = ({
  open,
  onClose,
  sortedColumns,
  selectedFields,
  handleToggleColumn,
  importantFields,
  MIN_COLUMNS,
  MAX_COLUMNS,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: '90%',
          maxWidth: '400px',
          overflowY: 'auto',
          maxHeight: '80vh',
        }}
      >
        <Typography level="h5" sx={{ mb: 2 }}>
          Select Columns
        </Typography>

        {sortedColumns.map((col) => {
          const isChecked = selectedFields.includes(col.field);
          const isDisabled = importantFields.includes(col.field);
          return (
            <Box
              key={col.field}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography>{col.label}</Typography>
              <Checkbox
                disabled={isDisabled}
                checked={isChecked}
                onChange={() => handleToggleColumn(col.field)}
              />
            </Box>
          );
        })}

        <Typography level="body2" sx={{ mt: 1, mb: 1 }}>
          (Must always include Barcode &amp; Genotype; max {MAX_COLUMNS} columns.)
        </Typography>

        <Button variant="solid" onClick={onClose}>
          Done
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default ColumnSelectionModal;
