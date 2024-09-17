import React, { useState, useRef } from 'react';
import { Box, Typography, CssVarsProvider, Input, Button, CircularProgress } from '@mui/joy';
import axios from 'axios';

const SearchPedigreeDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resultsContainerRef = useRef(null);
  const categoryRefs = useRef({});

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a genotype to search');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/search_genotype`, {
        params: { genotype: searchTerm },
      });
      setSearchResults(response.data);
    } catch (err) {
      setError('Error fetching search results');
    } finally {
      setLoading(false);
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
          }}
        >
          <Typography variant="h4">Search Pedigree Database</Typography>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 3 }}>
            Enter a genotype to search the database:
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Input
              placeholder="Enter genotype..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%', marginBottom: 2 }}
            />
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="danger" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}

          {searchResults && (
            <>
              {/* Horizontal Row of Buttons */}
              <Box sx={{ display: 'flex', overflowX: 'auto', marginTop: 2 }}>
                {Object.keys(searchResults).map((resultKey) => (
                  <Button
                    key={resultKey}
                    onClick={() => {
                      categoryRefs.current[resultKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    sx={{ marginRight: 1 }}
                  >
                    {resultKey.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </Box>

              {/* Search Results Box */}
              <Box
                ref={resultsContainerRef}
                sx={{
                  marginTop: 3,
                  width: '100%',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: 2,
                  border: '1px solid #ccc',
                  borderRadius: 'md',
                  backgroundColor: '#f9f9f9',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                }}
              >
                {Object.keys(searchResults).map((resultKey) => (
                  <Box key={resultKey} sx={{ marginBottom: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'bold', marginTop: 1 }}
                      ref={(el) => {
                        categoryRefs.current[resultKey] = el;
                      }}
                    >
                      {resultKey.replace('_', ' ').toUpperCase()} RESULTS:
                    </Typography>
                    {searchResults[resultKey].length > 0 ? (
                      searchResults[resultKey].map((result, idx) => (
                        <Box
                          key={idx}
                          sx={{ marginBottom: 1, padding: 1, borderBottom: '1px solid #ddd' }}
                        >
                          {Object.keys(result).map((key) => (
                            <Typography key={key} variant="body2">
                              <strong>{key.replace('_', ' ')}:</strong> {result[key]}
                            </Typography>
                          ))}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: '#888' }}>
                        No results found for this category.
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default SearchPedigreeDatabase;

