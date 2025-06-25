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
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Check, DoNotDisturb} from "@mui/icons-material";
import { getAllLeaves } from "../../../services/leavesService";
import type { LeaveResponse } from "../../../types/leavesDTO";

const LeavesList = () => {
  const [rows, setRows] = useState<LeaveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beginDate, setBeginDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
 

  const loadData = async () => {
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

  const filteredRows = rows.filter((entry) => {
    const nameMatch = (entry.employee.name + " " + entry.employee.lastname)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const sexMatch =
      statusFilter === "all" ||
      entry.employee.sex.toLowerCase() === statusFilter.toLowerCase();
    return nameMatch && sexMatch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100rem", mx: "8rem", mt: "3rem" }}>
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

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="OCZEKUJĄCE">Oczekujące</MenuItem>
            <MenuItem value="ZATWIERDZONE">Zatwierdzone</MenuItem>
            <MenuItem value="ODRZUCONE">ODRZUCONE</MenuItem>
          </TextField>

          <DatePicker label="Wybierz datę początkową" value={beginDate} onChange={(newValue) => setBeginDate(newValue)} />
          <DatePicker label="Wybierz datę końcową" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
        </Box>
        <Chip label="Sprawdź historie" color="primary" clickable={true}/>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, minHeight: "300px", minWidth: "1050px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Pracownik</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Okres</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rozdzaj</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Złożono</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                  <Chip 
                          avatar={<Avatar>{leave.employee.name.charAt(0)}</Avatar>}
                          label={leave.employee.name + " " + leave.employee.lastname}
                          />
                  </Box>
                </TableCell>
                <TableCell>{new Date(leave.dataStart).toLocaleDateString()}-{new Date(leave.dataKoniec).toLocaleDateString()}</TableCell>

                <TableCell>{leave.rodzaj.replace("_", " ")}</TableCell>

                <TableCell>
                  <Chip 
                    label={leave.status}
                    color={leave.status == "OCZEKUJĄCE" ? "warning" : leave.status == "ZATWIERDZONE" ? "success" : "error" }
                  />
                </TableCell>

                <TableCell>{new Date(leave.złożono).toLocaleDateString()}</TableCell>
                {/* Dodać to żeby to wysyłało PATCH request na backend */}
                <TableCell>
                  <Chip
                    icon={<Check />}
                    label="Akceptuj"
                    clickable
                    color="success"
                    onClick={() => {
                    }}
                  />
                  <Chip
                    icon={<DoNotDisturb />}
                    label="Odrzuć"
                    clickable
                    color="error"
                    onClick={() => {
                    }}
                  />
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
