import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

const userValidationSchema = yup.object({
  name: yup.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Name is required'),
  email: yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')
    .required('Password is required'),
  address: yup.string()
    .max(400, 'Address must be at most 400 characters')
    .required('Address is required'),
  role: yup.string()
    .oneOf(['ADMIN', 'USER', 'STORE_OWNER'])
    .required('Role is required')
});

const storeValidationSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters'),
  email: yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  address: yup.string()
    .max(400, 'Address must be at most 400 characters')
    .required('Address is required'),
  ownerId: yup.string()
    .required('Store owner is required')
});

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [dialogType, setDialogType] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, storesRes, ownersRes] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/users'),
        axios.get('/api/stores'),
        axios.get('/api/users', { params: { role: 'STORE_OWNER' } })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
      setStoreOwners(ownersRes.data);
    } catch (error) {
      setError('Failed to fetch data');
    }
  };

  const userFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      address: '',
      role: 'USER'
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await axios.post('/api/users', values);
        setSuccess('User created successfully');
        resetForm();
        setDialogType(null);
        fetchData();
      } catch (error) {
        setError('Failed to create user');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const storeFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      address: '',
      ownerId: ''
    },
    validationSchema: storeValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await axios.post('/api/stores', values);
        setSuccess('Store created successfully');
        resetForm();
        setDialogType(null);
        fetchData();
      } catch (error) {
        setError('Failed to create store');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const userColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 1,
      valueGetter: (params) => 
        params.row.role === 'STORE_OWNER' 
          ? params.row.ownedStore?.averageRating?.toFixed(1) || 'No ratings'
          : 'N/A'
    }
  ];

  const storeColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { 
      field: 'averageRating',
      headerName: 'Rating',
      flex: 1,
      valueGetter: (params) => params.row.averageRating?.toFixed(1) || 'No ratings'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Stores</Typography>
              <Typography variant="h4">{stats.totalStores}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Ratings</Typography>
              <Typography variant="h4">{stats.totalRatings}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Users</Typography>
          <Button
            variant="contained"
            onClick={() => setDialogType('user')}
          >
            Add User
          </Button>
        </Box>
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={users}
            columns={userColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Paper>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Stores</Typography>
          <Button
            variant="contained"
            onClick={() => setDialogType('store')}
          >
            Add Store
          </Button>
        </Box>
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={stores}
            columns={storeColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Paper>
      </Box>

      <Dialog open={dialogType === 'user'} onClose={() => setDialogType(null)}>
        <form onSubmit={userFormik.handleSubmit}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Name"
              value={userFormik.values.name}
              onChange={userFormik.handleChange}
              error={userFormik.touched.name && Boolean(userFormik.errors.name)}
              helperText={userFormik.touched.name && userFormik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Email"
              value={userFormik.values.email}
              onChange={userFormik.handleChange}
              error={userFormik.touched.email && Boolean(userFormik.errors.email)}
              helperText={userFormik.touched.email && userFormik.errors.email}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type="password"
              value={userFormik.values.password}
              onChange={userFormik.handleChange}
              error={userFormik.touched.password && Boolean(userFormik.errors.password)}
              helperText={userFormik.touched.password && userFormik.errors.password}
            />
            <TextField
              fullWidth
              margin="normal"
              name="address"
              label="Address"
              multiline
              rows={3}
              value={userFormik.values.address}
              onChange={userFormik.handleChange}
              error={userFormik.touched.address && Boolean(userFormik.errors.address)}
              helperText={userFormik.touched.address && userFormik.errors.address}
            />
            <TextField
              fullWidth
              margin="normal"
              name="role"
              label="Role"
              select
              value={userFormik.values.role}
              onChange={userFormik.handleChange}
              error={userFormik.touched.role && Boolean(userFormik.errors.role)}
              helperText={userFormik.touched.role && userFormik.errors.role}
            >
              <MenuItem value="USER">Normal User</MenuItem>
              <MenuItem value="STORE_OWNER">Store Owner</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogType(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={dialogType === 'store'} onClose={() => setDialogType(null)}>
        <form onSubmit={storeFormik.handleSubmit}>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Store Name"
              value={storeFormik.values.name}
              onChange={storeFormik.handleChange}
              error={storeFormik.touched.name && Boolean(storeFormik.errors.name)}
              helperText={storeFormik.touched.name && storeFormik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Store Email"
              value={storeFormik.values.email}
              onChange={storeFormik.handleChange}
              error={storeFormik.touched.email && Boolean(storeFormik.errors.email)}
              helperText={storeFormik.touched.email && storeFormik.errors.email}
            />
            <TextField
              fullWidth
              margin="normal"
              name="address"
              label="Store Address"
              multiline
              rows={3}
              value={storeFormik.values.address}
              onChange={storeFormik.handleChange}
              error={storeFormik.touched.address && Boolean(storeFormik.errors.address)}
              helperText={storeFormik.touched.address && storeFormik.errors.address}
            />
            <TextField
              fullWidth
              margin="normal"
              name="ownerId"
              label="Store Owner"
              select
              value={storeFormik.values.ownerId}
              onChange={storeFormik.handleChange}
              error={storeFormik.touched.ownerId && Boolean(storeFormik.errors.ownerId)}
              helperText={storeFormik.touched.ownerId && storeFormik.errors.ownerId}
            >
              {storeOwners.map((owner) => (
                <MenuItem key={owner.id} value={owner.id}>
                  {owner.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogType(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 