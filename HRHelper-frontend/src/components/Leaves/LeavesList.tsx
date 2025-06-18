import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Search as SearchIcon } from '@mui/icons-material';
import type { LeaveStatus } from '../../enums/enums';
import type { LeaveResponse } from '../../types/leavesDTO';
import { getLeavesByParams } from '../../services/leavesService';

const statuses: LeaveStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const LeavesList = () => {
  const [leaves, setLeaves] = useState<LeaveResponse[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    const searchLower = employeeSearch.toLowerCase();

    const filtered = leaves.filter((leave) => {
      const fullName = `${leave.employee.name} ${leave.employee.lastname}`.toLowerCase();
      const matchesName = fullName.includes(searchLower);
      const matchesStatus = !statusFilter || leave.leaveStatus === statusFilter;

      return matchesName && matchesStatus;
    });

    setFilteredLeaves(filtered);
  }, [employeeSearch, statusFilter, leaves]);

  const fetchLeaves = async () => {
    setLoading(true);
    const data = await getLeavesByParams(undefined, undefined, undefined, undefined);
    setLeaves(data);
    setFilteredLeaves(data);
    setLoading(false);
  };

  return (
    <Box px={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Leaves</Typography>
        <Button component={RouterLink} to="/leaves/add" variant="contained">
          Add Leave
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search Employee"
          size="small"
          value={employeeSearch}
          onChange={(e) => setEmployeeSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
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
                <SearchIcon />
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
              color: 'white',
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& .MuiInputAdornment-root': {
              color: 'white',
            },
            backgroundColor: 'transparent',
            width: 160,
          }}
        >
          <MenuItem value="">All</MenuItem>
          {statuses.map((status) => (
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
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Leave Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No leaves found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.id}</TableCell>
                    <TableCell>{leave.employee.name} {leave.employee.lastname}</TableCell>
                    <TableCell>{new Date(leave.date).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{leave.leaveStatus}</TableCell>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/leaves/${leave.id}`}
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

export default LeavesList;
