import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Rating,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import axios from 'axios';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores', {
        params: {
          name: searchName,
          address: searchAddress
        }
      });
      setStores(response.data);
    } catch (error) {
      setError('Failed to fetch stores');
    }
  };

  const handleRatingSubmit = async () => {
    try {
      await axios.post('/api/ratings', {
        storeId: selectedStore.id,
        rating: ratingValue
      });
      setSuccess('Rating submitted successfully');
      setSelectedStore(null);
      fetchStores();
    } catch (error) {
      setError('Failed to submit rating');
    }
  };

  const handleRatingUpdate = async () => {
    try {
      await axios.put(`/api/ratings/${selectedStore.id}`, {
        rating: ratingValue
      });
      setSuccess('Rating updated successfully');
      setSelectedStore(null);
      fetchStores();
    } catch (error) {
      setError('Failed to update rating');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Store Listings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search by Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchStores()}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search by Address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchStores()}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {store.address}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Overall Rating: {store.averageRating?.toFixed(1) || 'No ratings'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography component="legend">Your Rating:</Typography>
                  <Rating
                    value={store.Ratings?.[0]?.rating || 0}
                    readOnly
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSelectedStore(store);
                    setRatingValue(store.Ratings?.[0]?.rating || 0);
                  }}
                >
                  {store.Ratings?.[0] ? 'Update Rating' : 'Submit Rating'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(selectedStore)} onClose={() => setSelectedStore(null)}>
        <DialogTitle>
          Rate {selectedStore?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <Rating
              value={ratingValue}
              onChange={(event, newValue) => setRatingValue(newValue)}
              size="large"
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {ratingValue} out of 5 stars
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStore(null)}>Cancel</Button>
          <Button
            onClick={selectedStore?.Ratings?.[0] ? handleRatingUpdate : handleRatingSubmit}
            variant="contained"
          >
            {selectedStore?.Ratings?.[0] ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard; 