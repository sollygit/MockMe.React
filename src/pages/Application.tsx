import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';

interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
}

interface StateOption {
  value: number;
  display: string;
}

const stateList: StateOption[] = [
  { value: 0, display: 'NT' },
  { value: 1, display: 'ACT' },
  { value: 2, display: 'NSW' },
  { value: 3, display: 'VIC' },
  { value: 4, display: 'QLD' },
  { value: 5, display: 'SA' },
  { value: 6, display: 'WA' },
  { value: 7, display: 'TAS' },
];

interface FormData {
  country: string;
  state: string;
  postcode: string;
  fullName: string;
}

export function Application() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    country: '',
    state: '',
    postcode: '',
    fullName: '',
  });

  const restUri = process.env.REACT_APP_REST_URI;

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${restUri}/api/trade/countries`);
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.statusText}`);
        }
        const data: Country[] = await response.json();
        setCountries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
        console.error('Error fetching countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [restUri]);

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    const selectedCountryCode = e.target.value as string;
    setFormData(prev => ({
      ...prev,
      country: selectedCountryCode,
      state: '', // Reset state when country changes
      postcode: '', // Reset postcode when country changes
    }));
  };

  const handleStateChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      state: e.target.value as string,
    }));
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      postcode: e.target.value,
    }));
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      fullName: e.target.value,
    }));
  };

  const handleReset = () => {
    setFormData({
      country: '',
      state: '',
      postcode: '',
      fullName: '',
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Find the selected country code
    const selectedCountry = countries.find(c => c.countryCode === formData.country);
    
    // Prepare submission data
    const submissionData = {
      country: formData.country,
      state: selectedCountry?.countryCode === 'AU' ? formData.state : null,
      postcode: selectedCountry?.countryCode === 'AU' ? formData.postcode : null,
      fullName: formData.fullName,
    };

    console.log('Form Submission:', submissionData);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const isAustraliaSelected = formData.country === 'AU';

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <h1>Application Form</h1>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Country Combo Box */}
              <FormControl fullWidth>
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  id="country-select"
                  value={formData.country}
                  label="Country"
                  onChange={handleCountryChange}
                  required
                >
                  <MenuItem value="">
                    <em>Select a country</em>
                  </MenuItem>
                  {countries.map(country => (
                    <MenuItem key={country.countryId} value={country.countryCode}>
                      {country.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* State Combo Box - Only visible for Australia */}
              {isAustraliaSelected && (
                <FormControl fullWidth>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select
                    labelId="state-label"
                    id="state-select"
                    value={formData.state}
                    label="State"
                    onChange={handleStateChange}
                    required
                  >
                    <MenuItem value="">
                      <em>Select a state</em>
                    </MenuItem>
                    {stateList.map(state => (
                      <MenuItem key={state.value} value={state.value.toString()}>
                        {state.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Postcode Text Box */}
              <TextField
                fullWidth
                label="Postcode"
                variant="outlined"
                value={formData.postcode}
                onChange={handlePostcodeChange}
                required={isAustraliaSelected}
                placeholder="e.g., 2089"
              />

              {/* Full Name Text Box */}
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={formData.fullName}
                onChange={handleFullNameChange}
                required
                placeholder="e.g., John Doe"
              />

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Form submitted successfully!
          <br />
          {`Country: ${formData.country}, State: ${isAustraliaSelected ? formData.state : 'null'}, Postcode: ${isAustraliaSelected ? formData.postcode : 'null'}, Full Name: ${formData.fullName}`}
        </Alert>
      </Snackbar>
    </Container>
  );
}
