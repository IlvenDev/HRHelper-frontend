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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    stawka: "",
    wymiarPracy: "Pełny etat",
    rodzajRozliczenia: "Miesięczne",
    dataZatrudnienia: null,
    dataZwolnienia: null,
  });

  const handleOpenEmployeeDialog = () => setOpenEmployeeDialog(true);
  const handleCloseEmployeeDialog = () => setOpenEmployeeDialog(false);
  const handleSubmitNewEmployee = () => {
    // Tu dodaj zapytanie do API lub logikę
    console.log("Submitting:", newEmployeeData);
    handleCloseEmployeeDialog();
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
          label="Dodaj pracownika"
          color="primary"
          clickable
          onClick={handleOpenEmployeeDialog}
          />
          <Dialog
            open={openEmployeeDialog}
            onClose={handleCloseEmployeeDialog}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Dodaj nowego pracownika</DialogTitle>
            <DialogContent>
              <TextField
                label="Imię"
                fullWidth
                margin="normal"
                value={newEmployeeData.name}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
              />
              <TextField
                label="Nazwisko"
                fullWidth
                margin="normal"
                value={newEmployeeData.lastname}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, lastname: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={newEmployeeData.email}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
              />
              <TextField
                label="Telefon"
                fullWidth
                margin="normal"
                value={newEmployeeData.phone}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
              />
              <TextField
                label="Stawka"
                fullWidth
                margin="normal"
                type="number"
                value={newEmployeeData.stawka}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, stawka: e.target.value })}
              />
              <TextField
                select
                label="Wymiar pracy"
                fullWidth
                margin="normal"
                value={newEmployeeData.wymiarPracy}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, wymiarPracy: e.target.value })}
              >
                <MenuItem value="Pełny etat">Pełny etat</MenuItem>
                <MenuItem value="Pół etatu">Pół etatu</MenuItem>
              </TextField>
              <TextField
                select
                label="Rodzaj rozliczenia"
                fullWidth
                margin="normal"
                value={newEmployeeData.rodzajRozliczenia}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, rodzajRozliczenia: e.target.value })}
              >
                <MenuItem value="Miesięczne">Miesięczne</MenuItem>
                <MenuItem value="Tygodniowe">Tygodniowe</MenuItem>
              </TextField>
              <TextField
                label="Data zatrudnienia"
                fullWidth
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newEmployeeData.dataZatrudnienia || ""}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, dataZatrudnienia: e.target.value })}
              />
              <TextField
                label="Data zwolnienia (opcjonalnie)"
                fullWidth
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newEmployeeData.dataZwolnienia || ""}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, dataZwolnienia: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEmployeeDialog}>Anuluj</Button>
              <Button variant="contained" onClick={handleSubmitNewEmployee}>
                Dodaj
              </Button>
            </DialogActions>
          </Dialog>
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
                <TableCell>{emp.stawka + " zł/h"}</TableCell>
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
