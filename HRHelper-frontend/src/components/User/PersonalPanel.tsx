import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Stack,
  Button,
  TablePagination,
  TableContainer,
  Chip,
} from "@mui/material";
import type { EmployeeBasicResponse } from "../../types/profilesDTO";
import { getById } from "../../services/profilesService";
import { getEmployeeLeaves } from "../../services/leavesService";
import type { LeaveResponse } from "../../types/leavesDTO";
import { finalizeAttendance, initializeAttendance } from "../../services/attendanceService";
import type { AttendanceTimeRequest } from "../../types/attendanceDTO";
import { data } from "react-router-dom";



const activeLeaves = [
    { id: 1, employee: "Anna", from: "2025-06-01", to: "2025-06-05", status: "Aktywny" },
    { id: 2, employee: "Marek", from: "2025-06-10", to: "2025-06-15", status: "Aktywny" },
    // ... więcej
  ];
  
  const oldLeaves = [
    { id: 101, employee: "Kasia", from: "2024-12-01", to: "2024-12-10", status: "Zakończony" },
    { id: 102, employee: "Paweł", from: "2024-11-05", to: "2024-11-10", status: "Zakończony" },
    // ... więcej
  ];

const PersonalPanel = () => {
  const [loading, setLoading] = useState(true);

 
  const [employeeData, setEmployeeData] = useState<EmployeeBasicResponse | undefined>();

  async function loadEmployee() {
      const employee = await getById(Number(localStorage.getItem("employeeId")))
      setEmployeeData(employee);
      setLoading(false);
  }

  useEffect(() => {
    loadEmployee();
  }, []);

  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [breakTaken, setBreakTaken] = useState(false);

  useEffect(() => {
    let interval: any;

    if (isWorking) {
      interval = setInterval(() => {
        setTimeInSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isWorking]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const [attendanceId, setAttendanceId] = useState<Number>();

  const handleStart = async () => {
    setIsWorking(true);
    setIsOnBreak(false);
    setBreakTaken(false);
    setTimeInSeconds(0);

    const now = new Date();
    const today = new Date(now.toISOString().split("T")[0])
    const time = now.toTimeString().split(' ')[0]

    const payload: AttendanceTimeRequest = {
        employeeId: Number(localStorage.getItem("employeeId")),
        date: today,
        startTime: time,
    }

    try {
        const response = await initializeAttendance(payload);
        setAttendanceId(response.id)
    } catch (err) {
        console.error(err)
    }
  };
  
  const handleStop = async () => {
    setIsWorking(false);
    setIsOnBreak(false);
    setBreakTaken(false);
    setTimeInSeconds(0);

    const now = new Date();
    const time = now.toTimeString().split(' ')[0]

    try {
        await finalizeAttendance(Number(attendanceId), time, breakTaken);
    } catch (err) {
        console.error(err)
    }
  };

  const handleBreakToggle = () => {
    if (!isOnBreak && breakTaken) return; // nie pozwól wziąć przerwy drugi raz
  
    setIsOnBreak((prev) => {
      const goingOnBreak = !prev;
      if (goingOnBreak) setBreakTaken(true); // oznacz że przerwa została wzięta
      return goingOnBreak;
    });
  };

  const [pageActive, setPageActive] = useState(0);
  const [rowsPerPageActive, setRowsPerPageActive] = useState(5);

  // Paginacja dla starych urlopów
  const [pageOld, setPageOld] = useState(0);
  const [rowsPerPageOld, setRowsPerPageOld] = useState(5);

  const handleChangePageActive = (_event: unknown, newPage: number) => {
    setPageActive(newPage);
  };

  const handleChangeRowsPerPageActive = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageActive(parseInt(event.target.value, 10));
    setPageActive(0);
  };

  const handleChangePageOld = (_event: unknown, newPage: number) => {
    setPageOld(newPage);
  };

  const handleChangeRowsPerPageOld = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageOld(parseInt(event.target.value, 10));
    setPageOld(0);
  };

  const [employeeLeaves, setEmployeeLeaves] = useState<LeaveResponse[] | undefined>();

  async function loadLeaves() {
    const response = await getEmployeeLeaves(Number(localStorage.getItem("employeeId")))
    setEmployeeLeaves(response)
  }

  useEffect(() => {
    loadLeaves();
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

// Przyciski do rozpoczęcia z licznikiem czasu + przycisk do zejścia na przerwe + "Wpisz stare godziny"
// Dane pracownika (te z listy) + możliwość edycji
// Lista aktywnych próśb o urlop i historia urlopów
// Zrób raport

  return (
    <Box sx={{width: '100rem', mx: '29rem', mt: '3rem' }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        
      </Typography>

      <Grid container >
        {/* Obecni pracownicy */}
        <Grid size={7}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3, minHeight: "16rem" }}>
                <Typography variant="h5" gutterBottom>
                    Moduł pracy
                </Typography>

                <Box mt={2}>
                    <Typography variant="h4">Czas pracy: {formatTime(timeInSeconds)}</Typography>
                    {isOnBreak && (
                    <Typography variant="h6" color="warning.main" mt={1}>
                        Przerwa aktywna
                    </Typography>
                    )}
                </Box>

                <Stack direction="row" spacing={2} mt={3}>
                    {!isWorking && (
                    <Button variant="contained" onClick={handleStart}>
                        Rozpocznij pracę
                    </Button>
                    )}

                    {isWorking && (
                    <>
                        <Button
                        variant="outlined"
                        color={isOnBreak ? "success" : "warning"}
                        onClick={handleBreakToggle}
                        disabled={breakTaken && !isOnBreak} // zablokuj jeśli przerwa już była i użytkownik nie jest obecnie na niej
                        >
                        {isOnBreak ? "Wróć do pracy" : "Przerwa"}
                        </Button>
                        <Button variant="contained" color="error" onClick={handleStop}>
                        Zakończ
                        </Button>
                    </>
                    )}
                </Stack>
                <Button
                    variant="text"
                    color="secondary"
                    sx={{ mt: 4 }}
                    onClick={() => alert("Tu będzie wpisywanie starych godzin")}
                >
                    Wpisz stare godziny
                </Button>
            </Paper>
            <Paper sx={{ p: 3, maxHeight: "12rem", overflow: "auto"}}>
                    <Table size="small">
                    <TableHead>
                        <TableRow>
                        <TableCell><b>Pracownik</b></TableCell>
                        <TableCell><b>Data zatrudnienia</b></TableCell>
                        <TableCell><b>Data zwolnienia</b></TableCell>
                        <TableCell><b>Stawka</b></TableCell>
                        <TableCell><b>Wymiar pracy</b></TableCell>
                        <TableCell><b>Rodzaj rozliczenia</b></TableCell>
                        <TableCell><b>Lata stażu</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Przykładowy wpis – zastąp danymi z mapy */}
                        <TableRow>
                        <TableCell>{employeeData.name + " " + employeeData.lastname}</TableCell>
                        <TableCell>{new Date(employeeData?.dataZatrudnienia).toLocaleDateString()}</TableCell>
                        <TableCell>{employeeData?.dataZwolnienia != null ? new Date(employeeData?.dataZwolnienia).toLocaleDateString() : "-" }</TableCell>
                        <TableCell>{employeeData?.stawka + " zł/h"}</TableCell>
                        <TableCell>{employeeData?.wymiarPracy}</TableCell>
                        <TableCell>{employeeData?.rodzajRozliczenia}</TableCell>
                        <TableCell>{employeeData?.staż}</TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
                <Paper sx={{ p: 3, minHeight: "18rem" }}>
                <Typography variant="h6" gutterBottom>
                    Aktywne prośby o urlop
                </Typography>
                <TableContainer>
                    <Table size="small" aria-label="active leaves table">
                    <TableHead>
                        <TableRow>
                        <TableCell>Okres</TableCell>
                        <TableCell>Rodzaj</TableCell>
                        <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employeeLeaves?.filter(leave => leave.status === "OCZEKUJĄCE")
                        .map((leave) => (
                            <TableRow key={leave.id}>
                            <TableCell>{new Date(leave.dataStart).toLocaleDateString()}-{new Date(leave.dataKoniec).toLocaleDateString()}</TableCell>
                            <TableCell>{leave.rodzaj}</TableCell>
                            <TableCell>
                                <Chip
                                label={leave.status}
                                color={leave.status == "OCZEKUJĄCE" ? "warning" : leave.status == "ZATWIERDZONE" ? "success" : "error" }
                                size="small"
                                />
                            </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    <TablePagination
                    component="div"
                    count={activeLeaves.length}
                    page={pageActive}
                    onPageChange={handleChangePageActive}
                    rowsPerPage={rowsPerPageActive}
                    onRowsPerPageChange={handleChangeRowsPerPageActive}
                    rowsPerPageOptions={[5, 10]}
                    />
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Stare prośby o urlop
                </Typography>
                <TableContainer>
                    <Table size="small" aria-label="active leaves table">
                    <TableHead>
                        <TableRow>
                        <TableCell>Okres</TableCell>
                        <TableCell>Rodzaj</TableCell>
                        <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employeeLeaves?.filter(leave => leave.status != "OCZEKUJĄCE")
                        .map((leave) => (
                            <TableRow key={leave.id}>
                            <TableCell>{new Date(leave.dataStart).toLocaleDateString()}-{new Date(leave.dataKoniec).toLocaleDateString()}</TableCell>
                            <TableCell>{leave.rodzaj}</TableCell>
                            <TableCell>
                                <Chip
                                label={leave.status}
                                color={leave.status == "OCZEKUJĄCE" ? "warning" : leave.status == "ZATWIERDZONE" ? "success" : "error" }
                                size="small"
                                />
                            </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    <TablePagination
                    component="div"
                    count={activeLeaves.length}
                    page={pageActive}
                    onPageChange={handleChangePageActive}
                    rowsPerPage={rowsPerPageActive}
                    onRowsPerPageChange={handleChangeRowsPerPageActive}
                    rowsPerPageOptions={[5, 10]}
                    />
                </TableContainer>
                </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalPanel;
