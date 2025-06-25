import {
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
  } from '@mui/material';
  import { useState } from 'react';
  import { requestLeave } from '../../../services/leavesService'; // Update path if needed
import type { LeaveType } from '../../../enums/enums';
  
  const leaveTypes: LeaveType[] = ['SICK_LEAVE', 'PAID_TIME_OFF', 'UNPAID_TIME_OFF',];
  
  const LeaveAddition = () => {
    const [formData, setFormData] = useState({
      employeeId: 0, // Optional if inferred
      date: '',
      leaveType: '',
    });
  
    const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        await requestLeave({
          employeeId: formData.employeeId, // Optional
          date: new Date(formData.date),
          leaveType: formData.leaveType as LeaveType,
        });
        // Reset or navigate
      } catch (err) {
        console.error('Leave request failed:', err);
      }
    };
  
    return (
      <Box maxWidth="600px" mx="auto" p={4}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Request Leave
          </Typography>
  
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Optional Employee ID */}
              <TextField
                label="Employee ID"
                fullWidth
                value={formData.employeeId}
                onChange={handleChange('employeeId')}
              />
  
              {/* Leave Date */}
              <TextField
                fullWidth
                label="Leave Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange('date')}
                required
              />
  
              {/* Leave Type */}
              <TextField
                select
                fullWidth
                label="Leave Type"
                value={formData.leaveType}
                onChange={handleChange('leaveType')}
                required
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
  
              {/* Submit Button */}
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
  
  export default LeaveAddition;
  