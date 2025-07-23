import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
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
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Check, Done, DoNotDisturb, MoreHoriz } from "@mui/icons-material";
import { getAllLeaves, changeStatus } from "../../../services/leavesService"; // import changeStatus
import type { LeaveResponse } from "../../../types/leavesDTO";
import type { EmployeeBasicResponse, EmployeeLeavesUpdateRequest } from "../../../types/profilesDTO";
import { updateEmployee, updateLeaveDays } from "../../../services/profilesService";
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

const LeavesList = () => {
  const [rows, setRows] = useState<LeaveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beginDate, setBeginDate] = useState<Dayjs | null>(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf("month"));
  const [rodzajFilter, setRodzajFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllLeaves();
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangeStatus = async (leaveId: number, newStatus: string, employee: EmployeeBasicResponse, length: number) => {
    try {
      await changeStatus(leaveId, newStatus);
      if(newStatus == "ZATWIERDZONE") {
        const payload: EmployeeLeavesUpdateRequest = {
          dostępneDniUrlopu: employee.dostępneDniUrlopu-length,
          wykorzystaneDniUrlopu: employee.wykorzystaneDniUrlopu+length,
        }
        await updateLeaveDays(employee.id, payload)
      }
      await loadData(); // reload data after status change
    } catch (error) {
      console.error("Failed to change status", error);
    }
  };

  const filteredRows = rows.filter((entry) => {
    const nameMatch = (entry.employee.name + " " + entry.employee.lastname)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter === "all" || entry.status === statusFilter;
    const rodzajMatch = rodzajFilter === "all" || entry.rodzaj === rodzajFilter;

    const start = dayjs(entry.dataStart);
    const end = dayjs(entry.dataKoniec);

    const beginDateMatch = beginDate ? !start.isBefore(beginDate, "day") : true;
    const endDateMatch = endDate ? !end.isAfter(endDate, "day") : true;

    return nameMatch && statusMatch && rodzajMatch && beginDateMatch && endDateMatch;
  });

  const calculateLeaveDays = (start: Date, end: Date): number => {
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diffInMs / oneDay) + 1; // +1, jeśli chcesz, żeby np. 1-1 = 1 dzień
  };


  const columns: GridColDef<(typeof filteredRows)[number]>[] = [
    // { field: 'id', headerName: 'ID', width: 40 },
    {
      field: 'employee',
      headerName: 'Pracownik',
      width: 160,
      valueGetter: (_, row) => {
        return `${row.employee.name || ''} ${row.employee.lastname || ''}`;
      },
    },
    {
      field: 'dataStart',
      headerName: 'Okres',
      type: 'number',
      width: 180,
      editable: true,
      valueGetter: (_, row) => {
        return `${new Date(row.dataStart).toLocaleDateString() || ' '} - ${new Date(row.dataKoniec).toLocaleDateString() || ''}`
      }
    },
    {
      field: 'czasTrwania',
      headerName: 'Czas trwania',
      width: 130,
      valueGetter: (_, row) => {
        const { dataStart, dataKoniec } = row; 
        if (!dataStart || !dataKoniec) return '-';
        return `${calculateLeaveDays(dataStart, dataKoniec)} dni`; // Return a string or number
      },
    },
    {
      field: 'rodzaj',
      headerName: 'Rodzaj',
      type: 'number',
      width: 190,
      editable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'number',
      width: 160,
      editable: true,
      renderCell: (params: GridRenderCellParams<any, Date>) => {
        const status = params.row.status;

        return (
        <Chip 
          color={status === "OCZEKUJĄCE" ? "warning" : status === "ZATWIERDZONE" ? "success" : "error"}
          size="small"
          label={status}
          tabIndex={params.hasFocus ? 0 : -1}
        />
      )},
    },
    {
      field: 'złożono',
      headerName: 'Złożono',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'dostępneDniUrlopu',
      headerName: 'Dostępne dni urlopu',
      type: 'number',
      width: 200,
      editable: true,
      valueGetter: (_, row) => {
        return `${row.employee.dostępneDniUrlopu || ''}`;
      },
    },
    {
      field: 'actions',
      headerName: 'Akcje',
      width: 240,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, Date>) => {
        const status = params.row.status;
      
        return (
          <Stack mt={1} direction={"row"} spacing={2}>
            {status != 'OCZEKUJĄCE' ? (
              <Chip
                label="Brak akcji"
                color="default"
                size="medium"
              />
            ) : (
              <>
                <Chip
                  icon={<Done />}
                  label="Zatwierdź"
                  color="success"
                  clickable
                  onClick={() => handleChangeStatus(params.row.id, "ZATWIERDZONE", params.row.employee, calculateLeaveDays(params.row.dataStart, params.row.dataKoniec))} // implement this
                />
                <Chip
                  icon={<DoNotDisturb />}
                  label="Odrzuć"
                  color="error"
                  clickable
                  onClick={() => handleChangeStatus(params.row.id, "ODRZUCONE", params.row.employee, calculateLeaveDays(params.row.dataStart, params.row.dataKoniec))} // implement this
                />
              </>
            )}
          </Stack>
        );
      }
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100rem", mx: "8rem", mt: "3rem" }}>
      {/* Filters */}
      <Box display="flex" mb={2} gap={2} ml={"4rem"}>
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
          <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">Wszystkie</MenuItem>
            <MenuItem value="OCZEKUJĄCE">Oczekujące</MenuItem>
            <MenuItem value="ZATWIERDZONE">Zatwierdzone</MenuItem>
            <MenuItem value="ODRZUCONE">ODRZUCONE</MenuItem>
          </TextField>
          <TextField select size="small" label="Rodzaj" value={rodzajFilter} onChange={(e) => setRodzajFilter(e.target.value)}>
            <MenuItem value="all">Wszystkie</MenuItem>
            <MenuItem value="WYPOCZYNKOWY">Wypoczynkowy</MenuItem>
            <MenuItem value="CHOROBOWY">Chorobowy</MenuItem>
            <MenuItem value="OKOLICZNOŚCIOWY">Okolicznościowy</MenuItem>
            <MenuItem value="SZKOLENIOWY">Szkoleniowy</MenuItem>
            <MenuItem value="BEZPŁATNY">Bezpłatny</MenuItem>
            <MenuItem value="WYCHOWAWCZY">Wychowawczy</MenuItem>
            <MenuItem value="MACIERZYŃSKI">Macierzyński</MenuItem>
            <MenuItem value="NA_POSZUKIWANIE_PRACY">Na poszukiwanie pracy</MenuItem>
            <MenuItem value="ODDANIE_KRWI">Oddanie krwi</MenuItem>
            <MenuItem value="SIŁA_WYŻSZA">Siła wyższa</MenuItem>
            <MenuItem value="OPIEKUŃCZY">Opiekuńczy</MenuItem>
          </TextField>
          <DatePicker label="Wybierz datę początkową" value={beginDate} onChange={(newValue) => setBeginDate(newValue)} />
          <DatePicker label="Wybierz datę końcową" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
        </Box>
      </Box>

      {/* Table */}
      <Box display="flex" justifyContent="center" width={"92rem"} margin={"auto"}>
        <DataGrid
          rows={filteredRows}
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

export default LeavesList;
