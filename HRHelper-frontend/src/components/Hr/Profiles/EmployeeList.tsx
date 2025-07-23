import { useEffect, useState } from "react";
import { type EmployeeRequest, type EmployeeBasicResponse } from "../../../types/profilesDTO";
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
import { createEmployee, getEmployeeList } from "../../../services/profilesService";
import SearchIcon from "@mui/icons-material/Search";
import { EditNote, History } from "@mui/icons-material";
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

const EmployeeList = () => {
  const [employees, setEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workTimeFilter, setWorkTimeFilter] = useState("all");
  const [billingTypeFilter, setBillingTypeFilter] = useState("all");

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

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
  

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState<EmployeeRequest>({
    name: "",
    lastname: "",
    email: "",
    pesel: "",
    phone: "",
    dateOfBirth: new Date(),
    sex: "",
    role: "",
    username: "",
    password: "",
    dataZatrudnienia: new Date(),
    dataZwolnienia: null, 
    stawka: 0,
    wymiarPracy: "",
    rodzajRozliczenia: ""
  });

  const handleOpenEmployeeDialog = () => setOpenEmployeeDialog(true);
  const handleCloseEmployeeDialog = () => setOpenEmployeeDialog(false);
  const handleSubmitNewEmployee = async () => {
    await createEmployee(newEmployeeData);
    console.log("Submitting:", newEmployeeData);
    handleCloseEmployeeDialog();
  };

  const columns: GridColDef<(typeof filteredEmployees)[number]>[] = [
    // { field: 'id', headerName: 'ID', width: 40 },
    {
      field: 'fullName',
      headerName: 'Pracownik',
      width: 160,
      valueGetter: (value, row) => `${row.name || ''} ${row.lastname || ''}`,
    },
    {
      field: 'email',
      headerName: 'Email',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'phone',
      headerName: 'Telefon',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'dataZatrudnienia',
      headerName: 'Data zatrudnienia',
      type: 'number',
      width: 140,
      editable: true,
      valueGetter: (_, row) => (
        new Date(row.dataZatrudnienia).toLocaleDateString()
      )
    },
    {
      field: 'dataZwolnienia',
      headerName: 'Data zwolnienia',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'stawka',
      headerName: 'Stawka',
      type: 'number',
      width: 70,
      editable: true,
    },
    {
      field: 'wymiarPracy',
      headerName: 'Wymiar pracy',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'rodzajRozliczenia',
      headerName: 'Rodzaj rozliczenia',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'staż',
      headerName: 'Lata stażu',
      type: 'number',
      width: 100,
      editable: true,
    },
    {
      field: 'dostępneDniUrlopu',
      headerName: 'Dostępny urlop',
      type: 'number',
      width: 120,
      editable: true,
    },
    {
      field: 'wykorzystaneDniUrlopu',
      headerName: 'Wykorzystany',
      type: 'number',
      width: 120,
      editable: true,
    },
    // {
    //   field: 'actions',
    //   headerName: 'Akcje',
    //   sortable: false,
    //   renderCell: (params: GridRenderCellParams<any, Date>) => (
    //     <strong>
    //       <Button
    //         variant="contained"
    //         size="small"
    //         color="primary"
    //         style={{ marginLeft: 16}}
    //         sx={{borderRadius: 4}}
    //         href={`/employees/${params.row.id}`}
    //       >
    //         Detale
    //       </Button>
    //     </strong>
    //   ),
    // },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

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
            placeholder="Znajdź pracownika"
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
            <MenuItem value="all">Wszystkie</MenuItem>
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
            <MenuItem value="all">Wszystkie</MenuItem>
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
                label="Pesel"
                fullWidth
                margin="normal"
                value={newEmployeeData?.pesel}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, pesel: e.target.value })}
              />
              <TextField
                label="Telefon"
                fullWidth
                margin="normal"
                value={newEmployeeData.phone}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
              />
              <TextField
                label="Data urodzenia"
                fullWidth
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newEmployeeData?.dateOfBirth || ""}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, dateOfBirth: e.target.value })}
              />
              <TextField
                select
                label="Płeć"
                fullWidth
                margin="normal"
                value={newEmployeeData?.sex}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, sex: e.target.value })}
              >
                <MenuItem value="M">Mężczyzna</MenuItem>
                <MenuItem value="F">Kobieta</MenuItem>
              </TextField>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={newEmployeeData.username}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, username: e.target.value })}
              />
              <TextField
                label="Hasło"
                fullWidth
                margin="normal"
                value={newEmployeeData.password}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })}
              />
              <TextField
                select
                label="Pozycja"
                fullWidth
                margin="normal"
                value={newEmployeeData?.role}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, role: e.target.value })}
              >
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="USER">Pracownik</MenuItem>
              </TextField>
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
      <Box>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{minHeight: "39rem"}}
        />
      </Box>
    </Box>
  );
};

export default EmployeeList;
