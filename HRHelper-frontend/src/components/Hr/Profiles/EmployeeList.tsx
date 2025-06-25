import { useEffect, useState } from "react";
import type { EmployeeBasicResponse } from "../../../types/profilesDTO";
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
  TablePagination,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getEmployeeList } from "../../../services/profilesService";
import SearchIcon from "@mui/icons-material/Search";
import { EditNote, History } from "@mui/icons-material";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workTimeFilter, setWorkTimeFilter] = useState("all");
  const [billingTypeFilter, setBillingTypeFilter] = useState("all");

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

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
  
    const filtered = employees
      .filter((emp) =>
        (emp.name + " " + emp.lastname).toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query)
      )
      .filter(
        (emp) => workTimeFilter === "all" || emp.wymiarPracy?.toLowerCase() === workTimeFilter.toLowerCase()
      )
      .filter(
        (emp) => billingTypeFilter === "all" || emp.rodzajRozliczenia?.toLowerCase() === billingTypeFilter.toLowerCase()
      );
  
    setFilteredEmployees(filtered);
    setPage(0); // reset to first page on filter change
  }, [searchQuery, workTimeFilter, billingTypeFilter, employees]);
  

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Slice paginated data
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{width: '100rem', mx: '8rem', mt: '3rem' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={2}
        gap={2}
      >
        <Box display="flex" gap={2}>
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

          <TextField
            select
            size="small"
            label="Wymiar pracy"
            value={workTimeFilter}
            onChange={(e) => setWorkTimeFilter(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'white' },
              '& .MuiInputAdornment-root': { color: 'white' },
              backgroundColor: 'transparent',
              width: '8rem',
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Pełny etat">Pełny etat</MenuItem>
            <MenuItem value="Pół etatu">Pół etatu</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Rodzaj rozliczenia"
            value={billingTypeFilter}
            onChange={(e) => setBillingTypeFilter(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'white' },
              '& .MuiInputAdornment-root': { color: 'white' },
              backgroundColor: 'transparent',
              width: '8rem',
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Tygodniowe">Tygodniowe</MenuItem>
            <MenuItem value="Miesięczne">Miesięczne</MenuItem>
          </TextField>


        </Box>
        <Chip 
          component={RouterLink} 
          to={"/employees/add"}
          label="Dodaj pracownika"
          color="primary"
          clickable
          />
      </Box>

      <TableContainer component={Paper}>
        <Table >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Pracownik</TableCell>
              {/* <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Telefon</TableCell> */}
              <TableCell sx={{ fontWeight: "bold" }}>Data zatrudnienia</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Data zwolnienia</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Stawka</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Wymiar pracy</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rodzaj rozliczenia</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Lata stażu</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Dostępne dni urlopu</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Wykorzystane dni urlopu</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedEmployees.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {/* <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {emp.name.charAt(0)}
                    </Avatar> */}
                    <Chip 
                          avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
                          label={emp.name + " " + emp.lastname}
                          />
                  </Box>
                </TableCell>
                {/* <TableCell><Typography variant="body2">{emp.email}</Typography></TableCell>
                <TableCell><Typography variant="body2">{emp.phone}</Typography></TableCell> */}
                <TableCell>{new Date(emp.dataZatrudnienia).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(emp.dataZwolnienia).toLocaleDateString()}</TableCell>
                <TableCell>{emp.stawka}</TableCell>
                <TableCell>{emp.wymiarPracy}</TableCell>
                <TableCell>{emp.rodzajRozliczenia}</TableCell>
                <TableCell>{emp.staż}</TableCell>
                <TableCell>{emp.dostępneDniUrlopu}</TableCell>
                <TableCell>{emp.wykorzystaneDniUrlopu}</TableCell>
                <TableCell>
                  <Chip
                    icon={<EditNote />}
                    label={"Edytuj"}
                    clickable
                  />
                  <Chip
                    icon={<History />}
                    label={"Historia"}
                    clickable
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        
      </TableContainer>
      <Box sx={{ color: "white", '& .MuiTablePagination-root': { color: "white" }, '& .MuiSvgIcon-root': { color: "white" } }}>
        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]} // Disable page size selector
        />
      </Box>
    </Box>
  );
};

export default EmployeeList;
