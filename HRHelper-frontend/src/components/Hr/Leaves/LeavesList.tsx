import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Check, DoNotDisturb } from "@mui/icons-material";
import { getAllLeaves, changeStatus } from "../../../services/leavesService"; // import changeStatus
import type { LeaveResponse } from "../../../types/leavesDTO";
import type { EmployeeBasicResponse } from "../../../types/profilesDTO";
import { updateEmployee, updateLeaveDays } from "../../../services/profilesService";

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
        const payload = {
          dostępneDniUrlopu: employee.dostępneDniUrlopu-length,
          wykorzystaneDniUrlopu: length,
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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2} gap={2}>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search employee name"
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
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="OCZEKUJĄCE">Oczekujące</MenuItem>
            <MenuItem value="ZATWIERDZONE">Zatwierdzone</MenuItem>
            <MenuItem value="ODRZUCONE">ODRZUCONE</MenuItem>
          </TextField>
          <TextField select size="small" label="Rodzaj" value={rodzajFilter} onChange={(e) => setRodzajFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
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
      <TableContainer component={Paper} sx={{ mb: 2, minHeight: "300px", minWidth: "1050px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Pracownik</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Okres</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rodzaj</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Złożono</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Dostępne dni urlopu</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Chip avatar={<Avatar>{leave.employee.name.charAt(0)}</Avatar>} label={leave.employee.name + " " + leave.employee.lastname} />
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(leave.dataStart).toLocaleDateString()} - {new Date(leave.dataKoniec).toLocaleDateString()}
                </TableCell>
                <TableCell>{leave.rodzaj.replace("_", " ")}</TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={leave.status === "OCZEKUJĄCE" ? "warning" : leave.status === "ZATWIERDZONE" ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>{new Date(leave.złożono).toLocaleDateString()}</TableCell>
                <TableCell>{leave.employee.dostępneDniUrlopu}</TableCell>
                <TableCell>
                  {leave.status == "OCZEKUJĄCE" ? (<Box>
                    <Chip
                    icon={<Check />}
                    label="Akceptuj"
                    clickable
                    color="success"
                    onClick={() => handleChangeStatus(leave.id, "ZATWIERDZONE", leave.employee, calculateLeaveDays(leave.dataStart, leave.dataKoniec))}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<DoNotDisturb />}
                    label="Odrzuć"
                    clickable
                    color="error"
                    onClick={() => handleChangeStatus(leave.id, "ODRZUCONE", leave.employee, calculateLeaveDays(leave.dataStart, leave.dataKoniec))}
                  />
                  </Box>) 
                  :
                  <Box>
                  <Chip 
                  label="Sprawdzone"/>
                  </Box>} 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeavesList;
