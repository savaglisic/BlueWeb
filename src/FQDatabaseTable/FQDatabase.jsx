import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CssVarsProvider,
  Input,
  Button,
  FormControl,
  FormLabel,
  Table,
  Tooltip,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useTheme } from '@mui/joy/styles';

// Components & config from our separate files
import { columns, abbreviations, importantFields, getSortedColumns } from './columns';
import ColumnSelectionModal from './ColumnSelectionModal';
import EditPlantDataDialog from './EditPlantDialog';

const FQDatabase = ({ setView }) => {
  // --- Constants ---
  const MIN_COLUMNS = 2;   // must at least show barcode & genotype
  const MAX_COLUMNS = 22;  // or set to whatever max you want

  // --- State variables ---
  const [plantData, setPlantData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const [searchFilters, setSearchFilters] = useState({
    barcode: '',
    genotype: '',
    stage: '',
    site: '',
    block: '',
    project: '',
    post_harvest: '',
  });

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // For the "Select Columns" modal
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  // Default selected columns
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

  // Which columns are currently selected by the user
  const [selectedFields, setSelectedFields] = useState(defaultSelectedFields);

  const containerRef = useRef();
  const theme = useTheme();

  // Sort columns by priority (lowest first)
  const sortedColumns = getSortedColumns();

  // Columns we actually display in the table are those the user has selected
  const visibleColumns = sortedColumns.filter((col) =>
    selectedFields.includes(col.field)
  );

  // --- Effects ---

  // Fetch plant data on mount
  useEffect(() => {
    fetchPlantData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If user scrolls to bottom and we have more pages, load the next page
  useEffect(() => {
    if (currentPage > 1) {
      fetchPlantData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Handlers / Helpers ---

  const handleSearchChange = (field, value) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPlantData(true);
  };

  const fetchPlantData = async (reset = false) => {
    try {
      setIsFetching(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        ...searchFilters,
      };
      const response = await axios.get('/api/get_plant_data', { params });
      const data = response.data;

      if (reset) {
        setPlantData(data.results);
      } else {
        setPlantData((prevData) => [...prevData, ...data.results]);
      }
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      console.error('Error fetching plant data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRowClick = (plant) => {
    setSelectedPlant(plant);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPlant(null);
  };

  const handleEditChange = (field, value) => {
    setSelectedPlant({
      ...selectedPlant,
      [field]: value,
    });
  };

  const handleSaveChanges = async () => {
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

  const handleScroll = () => {
    if (
      containerRef.current.scrollHeight - containerRef.current.scrollTop <=
        containerRef.current.clientHeight + 50 &&
      !isFetching &&
      currentPage < pages
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Render header label with abbreviations for non-important fields
  const renderHeaderLabel = (col) => {
    if (importantFields.includes(col.field)) {
      return col.label;
    } else {
      return abbreviations[col.label] || col.label;
    }
  };

  // --- Column selection modal logic ---
  const handleOpenColumnModal = () => {
    setColumnModalOpen(true);
  };

  const handleCloseColumnModal = () => {
    setColumnModalOpen(false);
  };

  const handleToggleColumn = (field) => {
    // If the column is "barcode" or "genotype", do nothing (cannot uncheck).
    if (importantFields.includes(field)) return;

    // If it's already selected, remove it; otherwise, try to add it
    setSelectedFields((prev) => {
      let updated = [...prev];
      if (updated.includes(field)) {
        // removing a column
        updated = updated.filter((f) => f !== field);

        // Ensure we never go below the 2 mandatory columns
        if (updated.length < MIN_COLUMNS) {
          return prev;
        }
        return updated;
      } else {
        // adding a column
        if (updated.length >= MAX_COLUMNS) {
          return prev; // Reached max, do not add
        }
        updated.push(field);
        return updated;
      }
    });
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
            padding: 3,
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

          {/* "Select Columns" Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button variant="soft" onClick={handleOpenColumnModal}>
              Select Columns To Display
            </Button>
          </Box>

          {/* Search Inputs */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              marginTop: 2,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {sortedColumns
              .filter((col) => searchFilters.hasOwnProperty(col.field))
              .map((col) => (
                <FormControl key={col.field} sx={{ width: '15%' }}>
                  <FormLabel>{col.label}</FormLabel>
                  <Input
                    placeholder={col.label}
                    value={searchFilters[col.field]}
                    onChange={(e) => handleSearchChange(col.field, e.target.value)}
                  />
                </FormControl>
              ))}
            <Button variant="solid" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          {/* Table Container */}
          <Box
            ref={containerRef}
            sx={{
              overflowY: 'auto',
              overflowX: 'auto',
              marginTop: 2,
              width: '100%',
              height: '100%',
            }}
            onScroll={handleScroll}
          >
            {/* Table */}
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
                  padding: '0.5em',
                },
                '& th, & td': {
                  whiteSpace: 'nowrap',
                  padding: '0.5em',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& tbody tr:hover': {
                  backgroundColor: theme.palette.background.level2,
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
                      className={
                        importantFields.includes(col.field) ? 'important-column' : ''
                      }
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
                        className={
                          importantFields.includes(col.field) ? 'important-column' : ''
                        }
                      >
                        {plant[col.field] != null ? plant[col.field] : ''}
                      </td>
                    ))}
                  </tr>
                ))}

                {isFetching && (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <Typography sx={{ textAlign: 'center', padding: 2 }}>
                        Loading...
                      </Typography>
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
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQDatabase;

