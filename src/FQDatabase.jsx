import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CssVarsProvider,
  Input,
  Button,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Table,
  Tooltip,
} from '@mui/joy';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const FQDatabase = ({ setView }) => {
  // State variables
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

  const containerRef = useRef();

  // Responsive columns
  const theme = useTheme();

  // Define important fields
  const importantFields = ['barcode', 'genotype', 'stage', 'site', 'block', 'project'];

  // Define columns with priorities
  const columns = [
    { field: 'barcode', label: 'Barcode', priority: 1 },
    { field: 'genotype', label: 'Genotype', priority: 2 },
    { field: 'stage', label: 'Stage', priority: 3 },
    { field: 'site', label: 'Site', priority: 4 },
    { field: 'block', label: 'Block', priority: 5 },
    { field: 'project', label: 'Project', priority: 6 },
    { field: 'post_harvest', label: 'Post Harvest', priority: 7 },
    { field: 'bush_plant_number', label: 'Bush Plant Number', priority: 8 },
    { field: 'notes', label: 'Notes', priority: 9 },
    { field: 'mass', label: 'Mass', priority: 10 },
    { field: 'x_berry_mass', label: 'X Berry Mass', priority: 11 },
    { field: 'number_of_berries', label: 'Number of Berries', priority: 12 },
    { field: 'ph', label: 'pH', priority: 13 },
    { field: 'brix', label: 'Brix', priority: 14 },
    { field: 'juicemass', label: 'Juice Mass', priority: 15 },
    { field: 'tta', label: 'TTA', priority: 16 },
    { field: 'mladded', label: 'ml Added', priority: 17 },
    { field: 'avg_firmness', label: 'Avg Firmness', priority: 18 },
    { field: 'avg_diameter', label: 'Avg Diameter', priority: 19 },
    { field: 'sd_firmness', label: 'SD Firmness', priority: 20 },
    { field: 'sd_diameter', label: 'SD Diameter', priority: 21 },
    { field: 'box', label: 'Box', priority: 22 },
  ];

  // Abbreviations for non-important columns
  const abbreviations = {
    'Post Harvest': 'PostHarv',
    'Bush Plant Number': 'BushNo',
    'Notes': 'Notes',
    'Mass': 'Mass',
    'X Berry Mass': 'XBerryM',
    'Number of Berries': 'NumBerr',
    'pH': 'pH',
    'Brix': 'Brix',
    'Juice Mass': 'JuiceM',
    'TTA': 'TTA',
    'ml Added': 'mlAdded',
    'Avg Firmness': 'AvgFirm',
    'Avg Diameter': 'AvgDiam',
    'SD Firmness': 'SDFirm',
    'SD Diameter': 'SDDiam',
    'Box': 'Box',
  };

  // Sort columns by priority
  const sortedColumns = columns.slice().sort((a, b) => a.priority - b.priority);

  // Determine visible columns based on screen size with more granularity
  const breakpoints = [
    { maxWidth: 400, priorityThreshold: 6 },
    { maxWidth: 600, priorityThreshold: 6 },
    { maxWidth: 800, priorityThreshold: 8 },
    { maxWidth: 1000, priorityThreshold: 12 },
    { maxWidth: 1200, priorityThreshold: 16 },
  ];

  const [columnPriorityThreshold, setColumnPriorityThreshold] = useState(22);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let threshold = 22; // Default to show all columns
      for (let i = 0; i < breakpoints.length; i++) {
        if (width <= breakpoints[i].maxWidth) {
          threshold = breakpoints[i].priorityThreshold;
          break;
        }
      }
      setColumnPriorityThreshold(threshold);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure important columns are always visible
  const visibleColumns = columns.filter(
    (col) =>
      col.priority <= columnPriorityThreshold || importantFields.includes(col.field)
  );

  // Fetch plant data
  useEffect(() => {
    // Fetch data on initial render
    fetchPlantData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPlantData(true);
  };

  useEffect(() => {
    // Fetch additional pages
    if (currentPage > 1) {
      fetchPlantData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchPlantData = async (reset = false) => {
    try {
      setIsFetching(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        ...searchFilters,
      };
      const response = await axios.get('/api/get_plant_data', {
        params,
      });
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

  // Handle row click
  const handleRowClick = (plant) => {
    setSelectedPlant(plant);
    setEditDialogOpen(true);
  };

  // Handle edit dialog close
  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPlant(null);
  };

  // Handle input changes in edit dialog
  const handleEditChange = (field, value) => {
    setSelectedPlant({
      ...selectedPlant,
      [field]: value,
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Send update to the backend
      await axios.post('/api/add_plant_data', selectedPlant);
      // Update plant data in state
      setPlantData((prevData) =>
        prevData.map((plant) =>
          plant.id === selectedPlant.id ? selectedPlant : plant
        )
      );
      handleDialogClose();
    } catch (error) {
      console.error('Error updating plant data:', error);
    }
  };

  // Handle search input changes
  const handleSearchChange = (field, value) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  // Handle scroll for lazy loading
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
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
            }}
            onClick={() => setView('mainMenu')}
          >
            <HomeIcon />
          </IconButton>

          <Typography level="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            FQ Database
          </Typography>

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

          {/* Table */}
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
          <Modal open={editDialogOpen} onClose={handleDialogClose}>
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
                <Button variant="plain" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save</Button>
              </Box>
            </ModalDialog>
          </Modal>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default FQDatabase;

