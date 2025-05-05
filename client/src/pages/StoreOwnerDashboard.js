import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Rating,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const storeResponse = await axios.get('/api/stores', {
        params: { ownerId: user.id }
      });
      
      if (storeResponse.data.length > 0) {
        const userStore = storeResponse.data[0];
        setStore(userStore);

        const ratingsResponse = await axios.get(`/api/stores/${userStore.id}/ratings`);
        setRatings(ratingsResponse.data);
      }
    } catch (error) {
      setError('Failed to fetch store data');
    }
  };

  const ratingColumns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      valueGetter: (params) => params.row.User.name
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      valueGetter: (params) => params.row.User.email
    },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 1,
      renderCell: (params) => (
        <Rating value={params.row.rating} readOnly size="small" />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Submitted On',
      flex: 1,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString()
    }
  ];

  if (!store) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          No store found. Please contact an administrator to assign a store to your account.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Store Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Store Details
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {store.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {store.email}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {store.address}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rating Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Average Rating:
                </Typography>
                <Rating
                  value={store.averageRating || 0}
                  readOnly
                  precision={0.1}
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  ({store.averageRating?.toFixed(1) || 'No ratings'})
                </Typography>
              </Box>
              <Typography variant="body1">
                Total Ratings: {ratings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Rating History
        </Typography>
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={ratings}
            columns={ratingColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default StoreOwnerDashboard; 