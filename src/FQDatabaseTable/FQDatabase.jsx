import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Table, Tooltip, Modal, ModalDialog, Chip } from '@mui/joy'; // CssVarsProvider removed
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useTheme } from '@mui/joy/styles';
import { abbreviations, importantFields, getSortedColumns } from './columns';
import ColumnSelectionModal from './ColumnSelectionModal';
import EditPlantDataDialog from './EditPlantDialog';
import QueryBuilderModal from './QueryBuilderModal';
import PageLayout from '../PageLayout'; // Import PageLayout (adjust path)

const FQDatabase = ({ setView }) => {
  const formatTimestamp = ts => {
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

  const MIN_COLUMNS = 2;
  const MAX_COLUMNS = 22;
  const LOCAL_STORAGE_KEY = 'FQDB_SELECTED_FIELDS';
  const perPage = 20;

  const [yieldView, setYieldView] = useState(false);
  const [plantData, setPlantData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [yieldData, setYieldData] = useState([]);
  const [yieldTotal, setYieldTotal] = useState(0);
  const [yieldPages, setYieldPages] = useState(0);
  const [yieldPage, setYieldPage] = useState(1);
  const [isYieldFetch, setIsYieldFetch] = useState(false);
  const defaultSelectedFields = ['barcode','genotype','stage','site','block','project','post_harvest','mass','ph','brix','tta','week','fruitfirm_timestamp'];
  const [selectedFields, setSelectedFields] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultSelectedFields;
    } catch { return defaultSelectedFields; }
  });
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState([]);
  const [queryBuilderOpen, setQueryBuilderOpen] = useState(false);

  const containerRef = useRef();
  const theme = useTheme();
  const sortedColumns = getSortedColumns();
  const visibleColumns = sortedColumns.filter(col => selectedFields.includes(col.field));
  const renderHeaderLabel = col => importantFields.includes(col.field) ? col.label : abbreviations[col.label] || col.label;

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedFields)); }, [selectedFields]);

  const fetchPlantData = async reset => {
    try {
      setIsFetching(true);
      const params = { page: currentPage, per_page: perPage, filters: JSON.stringify(filters) };
      const { data } = await axios.get('/api/get_plant_data', { params });
      if (reset) setPlantData(data.results);
      else setPlantData(prev => [...prev, ...data.results]);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); } 
    finally { setIsFetching(false); }
  };

  const handleDownloadYield = async () => {
    try {
      const response = await axios.get('/api/download_yield', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'yield.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error('Error downloading yield CSV:', err); }
  };

  const fetchYieldData = async reset => {
    try {
      setIsYieldFetch(true);
      const params = { page: yieldPage, pageSize: perPage };
      const response = await axios.get('/api/pivot_fruit_quality', { params });
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      const totalNum = Number(response.data?.total ?? rows.length);
      setYieldTotal(totalNum);
      setYieldPages(Math.ceil(totalNum / perPage));
      setYieldData(prev => (reset ? rows : [...prev, ...rows]));
    } catch (err) { console.error('Error fetching yield data:', err); } 
    finally { setIsYieldFetch(false); }
  };

  useEffect(() => { if (!yieldView) fetchPlantData(currentPage === 1); }, [filters, currentPage, yieldView]);
  useEffect(() => { if (yieldView) fetchYieldData(yieldPage === 1); }, [yieldPage, yieldView]);
  useEffect(() => {
    if (yieldView) { setYieldPage(1); setYieldData([]); } 
    else { setCurrentPage(1); setPlantData([]); }
  }, [yieldView]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const closeToBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (yieldView) {
      if (closeToBottom && !isYieldFetch && yieldPage < yieldPages) setYieldPage(p => p + 1);
    } else {
      if (closeToBottom && !isFetching && currentPage < pages) setCurrentPage(p => p + 1);
    }
  };

  const handleRowClick = plant => {
    if (yieldView) return;
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
      await axios.delete('/api/delete_plant_data', { data: { barcode: deleteCandidate.barcode } });
      setPlantData(prev => prev.filter(p => p.barcode !== deleteCandidate.barcode));
      setDeleteDialogOpen(false);
      setDeleteCandidate(null);
    } catch (err) { setDeleteError(err?.response?.data?.message || 'Error deleting plant data.'); }
  };

  const handleDialogClose = () => { setSelectedPlant(null); setEditDialogOpen(false); };
  const handleEditChange = (field, value) => { setSelectedPlant(prev => ({ ...prev, [field]: value })); };
  const handleSaveChanges = async () => {
    try {
      await axios.post('/api/add_plant_data', selectedPlant);
      setPlantData(prev => prev.map(p => (p.id === selectedPlant.id ? selectedPlant : p)));
      handleDialogClose();
    } catch (err) { console.error(err); }
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

  const yieldColumns = useMemo(() => {
    if (!Array.isArray(yieldData) || yieldData.length === 0) return [];
    const keys = Object.keys(yieldData[0]);
    const weekCols = keys.filter(k => /^Week\d+$/i.test(k));
    const sortedWeeks = weekCols.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });
    const limitedWeeks = sortedWeeks.slice(-6);
    const cols = ['genotype', 'site', ...limitedWeeks, 'TotalMass'];
    return cols.filter(col => keys.includes(col));
  }, [yieldData]);

  const pageSheetSx = {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    height: '90vh', 
    overflow: 'auto', 
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
  };
  
  return (
    <PageLayout maxWidth="1200px" innerSheetSx={pageSheetSx}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
        <IconButton onClick={() => setView('mainMenu')}>
          <HomeIcon />
        </IconButton>
        <Typography level="h4" sx={{ fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
          {yieldView ? 'Yield Summary' : 'FQ Database'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center', mb:1 }}>
        {!yieldView && (
          <>
            <Button variant="soft" onClick={() => setQueryBuilderOpen(true)}>Advanced Search</Button>
            <Button variant="soft" onClick={() => setColumnModalOpen(true)}>Choose Columns Displayed</Button>
            <Button variant="soft" onClick={() => (window.location.href = '/api/download_plant_data_csv')}>Download Excel</Button>
            <Button variant={deleteMode ? 'solid' : 'soft'} color={deleteMode ? 'danger' : 'neutral'} onClick={() => setDeleteMode(m => !m)}>
              {deleteMode ? 'Cancel Delete Mode' : 'Delete Mode'}
            </Button>
          </>
        )}
        {yieldView && (<Button variant="soft" onClick={handleDownloadYield}>Download Yield CSV</Button>)}
        <Button variant={yieldView ? 'solid' : 'soft'} color={yieldView ? 'primary' : 'neutral'} onClick={() => setYieldView(v => !v)}>
          {yieldView ? 'Exit Yield View' : 'Yield View'}
        </Button>
      </Box>

      {!yieldView && filters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center', mb:1 }}>
          {filters.map((f, i) => (
            <Chip key={i} variant="solid" color="primary" onDelete={() => { const up = [...filters]; up.splice(i, 1); setFilters(up); setCurrentPage(1); }}>
              {f.field} {f.operator} "{f.value}"
            </Chip>
          ))}
          <Button variant="soft" onClick={() => { setFilters([]); setCurrentPage(1); }}>Clear All</Button>
        </Box>
      )}

      <Box
        ref={containerRef}
        sx={{ overflowY: 'auto', overflowX: 'auto', flexGrow: 1, width: '100%' }} 
        onScroll={handleScroll}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: 800, tableLayout: 'fixed',
            '& thead th': { backgroundColor: theme.palette.background.level1, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', p: '0.5em' },
            '& th.important-column, & td.important-column': { whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', width: '6em' }
          }}
        >
          <thead>
            <tr>
              {yieldView
                ? yieldColumns.map(col => <th key={col}>{col}</th>)
                : visibleColumns.map(col => (
                    <th key={col.field} className={importantFields.includes(col.field) ? 'important-column' : ''}>
                      <Tooltip title={col.label}><span>{renderHeaderLabel(col)}</span></Tooltip>
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {yieldView && yieldData.map((row, idx) => (
              <tr key={idx}>
                {yieldColumns.map(col => {
                  const value = row[col];
                  return (<td key={col} style={value === 0 || value === '0' ? { backgroundColor: 'yellow' } : {}}>{value}</td>);
                })}
              </tr>
            ))}
            {!yieldView && plantData.map(plant => (
              <tr key={plant.id} onClick={() => handleRowClick(plant)} style={{ cursor: yieldView ? 'default' : 'pointer' }}>
                {visibleColumns.map(col => (
                  <td key={col.field} className={importantFields.includes(col.field) ? 'important-column' : ''}>
                    {col.field === 'fruitfirm_timestamp' ? formatTimestamp(plant.fruitfirm_timestamp) : plant[col.field] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
            {(isFetching || isYieldFetch) && (
              <tr><td colSpan={yieldView ? yieldColumns.length || 1 : visibleColumns.length}><Typography sx={{ textAlign: 'center', p: 2 }}>Loading...</Typography></td></tr>
            )}
          </tbody>
        </Table>
      </Box>

      {!yieldView && (
        <>
          <EditPlantDataDialog open={editDialogOpen} onClose={handleDialogClose} sortedColumns={sortedColumns} selectedPlant={selectedPlant} handleEditChange={handleEditChange} handleSaveChanges={handleSaveChanges} />
          <ColumnSelectionModal open={columnModalOpen} onClose={() => setColumnModalOpen(false)} sortedColumns={sortedColumns} selectedFields={selectedFields} handleToggleColumn={handleToggleColumn} importantFields={importantFields} MIN_COLUMNS={MIN_COLUMNS} MAX_COLUMNS={MAX_COLUMNS} />
          <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <ModalDialog variant="outlined" color="danger" sx={{ maxWidth: 400, textAlign: 'center' }}>
              <Typography level="h5" sx={{ mb: 1 }}>Confirm Deletion</Typography>
              {deleteCandidate && (<Typography sx={{ mb: 2 }}>Are you sure you want to delete the row with:<br /><strong>Barcode:</strong> {deleteCandidate.barcode}<br /><strong>Genotype:</strong> {deleteCandidate.genotype}</Typography>)}
              {deleteError && <Typography color="danger" sx={{ mb: 1 }}>{deleteError}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}><Button variant="soft" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button variant="solid" color="danger" onClick={handleDeleteConfirm}>Delete</Button></Box>
            </ModalDialog>
          </Modal>
          <QueryBuilderModal open={queryBuilderOpen} onClose={() => setQueryBuilderOpen(false)} onApply={f => { setFilters(f); setCurrentPage(1); }} initialFilters={filters} />
        </>
      )}
    </PageLayout>
  );
};

export default FQDatabase;
