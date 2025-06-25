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
import type { DepartmentCosts } from '../../../../types/payrollDTO';
import { addCosts } from '../../../../services/departmentCostsService';
  
  // --- ENUMS / Types ---
  export type Department = "IT" | "SALES" | "HR" | "RND";
  
  const departments: Department[] = ["IT", "SALES", "HR", "RND"];
  
  const costTypes = [
    "SALARIES",
    "TRAINING",
    "DEVELOPMENT",
    "RECRUITMENT",
    "ONBOARDING",
    "HEALTH_AND_SAFETY",
    "OFFICE_SPACE",
    "SUPPLIES",
    "LEGAL",
    "CONSULTING",
    "OTHER"
  ] as const;
  
  type CostType = typeof costTypes[number];
  
  const CostsAddition = () => {
    const [formData, setFormData] = useState<{
      department: Department | "";
      date: string;
      amount: string;
      costType: CostType | "";
    }>({
      department: '',
      date: '',
      amount: '',
      costType: '',
    });
  
    const handleChange =
      (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const payload: DepartmentCosts = {
        id: 0, // May be ignored if auto-generated
        department: formData.department as Department,
        amount: parseFloat(formData.amount),
        costType: formData.costType as CostType,
        date: new Date(formData.date),
      };
  
      await addCosts(payload);
    };
  
    return (
      <Box maxWidth="600px" mx="auto" p={4}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Add Department Cost
          </Typography>
  
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Department Dropdown */}
              <TextField
                select
                fullWidth
                label="Department"
                value={formData.department}
                onChange={handleChange('department')}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
  
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
  
              {/* Cost Type Dropdown */}
              <TextField
                select
                fullWidth
                label="Cost Type"
                value={formData.costType}
                onChange={handleChange('costType')}
                required
              >
                {costTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
  
              {/* Date */}
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange('date')}
                required
              />
  
              {/* Submit */}
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
  
  export default CostsAddition;
  