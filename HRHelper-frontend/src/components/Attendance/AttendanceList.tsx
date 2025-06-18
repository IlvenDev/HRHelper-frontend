import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
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

import type { AttendanceTimeResponse } from "../../types/attendanceDTO"; // Update path as needed
import { getAllAttendance } from "../../services/attendanceService";

const AttendanceList = () => {
  const [attendance, setAttendance] = useState<AttendanceTimeResponse[]>([]);
  const [filtered, setFiltered] = useState<AttendanceTimeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState("all");

  const loadData = async () => {
    try {
      const data = await getAllAttendance();
      setAttendance(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const filteredData = attendance
      .filter((entry) =>
        (entry.employee.name + " " + entry.employee.lastname)
          .toLowerCase()
          .includes(query)
      )
      .filter(
        (entry) =>
          sexFilter === "all" ||
          entry.employee.sex.toLowerCase() === sexFilter.toLowerCase()
      );

    setFiltered(filteredData);
  }, [searchQuery, sexFilter, attendance]);

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
          <TextField
            placeholder="Search employee name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white', // Text color
                '& fieldset': {
                  borderColor: 'white', // Default border
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Hover border
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Focused border
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputAdornment-root': {
                color: 'white',
              },
              backgroundColor: 'transparent',
            }}
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
            label="Sex"
            value={sexFilter}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white', // Text color
                '& fieldset': {
                  borderColor: 'white', // Default border
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Hover border
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Focused border
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputAdornment-root': {
                color: 'white',
              },
              backgroundColor: 'transparent',
            }}
            onChange={(e) => setSexFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
          </TextField>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, minHeight: "300px", minWidth: "1050px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>End Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Sex</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((record, index) => (
              <TableRow key={record.id} hover>
                <TableCell>{index + 1}</TableCell>
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
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.startTime}</TableCell>
                <TableCell>{record.endTime || "-"}</TableCell>
                <TableCell>
                  {record.employee.sex === "M"
                    ? "Male"
                    : record.employee.sex === "F"
                    ? "Female"
                    : record.employee.sex}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceList;
