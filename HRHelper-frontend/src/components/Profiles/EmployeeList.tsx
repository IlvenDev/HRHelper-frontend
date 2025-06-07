import { useEffect, useState } from "react";
import type { EmployeeBasicResponse } from "../../types/profilesDTO";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getEmployeeList } from "../../services/profilesService";
import SearchIcon from "@mui/icons-material/Search";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState("all");

  async function loadEmployees() {
    const employeeList: EmployeeBasicResponse[] = await getEmployeeList();
    setEmployees(employeeList);
    setFilteredEmployees(employeeList);
    setLoading(false);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp =>
      (emp.name + " " + emp.lastname).toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    ).filter(emp => sexFilter === "all" || emp.sex.toLowerCase() === sexFilter.toLowerCase());

    setFilteredEmployees(filtered);
  }, [searchQuery, sexFilter, employees]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box px={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={2}
        gap={2}
      >
        <Box display="flex" gap={2}>
          {/* Search bar */}
          <TextField
            placeholder="Search by name or email"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter dropdown */}
          <TextField
            select
            size="small"
            label="Sex"
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>

          </TextField>
        </Box>

        {/* Add employee button */}
        <Button variant="contained" component={RouterLink} to="/employees/add">
          Add Employee
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, minHeight: '300px', minWidth: '1050px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>DOB</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Sex</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredEmployees.map((emp, index) => (
              <TableRow key={emp.id} hover>
                <TableCell>{index+1}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {emp.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body1">
                      {emp.name} {emp.lastname}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{emp.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{emp.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(emp.dateOfBirth).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {emp.sex === "M" ? "Male" : emp.sex === "F" ? "Female" : emp.sex}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    component={RouterLink}
                    to={`/employees/${emp.id}`}
                    variant="outlined"
                    size="small"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeList;
