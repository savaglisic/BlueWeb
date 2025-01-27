import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CssVarsProvider,
  Button,
  Table,
  Tooltip,
  Modal,
  ModalDialog,
  Chip,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useTheme } from '@mui/joy/styles';

import { abbreviations, importantFields, getSortedColumns } from './columns';
import ColumnSelectionModal from './ColumnSelectionModal';
import EditPlantDataDialog from './EditPlantDialog';
import QueryBuilderModal from './QueryBuilderModal';

const FQDatabase = ({ setView }) => {
  // --- Constants ---
  const MIN_COLUMNS = 2; 
  const MAX_COLUMNS = 22; 
  const LOCAL_STORAGE_KEY = 'FQDB_SELECTED_FIELDS';

  // --- Table & Pagination state ---
  const [plantData, setPlantData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const [isFetching, setIsFetching] = useState(false);

  // --- Column selection state ---
  const defaultSelectedFields = [
    'barcode',
    'genotype',
    'stage',
    'site',
    'block',
    'project',
    'post_harvest',
    'mass',
    'ph',
    'brix',
    'tta',
  ];
  const [selectedFields, setSelectedFields] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultSelectedFields;
    } catch (error) {
      console.error('Error parsing selected fields from localStorage:', error);
      return defaultSelectedFields;
    }
  });
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  // --- Delete mode state ---
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // --- Editing state ---
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // --- Advanced search (query builder) state ---
  // e.g. [{ field: 'genotype', operator: 'includes', value: 'Sweet' }, ...]
  const [filters, setFilters] = useState([]);
  const [queryBuilderOpen, setQueryBuilderOpen] = useState(false);

  // Refs/theme
  const containerRef = useRef();
  const theme = useTheme();

  // Sort columns by priority
  const sortedColumns = getSortedColumns();
  // Visible columns
  const visibleColumns = sortedColumns.filter((col) =>
    selectedFields.includes(col.field)
  );

  // --- Effects ---

  // Persist selected columns locally
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedFields));
  }, [selectedFields]);

  /**
   * Whenever `filters` or `currentPage` changes, fetch data from the server.
   * If currentPage = 1, we do a "reset" (replace plantData).
   * If currentPage > 1, we append to allow infinite scrolling.
   */
  useEffect(() => {
    fetchPlantData(currentPage === 1); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  // --- Data fetching ---
  const fetchPlantData = async (reset = false) => {
    try {
      setIsFetching(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        filters: JSON.stringify(filters), 
      };
      const response = await axios.get('/api/get_plant_data', { params });
      const data = response.data;

      if (reset) {
        setPlantData(data.results);
      } else {
        // Append to existing data
        setPlantData((prev) => [...prev, ...data.results]);
      }
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      console.error('Error fetching plant data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Scroll listener for infinite pagination
  const handleScroll = () => {
    const el = containerRef.current;
    if (
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50 &&
      !isFetching &&
      currentPage < pages
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // --- Row click (edit or delete) ---
  const handleRowClick = (plant) => {
    if (deleteMode) {
      setDeleteCandidate(plant);
      setDeleteError('');
      setDeleteDialogOpen(true);
    } else {
      setSelectedPlant(plant);
      setEditDialogOpen(true);
    }
  };

  // --- Delete logic ---
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate?.barcode) return;
    try {
      setDeleteError('');
      await axios.delete('/api/delete_plant_data', {
        data: { barcode: deleteCandidate.barcode },
      });
      // remove from local
      setPlantData((prev) =>
        prev.filter((p) => p.barcode !== deleteCandidate.barcode)
      );
      setDeleteDialogOpen(false);
      setDeleteCandidate(null);
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError(err?.response?.data?.message || 'Error deleting plant data.');
    }
  };
  const handleCloseDeleteDialog = () => {
    setDeleteCandidate(null);
    setDeleteDialogOpen(false);
  };

  // --- Edit logic ---
  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPlant(null);
  };
  const handleEditChange = (field, value) => {
    setSelectedPlant((prev) => ({ ...prev, [field]: value }));
  };
  const handleSaveChanges = async () => {
    if (!selectedPlant) return;
    try {
      await axios.post('/api/add_plant_data', selectedPlant);
      setPlantData((prevData) =>
        prevData.map((p) => (p.id === selectedPlant.id ? selectedPlant : p))
      );
      handleDialogClose();
    } catch (error) {
      console.error('Error updating plant data:', error);
    }
  };

  // --- Column selection modal ---
  const handleOpenColumnModal = () => setColumnModalOpen(true);
  const handleCloseColumnModal = () => setColumnModalOpen(false);

  const handleToggleColumn = (field) => {
    if (importantFields.includes(field)) return;
    setSelectedFields((prev) => {
      const copy = [...prev];
      if (copy.includes(field)) {
        if (copy.length <= MIN_COLUMNS) return prev;
        return copy.filter((f) => f !== field);
      } else {
        if (copy.length >= MAX_COLUMNS) return prev;
        copy.push(field);
        return copy;
      }
    });
  };

  // --- Query builder modal ---
  const handleOpenQueryBuilder = () => setQueryBuilderOpen(true);
  const handleCloseQueryBuilder = () => setQueryBuilderOpen(false);

  const handleApplyFilters = (newFilters) => {
    // Replace filters -> triggers useEffect -> fetch data
    setFilters(newFilters);
    // We also want to reset to the first page
    setCurrentPage(1);
    setQueryBuilderOpen(false);
  };

  const handleRemoveFilter = (idx) => {
    const updated = [...filters];
    updated.splice(idx, 1);
    setFilters(updated);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setFilters([]);
    setCurrentPage(1);
  };

  // --- UI Helpers ---
  const renderHeaderLabel = (col) => {
    if (importantFields.includes(col.field)) return col.label;
    return abbreviations[col.label] || col.label;
  };

  // --- Render ---
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
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            borderRadius: 'md',
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '1200px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: '90vh',
          }}
        >
          {/* Home Icon */}
          <IconButton
            sx={{ position: 'absolute', top: 10, left: 10 }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography level="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            FQ Database
          </Typography>

          {/* Buttons row */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {/* If we have filters, show them as chips */}
              {filters.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {filters.map((f, idx) => (
                    <Chip
                      key={idx}
                      variant="solid"
                      color="primary"
                      onClick={() => handleRemoveFilter(idx)}
                      onDelete={() => handleRemoveFilter(idx)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {f.field} {f.operator} "{f.value}"
                    </Chip>
                  ))}
                  <Button variant="soft" color="neutral" onClick={handleClearAllFilters}>
                    Clear All
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="soft" onClick={handleOpenQueryBuilder}>
                Advanced Search
              </Button>
              <Button variant="soft" onClick={handleOpenColumnModal}>
                Select Columns
              </Button>
              <Button
                variant={deleteMode ? 'solid' : 'soft'}
                color={deleteMode ? 'danger' : 'neutral'}
                onClick={() => setDeleteMode((prev) => !prev)}
              >
                {deleteMode ? 'Cancel Delete Mode' : 'Delete Mode'}
              </Button>
            </Box>
          </Box>

          {/* Table Container */}
          <Box
            ref={containerRef}
            sx={{ overflowY: 'auto', overflowX: 'auto', mt: 3, width: '100%', height: '100%' }}
            onScroll={handleScroll}
          >
            <Table
              aria-label="plant data table"
              stickyHeader
              sx={{
                minWidth: '800px',
                tableLayout: 'fixed',
                '& thead th': {
                  backgroundColor: theme.palette.background.level1,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  p: '0.5em',
                },
                '& th, & td': {
                  whiteSpace: 'nowrap',
                  p: '0.5em',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& tbody tr:hover': {
                  backgroundColor: deleteMode ? '#ffcccc' : theme.palette.background.level2,
                },
                '& th.important-column, & td.important-column': {
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  width: '4.5em',
                },
              }}
            >
              <thead>
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.field}
                      className={importantFields.includes(col.field) ? 'important-column' : ''}
                    >
                      <Tooltip title={col.label} placement="top">
                        <span>{renderHeaderLabel(col)}</span>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plantData.map((plant) => (
                  <tr
                    key={plant.id}
                    onClick={() => handleRowClick(plant)}
                    style={{ cursor: 'pointer' }}
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col.field}
                        className={importantFields.includes(col.field) ? 'important-column' : ''}
                      >
                        {plant[col.field] != null ? plant[col.field] : ''}
                      </td>
                    ))}
                  </tr>
                ))}
                {isFetching && (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <Typography sx={{ textAlign: 'center', p: 2 }}>Loading...</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>

          {/* Edit Dialog */}
          <EditPlantDataDialog
            open={editDialogOpen}
            onClose={handleDialogClose}
            sortedColumns={sortedColumns}
            selectedPlant={selectedPlant}
            handleEditChange={handleEditChange}
            handleSaveChanges={handleSaveChanges}
          />

          {/* Column Selection Modal */}
          <ColumnSelectionModal
            open={columnModalOpen}
            onClose={handleCloseColumnModal}
            sortedColumns={sortedColumns}
            selectedFields={selectedFields}
            handleToggleColumn={handleToggleColumn}
            importantFields={importantFields}
            MIN_COLUMNS={MIN_COLUMNS}
            MAX_COLUMNS={MAX_COLUMNS}
          />

          {/* Delete Confirmation Modal */}
          <Modal open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
            <ModalDialog variant="outlined" color="danger" sx={{ maxWidth: 400, textAlign: 'center' }}>
              <Typography level="h5" sx={{ mb: 1 }}>
                Confirm Deletion
              </Typography>
              {deleteCandidate && (
                <Typography sx={{ mb: 2 }}>
                  Are you sure you want to delete the row with:
                  <br />
                  <strong>Barcode:</strong> {deleteCandidate.barcode} <br />
                  <strong>Genotype:</strong> {deleteCandidate.genotype}
                </Typography>
              )}
              {deleteError && (
                <Typography color="danger" sx={{ mb: 1 }}>
                  {deleteError}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="soft" onClick={handleCloseDeleteDialog}>
                  Cancel
                </Button>
                <Button variant="solid" color="danger" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </Box>
            </ModalDialog>
          </Modal>

          {/* Advanced Search / Query Builder Modal */}
          <QueryBuilderModal
            open={queryBuilderOpen}
            onClose={handleCloseQueryBuilder}
            onApply={handleApplyFilters}
            initialFilters={filters}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQDatabase;


