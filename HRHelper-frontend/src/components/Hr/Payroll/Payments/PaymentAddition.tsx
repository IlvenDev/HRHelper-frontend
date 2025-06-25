import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
    MenuItem,
  } from '@mui/material';
  import { useState } from 'react';
import type { PaymentStatus } from '../../../../enums/enums';
import { requestPayment } from '../../../../services/paymentService';
import type { PaymentRequest } from '../../../../types/payrollDTO';
  
  const PaymentsAddition = () => {
    const [formData, setFormData] = useState<{
      bankAccountNumber: string;
      amount: string;
      currency: string | '';
      status: PaymentStatus | '';
      date: string;
      dueDate: Date;
      paymentDate: Date;
    }>({
      bankAccountNumber: '',
      amount: '',
      currency: '',
      status: '',
      date: '',
      dueDate: new Date(),
      paymentDate: new Date(),
    });
  
    const statuses = [
        "UNPAID",
        "IN_PROGRESS",
        "PAID",
    ] as const

    const currencies = [
      "USD",
      "PLN",
      "EUR",
    ] as const

    const handleChange =
      (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const payload: PaymentRequest = {
        bankAccountNumber: formData.bankAccountNumber,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: formData.status as PaymentStatus,
        dueDate: formData.dueDate,
        paymentDate: formData.paymentDate,
        // if needed, include `date: new Date(formData.date)` in the backend model
      };
  
      await requestPayment(payload);
      // Optionally redirect or clear form
    };
  
    return (
      <Box maxWidth="600px" mx="auto" p={4}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Add Payment
          </Typography>
  
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Bank Account */}
              <TextField
                fullWidth
                label="Bank Account Number"
                value={formData.bankAccountNumber}
                onChange={handleChange('bankAccountNumber')}
                required
              />
  
              {/* Amount */}
              <TextField
                fullWidth
                label="Amount"
                value={formData.amount}
                onChange={handleChange('amount')}
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
              />
  
              {/* Currency */}
              <TextField
                select
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={handleChange('currency')}
                required
              >
                {Object.values(currencies).map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
  
              {/* Status */}
              <TextField
                select
                fullWidth
                label="Payment Status"
                value={formData.status}
                onChange={handleChange('status')}
                required
              >
                {Object.values(statuses).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
  
              {/* Optional: Date */}
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange('date')}
              />
  
              <Box textAlign="right">
                <Button type="submit" variant="contained" size="large">
                  Submit
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    );
  };
  
  export default PaymentsAddition;
  