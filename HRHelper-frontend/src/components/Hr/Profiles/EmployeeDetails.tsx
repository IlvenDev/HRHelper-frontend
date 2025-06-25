import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EmployeeDetailResponse } from '../../../types/profilesDTO';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { deleteEmployee, getEmployeeDetail } from '../../../services/profilesService';

const labelStyle = {
  fontWeight: '600',
  color: 'text.primary',
  mr: 1,
  whiteSpace: 'nowrap',
};

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadEmployee(employeeId: number) {
    try {
      const employee = await getEmployeeDetail(employeeId);
      setEmployee(employee);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(employeeId: number) {
    try {
      console.log("deleting employee", id)
      await deleteEmployee(employeeId);
    } catch (error) {
        console.log(error)
    } finally {
      navigate('/employees')
    }
  }

  useEffect(() => {
    if (id) {
      loadEmployee(Number(id));
    }
  }, [id]);

  if (loading || !employee) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="1000px" mx="auto" p={4}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        {/* Header */}
        <Grid container alignItems="center" spacing={2} mb={3}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" fontWeight="bold" noWrap>
              {employee.name} {employee.lastname}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Employee ID: {employee.id ?? 'N/A'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (id) {
                  handleDelete(parseInt(id));
                }
              }}
            >
              Delete
            </Button>
          </Grid>
        </Grid>

        {/* Personal Information */}
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 1,
            mb: 4,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight="600" color="primary.main">
            Personal Information
          </Typography>
          <Grid container spacing={3}>
            {[
              { label: 'Email', value: employee.email },
              { label: 'Phone', value: employee.phone || '—' },
              { label: 'PESEL', value: employee.pesel || '—' },
              {
                label: 'Date of Birth',
                value: employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString()
                  : '—',
              },
              { label: 'Sex', value: employee.sex || '—' },
            ].map(({ label, value }) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Typography noWrap>
                  <Box component="span" sx={labelStyle}>
                    {label}:
                  </Box>
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Residence */}
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 1,
            mb: 4,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight="600" color="primary.main">
            Residence
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography noWrap>
                <Box component="span" sx={labelStyle}>
                  Address:
                </Box>
                {employee.residenceDetails?.address || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography noWrap>
                <Box component="span" sx={labelStyle}>
                  Zip:
                </Box>
                {employee.residenceDetails?.zip || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography noWrap>
                <Box component="span" sx={labelStyle}>
                  City:
                </Box>
                {employee.residenceDetails?.city || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography noWrap>
                <Box component="span" sx={labelStyle}>
                  State:
                </Box>
                {employee.residenceDetails?.state || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography noWrap>
                <Box component="span" sx={labelStyle}>
                  Country:
                </Box>
                {employee.residenceDetails?.country || '—'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Job Details */}
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 1,
            mb: 4,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight="600" color="primary.main">
            Job Details
          </Typography>
          <Grid container spacing={3}>
            {[
              { label: 'Title', value: employee.jobDetails?.jobTitle || '—' },
              { label: 'Department', value: employee.jobDetails?.department || '—' },
              { label: 'Location', value: employee.jobDetails?.workLocation || '—' },
              { label: 'Employment Type', value: employee.jobDetails?.employmentType || '—' },
              {
                label: 'Employed Since',
                value: employee.jobDetails?.employmentDate
                  ? new Date(employee.jobDetails.employmentDate).toLocaleDateString()
                  : '—',
              },
              {
                label: 'Termination Date',
                value: employee.jobDetails?.terminationDate
                  ? new Date(employee.jobDetails.terminationDate).toLocaleDateString()
                  : '—',
              },
            ].map(({ label, value }) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Typography noWrap>
                  <Box component="span" sx={labelStyle}>
                    {label}:
                  </Box>
                  {value}
                </Typography>
              </Grid>
            ))}

            {employee.jobDetails?.directSupervisor && (
              <Grid item xs={12} sm={6} md={4}>
                <Typography noWrap>
                  <Box component="span" sx={labelStyle}>
                    Supervisor:
                  </Box>
                  {employee.jobDetails.directSupervisor.name}{' '}
                  {employee.jobDetails.directSupervisor.lastname}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Emergency Contact */}
        {employee.emergencyContact && (
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: 3,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" mb={2} fontWeight="600" color="primary.main">
              Emergency Contact
            </Typography>
            <Typography noWrap>
              {employee.emergencyContact.name} {employee.emergencyContact.lastname} –{' '}
              {employee.emergencyContact.phone}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeDetails;
