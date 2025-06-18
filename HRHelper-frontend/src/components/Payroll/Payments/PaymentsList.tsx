import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    Stack,
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import { Link as RouterLink } from 'react-router-dom';
  import { Search } from '@mui/icons-material';
  import type { PaymentResponseBasic } from '../../../types/payrollDTO';
  import { getPaymentByParams } from '../../../services/paymentService';
import type { PaymentStatus } from '../../../enums/enums';


  const statuses: PaymentStatus[] = [
    "UNPAID",
    "IN_PROGRESS",
    "PAID"
  ]
  
  const PaymentsList = () => {
    const [payments, setPayments] = useState<PaymentResponseBasic[]>([]);
    const [loading, setLoading] = useState(true);
  
    // Filters
    const [accountSearch, setAccountSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
    useEffect(() => {
      const timeout = setTimeout(() => {
        fetchData();
      }, 400); // debounce
  
      return () => clearTimeout(timeout);
    }, [accountSearch, statusFilter]);
  
    const fetchData = async () => {
      setLoading(true);
      const data = await getPaymentByParams(undefined, undefined, accountSearch || undefined, statusFilter || undefined, undefined);
      setPayments(data);
      setLoading(false);
    };
  
    return (
      <Box px={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Payments</Typography>
          <Button component={RouterLink} to="/payments/create" variant="contained">
            Add Payment
          </Button>
        </Stack>
  
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            label="Search Bank Account"
            size="small"
            value={accountSearch}
            onChange={(e) => setAccountSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white', // Text color
                '& fieldset': {
                  borderColor: 'white', // Default border
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Hover border
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Focused border
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputAdornment-root': {
                color: 'white',
              },
              backgroundColor: 'transparent',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Filter by Status"
            select
            size="small"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white', // Text color
                '& fieldset': {
                  borderColor: 'white', // Default border
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Hover border
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Focused border
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputAdornment-root': {
                color: 'white',
              },
              backgroundColor: 'transparent',
              width: 160
            }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(statuses).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
  
        <TableContainer component={Paper} sx={{ mb: 2, minHeight: '300px' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Bank Account</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Currency</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.bankAccountNumber}</TableCell>
                      <TableCell>{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.currency}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/payments/${payment.id}`}
                          variant="outlined"
                          size="small"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>
    );
  };
  
  export default PaymentsList;
  