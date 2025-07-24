import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
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
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { editAttendance, getAllAttendance, getAttendanceByDateRange } from "../../../services/attendanceService";
import { DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { EditNote, MoreHoriz } from "@mui/icons-material";
import type { AttendanceEditRequest, AttendanceTimeResponse } from "../../../types/attendanceDTO";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";

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

  useEffect(() => {
    fetchDataByDate();
  }, [beginDate, endDate]);
  

  const filteredRows = rows.filter((entry) => {
    if (!entry.employee) return false;
  
    const nameMatch = (entry.employee.name + " " + entry.employee.lastname)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return nameMatch;
  });

  const columns: GridColDef<(typeof filteredRows)[number]>[] = [
    // { field: 'id', headerName: 'ID', width: 40 },
    {
      field: 'employee',
      headerName: 'Pracownik',
      width: 160,
      editable: false,
      valueGetter: (_, row) => {
        return `${row.employee.name || ''} ${row.employee.lastname || ''}`;
      },
    },
    { 
      field: 'date',
      headerName: 'Data',
      type: 'date',
      width: 180,
      editable: false,
      filterable: false,
      valueGetter: (_, row) => {
        return new Date(row.date)
      },
      valueFormatter: (value) => {
        return dayjs(value).format('DD/MM/YYYY')
      }
    },
    {
      field: 'startTime', 
      headerName: 'Wejście',
      type: 'dateTime',
      width: 120,
      editable: false,
      filterable: false,
      valueGetter: (_, row) => {
        const [hours, minutes, seconds] = row.startTime.split(":").map(Number);
        return new Date(0, 0, 0, hours, minutes, seconds).getTime(); // returns sortable number
      },
      valueFormatter: (value) => {
        const date = new Date(value);
        return date.toTimeString().substring(0, 8); // "HH:mm:ss"
      },
    },
    {
      field: 'endTime',
      headerName: 'Zakończenie',
      type: 'dateTime',
      width: 190,
      editable: false,
      filterable: false,
      valueGetter: (_, row) => {
        if (!row.endTime) return '';
        const [hours, minutes, seconds] = row.endTime?.split(":").map(Number);
        return new Date(0, 0, 0, hours, minutes, seconds).getTime(); // returns sortable number
      },
      valueFormatter: (value) => {
        const date = new Date(value);
        return date.toTimeString().substring(0, 8); // "HH:mm:ss"
      },
    },
    {
      field: 'breakTaken',
      headerName: 'Wzięto przerwę',
      type: 'number',
      width: 160,
      editable: false,
      sortable: false,
      valueGetter: (_, row) => {
        return `${row.breakTaken ? "Tak" : "Nie"}`;
      },
    },
    // {
    //   field: 'actions',
    //   headerName: 'Akcje',
    //   width: 240,
    //   sortable: false,
    //   renderCell: (params: GridRenderCellParams<any, Date>) => (
    //       <Chip 
    //         icon={<MoreHoriz/>}
    //         label={"Edytuj"}
    //         color="default"
    //         clickable
    //       />
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
    <Box sx={{ width: "100rem", mx: "8rem", mt: "3rem", justifyContent: "center" }}>
      <Box display="flex" mb={2} gap={2} ml={"22.5rem"}>
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
        <DatePicker 
          label="Wybierz datę początkową" 
          value={beginDate} 
          onChange={(newValue) => setBeginDate(newValue)} />
        <DatePicker 
          label="Wybierz datę końcową" 
          value={endDate} 
          onChange={(newValue) => setEndDate(newValue)} />
      </Box>

      <Box display="flex" justifyContent="center" width={"55rem"} margin={"auto"}>
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

export default AttendanceList;
