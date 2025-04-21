// FQDatabase.jsx
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
  // --- Helpers ---
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    let h = d.getHours();
    const min = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${m}-${day} ${h}:${min}${ampm}`;
  };

  // --- Constants ---
  const MIN_COLUMNS = 2;
  const MAX_COLUMNS = 22;
  const LOCAL_STORAGE_KEY = 'FQDB_SELECTED_FIELDS';

  // --- Table & Pagination State ---
  const [plantData, setPlantData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const [isFetching, setIsFetching] = useState(false);

  // --- Column Selection State ---
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
    'week',
    'fruitfirm_timestamp',    // ensure it’s selected by default
  ];
  const [selectedFields, setSelectedFields] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultSelectedFields;
    } catch {
      return defaultSelectedFields;
    }
  });
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  // --- Delete Mode State ---
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // --- Editing State ---
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // --- Advanced Search State ---
  const [filters, setFilters] = useState([]);
  const [queryBuilderOpen, setQueryBuilderOpen] = useState(false);

  // Refs/theme
  const containerRef = useRef();
  const theme = useTheme();

  // Sort columns by priority
  const sortedColumns = getSortedColumns();
  const visibleColumns = sortedColumns.filter(col =>
    selectedFields.includes(col.field)
  );

  // Persist selected columns
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedFields));
  }, [selectedFields]);

  // Fetch on filters or page change
  useEffect(() => {
    fetchPlantData(currentPage === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const fetchPlantData = async (reset = false) => {
    try {
      setIsFetching(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        filters: JSON.stringify(filters),
      };
      const { data } = await axios.get('/api/get_plant_data', { params });
      if (reset) setPlantData(data.results);
      else        setPlantData(prev => [...prev, ...data.results]);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50 &&
      !isFetching &&
      currentPage < pages
    ) {
      setCurrentPage(p => p + 1);
    }
  };

  const handleRowClick = plant => {
    if (deleteMode) {
      setDeleteCandidate(plant);
      setDeleteDialogOpen(true);
      setDeleteError('');
    } else {
      setSelectedPlant(plant);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete('/api/delete_plant_data', {
        data: { barcode: deleteCandidate.barcode },
      });
      setPlantData(prev => prev.filter(p => p.barcode !== deleteCandidate.barcode));
      setDeleteDialogOpen(false);
      setDeleteCandidate(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Error deleting plant data.');
    }
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPlant(null);
  };
  const handleEditChange = (field, value) => {
    setSelectedPlant(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveChanges = async () => {
    try {
      await axios.post('/api/add_plant_data', selectedPlant);
      setPlantData(prev =>
        prev.map(p => (p.id === selectedPlant.id ? selectedPlant : p))
      );
      handleDialogClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleColumn = field => {
    if (importantFields.includes(field)) return;
    setSelectedFields(prev => {
      const copy = [...prev];
      if (copy.includes(field)) {
        if (copy.length <= MIN_COLUMNS) return prev;
        return copy.filter(f => f !== field);
      } else {
        if (copy.length >= MAX_COLUMNS) return prev;
        copy.push(field);
        return copy;
      }
    });
  };

  const renderHeaderLabel = col => {
    return importantFields.includes(col.field)
      ? col.label
      : abbreviations[col.label] || col.label;
  };

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
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: '1200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            height: '90vh',
          }}
        >
          <IconButton
            sx={{ position: 'absolute', top: 10, left: 10 }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography level="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            FQ Database
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="soft" onClick={() => setQueryBuilderOpen(true)}>
              Advanced Search
            </Button>
            <Button variant="soft" onClick={() => setColumnModalOpen(true)}>
              Choose Columns Displayed
            </Button>
            <Button
              variant="soft"
              onClick={() => (window.location.href = '/api/download_plant_data_csv')}
            >
              Download Excel
            </Button>
            <Button
              variant={deleteMode ? 'solid' : 'soft'}
              color={deleteMode ? 'danger' : 'neutral'}
              onClick={() => setDeleteMode(m => !m)}
            >
              {deleteMode ? 'Cancel Delete Mode' : 'Delete Mode'}
            </Button>
          </Box>

          {filters.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {filters.map((f, i) => (
                <Chip
                  key={i}
                  variant="solid"
                  color="primary"
                  onDelete={() => {
                    const up = [...filters];
                    up.splice(i, 1);
                    setFilters(up);
                    setCurrentPage(1);
                  }}
                >
                  {f.field} {f.operator} "{f.value}"
                </Chip>
              ))}
              <Button variant="soft" onClick={() => { setFilters([]); setCurrentPage(1); }}>
                Clear All
              </Button>
            </Box>
          )}

          <Box
            ref={containerRef}
            sx={{ overflowY: 'auto', overflowX: 'auto', mt: 3, height: '100%' }}
            onScroll={handleScroll}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 800,
                tableLayout: 'fixed',
                '& thead th': {
                  backgroundColor: theme.palette.background.level1,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  p: '0.5em',
                },
                '& th.important-column, & td.important-column': {
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  width: '6em',
                },
              }}
            >
              <thead>
                <tr>
                  {visibleColumns.map(col => (
                    <th
                      key={col.field}
                      className={importantFields.includes(col.field) ? 'important-column' : ''}
                    >
                      <Tooltip title={col.label}>
                        <span>{renderHeaderLabel(col)}</span>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plantData.map(plant => (
                  <tr
                    key={plant.id}
                    onClick={() => handleRowClick(plant)}
                    style={{ cursor: 'pointer' }}
                  >
                    {visibleColumns.map(col => (
                      <td
                        key={col.field}
                        className={importantFields.includes(col.field) ? 'important-column' : ''}
                      >
                        {col.field === 'fruitfirm_timestamp'
                          ? formatTimestamp(plant.fruitfirm_timestamp)
                          : plant[col.field] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}

                {isFetching && (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <Typography sx={{ textAlign: 'center', p: 2 }}>
                        Loading...
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <EditPlantDataDialog
            open={editDialogOpen}
            onClose={handleDialogClose}
            sortedColumns={sortedColumns}
            selectedPlant={selectedPlant}
            handleEditChange={handleEditChange}
            handleSaveChanges={handleSaveChanges}
          />

          <ColumnSelectionModal
            open={columnModalOpen}
            onClose={() => setColumnModalOpen(false)}
            sortedColumns={sortedColumns}
            selectedFields={selectedFields}
            handleToggleColumn={handleToggleColumn}
            importantFields={importantFields}
            MIN_COLUMNS={MIN_COLUMNS}
            MAX_COLUMNS={MAX_COLUMNS}
          />

          <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <ModalDialog variant="outlined" color="danger" sx={{ maxWidth: 400, textAlign: 'center' }}>
              <Typography level="h5" sx={{ mb: 1 }}>
                Confirm Deletion
              </Typography>
              {deleteCandidate && (
                <Typography sx={{ mb: 2 }}>
                  Are you sure you want to delete the row with:<br/>
                  <strong>Barcode:</strong> {deleteCandidate.barcode}<br/>
                  <strong>Genotype:</strong> {deleteCandidate.genotype}
                </Typography>
              )}
              {deleteError && (
                <Typography color="danger" sx={{ mb: 1 }}>
                  {deleteError}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="soft" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="solid" color="danger" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </Box>
            </ModalDialog>
          </Modal>

          <QueryBuilderModal
            open={queryBuilderOpen}
            onClose={() => setQueryBuilderOpen(false)}
            onApply={(f) => { setFilters(f); setCurrentPage(1); }}
            initialFilters={filters}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQDatabase;

