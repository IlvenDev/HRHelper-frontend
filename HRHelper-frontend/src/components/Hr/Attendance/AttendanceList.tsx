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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { editAttendance, getAllAttendance, getAttendanceByDateRange } from "../../../services/attendanceService";
import { DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { EditNote } from "@mui/icons-material";
import type { AttendanceEditRequest, AttendanceTimeResponse } from "../../../types/attendanceDTO";

const AttendanceList = () => {
  const [rows, setRows] = useState<AttendanceTimeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState("all");
  const [beginDate, setBeginDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [editedRowId, setEditedRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    date: Date,
    startTime: string;
    endTime: string;
    // status: string;
    przerwa: boolean;
  } | null>(null);

  const loadData = async () => {
    try {
      const data = await getAllAttendance();
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // const [selectedEmployee, setSelectedEmployee] = useState();

  useEffect(() => {
    const fetchDataByDate = async () => {
      if (beginDate && endDate) {
        try {
          setLoading(true);
          const data = await getAttendanceByDateRange(beginDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
          setRows(data);
        } catch (err) {
          console.error("Failed to fetch attendance between dates:", err);
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchDataByDate();
  }, [beginDate, endDate]);
  

  const filteredRows = rows.filter((entry) => {
    if (!entry.employee) return false;
  
    const nameMatch = (entry.employee.name + " " + entry.employee.lastname)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const sexMatch =
      sexFilter === "all" ||
      entry.employee.sex.toLowerCase() === sexFilter.toLowerCase();
  
    return nameMatch && sexMatch;
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const paginatedAttendance = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  

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
          {/* <TextField
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
          /> */}

          {/* <TextField
            select
            size="small"
            label="Sex"
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
          </TextField> */}

          <DatePicker label="Wybierz datę początkową" value={beginDate} onChange={(newValue) => setBeginDate(newValue)} />
          <DatePicker label="Wybierz datę końcową" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
        </Box>
        {/* <Chip label="Sprawdź historie" color="primary" clickable={true}/> */}
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, minHeight: "300px", minWidth: "1050px" }}>
        <Table>
          <TableHead>
            <TableRow >
              <TableCell sx={{ fontWeight: "bold" }}>Pracownik</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rozpoczęcie</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Zakończenie</TableCell>
              {/* <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell> */}
              <TableCell sx={{ fontWeight: "bold" }}>Przerwa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedAttendance.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {record.employee.name.charAt(0)}
                    </Avatar>
                    <Typography>
                      {record.employee.name} {record.employee.lastname}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {editedRowId === record.id ? (
                    <DatePicker
                      format="YYYY-MM-DD"
                      value={dayjs(editValues?.date)}
                      onChange={(newValue) => {
                        if (newValue) {
                          setEditValues((prev) => ({ ...prev!, date: newValue.toDate() }));
                        }
                      }}
                    />
                  ) : (
                    new Date(record.date).toLocaleDateString()
                  )}
                </TableCell>

                <TableCell>
                  {editedRowId === record.id ? (
                    <TextField
                      variant="standard"
                      value={editValues?.startTime || ""}
                      onChange={(e) => setEditValues((prev) => ({ ...prev!, startTime: e.target.value }))}
                    />
                  ) : (
                    record.startTime
                  )}
                </TableCell>

                <TableCell>
                  {editedRowId === record.id ? (
                    <TextField
                      variant="standard"
                      value={editValues?.endTime || ""}
                      onChange={(e) => setEditValues((prev) => ({ ...prev!, endTime: e.target.value }))}
                    />
                  ) : (
                    record.endTime || "-"
                  )}
                </TableCell>

                {/* <TableCell>
                  {editedRowId === record.id ? (
                    <TextField
                      variant="standard"
                      value={editValues?.status || ""}
                      onChange={(e) => setEditValues((prev) => ({ ...prev!, status: e.target.value }))}
                    />
                  ) : (
                    record.status || "-"
                  )}
                </TableCell> */}

                <TableCell>
                  {editedRowId === record.id ? (
                    <TextField
                    select
                    variant="standard"
                    value={editValues?.przerwa ? "true" : "false"}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev!,
                        przerwa: e.target.value === "true",
                      }))
                    }
                  >
                    <MenuItem value="true">Tak</MenuItem>
                    <MenuItem value="false">Nie</MenuItem>
                  </TextField>
                  ) : (
                    record.breakTaken ? "Tak" : "Nie"
                  )}
                </TableCell>


                {/* Dodać to żeby to wysyłało PATCH request na backend */}
                <TableCell>
                  <Chip
                    icon={<EditNote />}
                    label={editedRowId === record.id ? "Zapisz" : "Edytuj"}
                    clickable
                    onClick={async () => {
                      if (editedRowId === record.id) {
                        try {
                          const updatedData: AttendanceEditRequest = {
                            date: editValues?.date,
                            startTime: editValues?.startTime,
                            endTime: editValues?.endTime,
                            breakTaken: editValues?.przerwa,
                          };
                    
                          await editAttendance(record.id, updatedData); // ✅ API call
                    
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === record.id
                                ? {
                                    ...r,
                                    startTime: updatedData.startTime ?? r.startTime,  // fallback to old value
                                    endTime: updatedData.endTime ?? r.endTime,
                                    date: updatedData.date ?? r.date,
                                    breakTaken: updatedData.breakTaken ?? r.breakTaken,
                                  }
                                : r
                            )
                          );
                          
                    
                        } catch (err) {
                          console.error("Failed to update attendance:", err);
                        } finally {
                          setEditedRowId(null);
                          setEditValues(null);
                        }
                      } else {
                        setEditedRowId(record.id);
                        setEditValues({
                          date: new Date(record.date),
                          startTime: record.startTime,
                          endTime: record.endTime || "",
                          przerwa: record.breakTaken,
                        });
                      }
                    }}
                    
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
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]} 
        />
      </Box>
    </Box>
  );
};

export default AttendanceList;
