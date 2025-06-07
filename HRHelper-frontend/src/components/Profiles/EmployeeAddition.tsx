import {
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
    Grid,
  } from '@mui/material';
  import { useState } from 'react';
import { createEmployee } from '../../services/profilesService';
import type { EmployeeRequest } from '../../types/profilesDTO';
  
const EmployeeAddition = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    pesel: "",
    dateOfBirth: "",
    sex: "",
  
    residence: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  
    jobDetails: {
      jobTitle: "",
      jobDescription: "",
      department: "",
      workLocation: "",
      employmentType: "",
      employmentDate: "",
      terminationDate: new Date(),
      directSupervisorId: 0,
    },
  
    emergencyContact: {
      name: "",
      lastname: "",
      phone: "",
    },
  });
    
      // Fix this and add it to each grid

      const handleChange = (section: keyof typeof formData | null, field: string) => 
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
      
          if (!section) {
            setFormData(prev => ({ ...prev, [field]: value }));
          } else {
            setFormData(prev => ({
              ...prev,
              [section]: {
                ...(prev[section] as Record<string, any>),
                [field]: value,
              },
            }));
          }
        };
      
      
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload: EmployeeRequest = {
          name: formData.name,
          lastname: formData.lastname,
          pesel: formData.pesel,
          phone: formData.phone,
          email: formData.email,
          dateOfBirth: new Date(formData.dateOfBirth), 
          sex: formData.sex,
          jobDetails: {
            ...formData.jobDetails,
            employmentDate: new Date(formData.jobDetails.employmentDate)},                     
          residenceDetails: formData.residence,       
          emergencyContact: formData.emergencyContact
        }

        createEmployee(payload);
      };
    
      // Add validation

      return (
        <Box maxWidth="1000px" mx="auto" p={4}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Add New Employee
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{xs: 4}} >
                      <TextField fullWidth required label="First Name" value={formData.name} onChange={handleChange(null, 'name')} />
                    </Grid>
                    <Grid size={{xs: 4}} >
                      <TextField fullWidth required label="Last Name" value={formData.lastname} onChange={handleChange(null, 'lastname')} />
                    </Grid>
                    <Grid size={{xs: 4}} >
                      <TextField fullWidth required label="Email" value={formData.email} onChange={handleChange(null, 'email')} />
                    </Grid>
                    <Grid size={{xs: 4}} >
                      <TextField fullWidth required label="Phone" value={formData.phone} onChange={handleChange(null, 'phone')} />
                    </Grid>
                    <Grid size={{xs: 4}} >
                      <TextField fullWidth label="PESEL" value={formData.pesel} onChange={handleChange(null, 'pesel')} />
                    </Grid>
                    <Grid size={{xs: 6}} >
                      <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={formData.dateOfBirth} onChange={handleChange(null, 'dateOfBirth')} />
                    </Grid>
                    <Grid size={{xs: 6}} >
                      <TextField fullWidth label="Sex" value={formData.sex} onChange={handleChange(null, 'sex')} />
                    </Grid>
                  </Grid>
                </Box>
    
                <Divider />
    
                {/* Residence Info */}
                <Box>
                  <Typography variant="h6" gutterBottom>Residence Details</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Address" value={formData.residence.address} onChange={handleChange('residence', 'address')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="City" value={formData.residence.city} onChange={handleChange('residence', 'city')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="State" value={formData.residence.state} onChange={handleChange('residence', 'state')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="ZIP" value={formData.residence.zip} onChange={handleChange('residence', 'zip')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Country" value={formData.residence.country} onChange={handleChange('residence', 'country')} />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>Job Details</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Job Title" value={formData.jobDetails.jobTitle} onChange={handleChange('jobDetails', 'jobTitle')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Department" value={formData.jobDetails.department} onChange={handleChange('jobDetails', 'department')} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Job Description" value={formData.jobDetails.jobDescription} onChange={handleChange('jobDetails', 'jobDescription')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Work Location" value={formData.jobDetails.workLocation} onChange={handleChange('jobDetails', 'workLocation')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Employment Type" value={formData.jobDetails.employmentType} onChange={handleChange('jobDetails', 'employmentType')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Direct supervisor" value={formData.jobDetails.directSupervisorId} onChange={handleChange('jobDetails', 'directSupervisorId')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Employment Date" type="date" InputLabelProps={{ shrink: true }} value={formData.jobDetails.employmentDate} onChange={handleChange('jobDetails', 'employmentDate')} />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="First Name" value={formData.emergencyContact.name} onChange={handleChange('emergencyContact', 'name')} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth label="Last Name" value={formData.emergencyContact.lastname} onChange={handleChange('emergencyContact', 'lastname')} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Phone" value={formData.emergencyContact.phone} onChange={handleChange('emergencyContact', 'phone')} />
                    </Grid>
                  </Grid>
                </Box>

    
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

export default EmployeeAddition;
