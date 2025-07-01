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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  List,
} from "@mui/material";
import type { EmployeeBasicResponse } from "../../types/profilesDTO";
import { getById } from "../../services/profilesService";
import { getEmployeeLeaves, getLeavesByParams, requestLeave } from "../../services/leavesService";
import type { LeaveResponse } from "../../types/leavesDTO";
import { finalizeAttendance, getAttendanceByEmployeeAndDateRange, initializeAttendance } from "../../services/attendanceService";
import { type AttendanceTimeResponse, type AttendanceTimeRequest } from "../../types/attendanceDTO";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import type { HoursSummary } from "../../types/dashboardDTO";
import {getPersonalSummary } from "../../services/dashboardService";
import { downloadDetailedDailyReportPdf, downloadMonthlyPersonalSummaryPdf } from "../../raporting/raportingService";

const PersonalPanel = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<EmployeeBasicResponse>();

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
  const [activeLeaves, setActiveLeaves] = useState<LeaveResponse[]>([]);
  const [oldLeaves, setOldLeaves] = useState<LeaveResponse[]>([]);

  const [editValues, setEditValues] = useState<{
    date: Date,
    startTime: string;
    endTime: string;
    przerwa: boolean;
  } | null>(null);

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
    const today = now.toLocaleDateString("en-CA");
    const time = now.toTimeString().split(" ")[0]; // HH:mm:ss
  
    const payload: AttendanceTimeRequest = {
      employeeId: Number(localStorage.getItem("employeeId")),
      date: today,
      startTime: time,
    };
  
    try {
      const response = await initializeAttendance(payload);
      setAttendanceId(response.id);
    } catch (err) {
      console.error(err);
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
  const [rowsPerPageActive, setRowsPerPageActive] = useState(3);

  const handleChangePageActive = (_event: unknown, newPage: number) => {
    setPageActive(newPage);
  };

  const handleChangeRowsPerPageActive = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageActive(parseInt(event.target.value, 10));
    setPageActive(0);
  };

  const [employeeLeaves, setEmployeeLeaves] = useState<LeaveResponse[]>();
  const [selectedLeavesDate, setSelectedLeavesDate] = useState<Dayjs>(dayjs());

  async function loadLeaves() {
    const response = await getLeavesByParams(new Date(selectedLeavesDate.startOf("month").toDate()), new Date(selectedLeavesDate.endOf("month").toDate()), undefined, undefined, Number(localStorage.getItem("employeeId")));
    
    // const response = await getEmployeeLeaves(Number(localStorage.getItem("employeeId")));
    setEmployeeLeaves(response);
    setOldLeaves(response.filter(leave => leave.status !== "OCZEKUJĄCE"));
    setActiveLeaves(response.filter(leave => leave.status === "OCZEKUJĄCE"));
  }


  useEffect(() => {
    loadLeaves();
  }, [])

  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);

  const [newLeaveData, setNewLeaveData] = useState({
    type: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    reason: "",
  });

  const leaveLength =
    newLeaveData.startDate && newLeaveData.endDate
      ? dayjs(newLeaveData.endDate).diff(dayjs(newLeaveData.startDate), 'day') + 1
      : 0;

  const handleOpenLeaveDialog = () => {
    setOpenLeaveDialog(true);
  };

  const handleCloseLeaveDialog = () => {
    setOpenLeaveDialog(false);
    setNewLeaveData({ type: "", startDate: null, endDate: null, reason: "" });
  };

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmitLeaveRequest = async () => {
    const employeeDays = employeeData?.dostępneDniUrlopu || 0;
  
    const start = newLeaveData.startDate;
    const end = newLeaveData.endDate;
  
    const leaveLength = start && end ? dayjs(end).diff(dayjs(start), 'day') + 1 : 0;
  
    if (leaveLength > employeeDays) {
      setErrorMessage("Wybrany okres urlopu przekracza dostępne dni.");
      setErrorOpen(true);
      return;
    }
  
    try {
      const payload = {
        employeeId: Number(localStorage.getItem("employeeId")),
        rodzaj: newLeaveData.type,
        dataStart: start?.toISOString().slice(0, 10),
        dataKoniec: end?.toISOString().slice(0, 10),
      };
  
      await requestLeave(payload);
      handleCloseLeaveDialog();
      await loadLeaves();
    } catch (error) {
      setErrorMessage("Wystąpił błąd podczas wysyłania prośby.");
      setErrorOpen(true);
      console.error("Błąd przy wysyłaniu prośby o urlop", error);
    }
  };

  const [overtimeOpen, setOvertimeOpen] = useState(false);
  const [paidLeavesOpen, setPaidLeaveOpen] = useState(false);
  const [freeLeavesOpen, setFreeLeavesOpen] = useState(false);
  const [specialLeavesOpen, setSpecialLeavesOpen] = useState(false);

  const handleOvertimeOpen =() => {
    setOvertimeOpen(!overtimeOpen)
  }

  const handlePaidLeavesOpen = () => {
    setPaidLeaveOpen(!paidLeavesOpen)
  }

  const handleFreeLeavesOpen = () => {
    setFreeLeavesOpen(!freeLeavesOpen)
  }

  const handleSpecialLeavesOpen = () =>{
    setSpecialLeavesOpen(!specialLeavesOpen)
  }

  const [hoursSummary, setHoursSummary] = useState<HoursSummary>({
      regular: 0,
      overtimeDay: 0,
      overtimeNight: 0,
      overtimeHoliday: 0,
      leaveVacation: 0,
      leaveUnpaid: 0,
      leaveCircumstance: 0,
      leavePregnant: 0,
      leaveParental: 0,
      leaveTraining: 0,
      leaveHigherPower: 0,
      leaveJobSearch: 0,
      leaveBlood: 0,
      leaveCarer: 0,
      sickLeave: 0,
    });

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const year = selectedDate.year();
        const month = selectedDate.month() + 1; // JS: 0-based
        const days = [
          `${year}-${String(month).padStart(2, "0")}-01`,
          `${year}-${String(month).padStart(2, "0")}-15`,
        ];
  
        const summary = await getPersonalSummary(
          Number(localStorage.getItem("employeeId")),
          year,
          month,
          days
        );
  
        setHoursSummary(summary);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSummary();
  }, [selectedDate]);
  
  const [employeeAttendance, setEmployeeAttendance] = useState<AttendanceTimeResponse[]>();
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedAttendanceDate) return;
  
      const startDate = selectedAttendanceDate.startOf("month").format("YYYY-MM-DD");
      const endDate = selectedAttendanceDate.endOf("month").format("YYYY-MM-DD");
  
      try {
        const data = await getAttendanceByEmployeeAndDateRange(Number(localStorage.getItem("employeeId")), startDate, endDate);
        setEmployeeAttendance(data);
      } catch (error) {
        console.error("Błąd podczas pobierania obecności:", error);
      }
    };
  
    fetchAttendance();
  }, [selectedAttendanceDate]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset to first page
  };

  const [newAttendanceData, setNewAttendanceData] = useState({
    startTime: "",
    endTime: "",
    date: null,
  });

  const isDateValid = newAttendanceData.date
? dayjs().diff(dayjs(newAttendanceData.date), 'day') <= 3
: false;

  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);

  const handleOpenAttendanceDialog = () => {
    setOpenAttendanceDialog(true);
  };

  const handleCloseAttendanceDialog = () => {
    setOpenAttendanceDialog(false);
    setNewAttendanceData({
      startTime: "",
      endTime: "",
      date: null,
    });
  };


  const handleSubmitAttendance = async () => {
    const payload = {
      startTime: newAttendanceData.startTime,
      endTime: newAttendanceData.endTime || null,
      date: dayjs(newAttendanceData.date).format("YYYY-MM-DD"),
      employeeId: employeeData?.id,
    };

    try {
      await initializeAttendance(payload);
      setOpenAttendanceDialog(false);
      // odśwież dane lub pokaż Snackbar sukcesu
    } catch (error) {
      setErrorMessage("Wystąpił błąd przy dodawaniu obecności.");
      setErrorOpen(true);
    }
  };

  // const [selectedRaportDate, setSelectedRaportDate] = useState<Dayjs>(dayjs())

  const handleGenerateReport = async () => {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const days = [
      `${year}-${String(month).padStart(2, "0")}-01`,
      `${year}-${String(month).padStart(2, "0")}-15`,
    ];
  
    try {
      const summary = await getPersonalSummary(
        Number(localStorage.getItem("employeeId")),
        year,
        month,
        days
      );
  
      downloadMonthlyPersonalSummaryPdf(employeeData, summary, year, month);
    } catch (error) {
      console.error("Nie udało się pobrać podsumowania do raportu", error);
    }
  };
  
  const handleCreateChronologicalReport = () => {

    downloadDetailedDailyReportPdf(employeeData, employeeAttendance, employeeLeaves?.filter(leave => leave.status != "OCZEKUJĄCE"), selectedAttendanceDate.year(), selectedAttendanceDate.month() + 1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{width: '100rem', mx: '8rem', mt: '3rem' }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid size={7}>
          <Grid container columnSpacing={2} rowSpacing={2} sx={{mb: 2}}>
            <Grid size={6}>
              <Paper sx={{ p: 3, minHeight: "10rem" }}>
                <Box mt={2}>
                  <Stack
                    direction="column"
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                  >

                  <Typography variant="h4" sx={{ mt: 1 }}>
                    Czas pracy: {formatTime(timeInSeconds)}
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                    {!isWorking && (
                      <Chip
                        label="Rozpocznij pracę"
                        color="primary"
                        onClick={handleStart}
                        clickable
                        sx={{ fontSize: '1rem', px: 2, py: 1 }}
                      />
                    )}

                    

                    {isWorking && (
                      <>
                        <Chip
                          label={isOnBreak ? "Wróć do pracy" : "Przerwa"}
                          color={isOnBreak ? "success" : "warning"}
                          onClick={handleBreakToggle}
                          clickable={!breakTaken || isOnBreak}
                          sx={{ fontSize: '1rem', px: 2, py: 1 }}
                          disabled={breakTaken && !isOnBreak}
                        />
                        <Chip
                          label="Zakończ"
                          color="error"
                          onClick={handleStop}
                          clickable
                          sx={{ fontSize: '1rem', px: 2, py: 1 }}
                        />
                      </>
                    )}
                  </Stack>

                  {isOnBreak && (
                    <Typography variant="h6" color="warning.main" mt={1}>
                      Przerwa aktywna
                    </Typography>
                  )}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{p: 3}}>
                <Typography variant="h6">
                    {employeeData?.name + " " + employeeData?.lastname}
                </Typography>
                <Divider sx={{mb: 2}}/>
                <Table size="small" sx={{ '& td, & th': { fontSize: '0.85rem', padding: '6px 10px' } }}>
                  <TableHead>
                      <TableRow>
                      <TableCell><b>Data zatrudnienia</b></TableCell>
                      {/* <TableCell><b>Data zwolnienia</b></TableCell> */}
                    <TableCell><b>Stawka</b></TableCell>
                    <TableCell><b>Wymiar pracy</b></TableCell>
                      <TableCell><b>Rodzaj rozliczenia</b></TableCell>
                      <TableCell><b>Lata stażu</b></TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {/* Przykładowy wpis – zastąp danymi z mapy */}
                      <TableRow>
                        <TableCell>{new Date(employeeData?.dataZatrudnienia).toLocaleDateString()}</TableCell>
                        {/* <TableCell>{employeeData?.dataZwolnienia != null ? new Date(employeeData?.dataZwolnienia).toLocaleDateString() : "-" }</TableCell> */}
                        <TableCell>{employeeData?.stawka + " zł/godz"}</TableCell>
                        <TableCell>{employeeData?.wymiarPracy}</TableCell>
                        <TableCell>{employeeData?.rodzajRozliczenia}</TableCell>
                        <TableCell>{employeeData?.staż}</TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
          <Stack spacing={2}>
            <Paper sx={{ p: 3, minHeight: "16rem" }}>
                <Typography variant="h6">
                  Oczekujące urlopy
                </Typography>
              <Stack 
                direction={"row"} 
                spacing={2}  
                alignItems="center"
                justifyContent="space-between">
                  
                <Stack direction={"row"} spacing={2}>
                  <Typography>
                    {"Dostępne dni urlopu: " +  employeeData?.dostępneDniUrlopu || ""}
                  </Typography>
                  <Typography>
                    {"Użyte dni urlopu: " +  employeeData?.wykorzystaneDniUrlopu || ""}
                  </Typography>
                </Stack>
                <Chip 
                  color="primary"
                  label={"Złóż prośbę"}
                  clickable
                  onClick={handleOpenLeaveDialog}
                />
              </Stack>
                  <Dialog
                  open={openLeaveDialog}
                  onClose={handleCloseLeaveDialog}
                  fullWidth
                  maxWidth="sm"
                  >
                    <DialogTitle>Złóż prośbę o urlop</DialogTitle>
                    <DialogContent>
                      <Stack direction={"row"} spacing={2}>
                        <Typography>
                          {"Dostępne dni urlopu: " +  employeeData?.dostępneDniUrlopu || ""}
                        </Typography>
                        <Typography>
                          {"Użyte dni urlopu: " +  employeeData?.wykorzystaneDniUrlopu || ""}
                        </Typography>
                        <Typography>
                          {leaveLength > 0 ? `Wybrany okres: ${leaveLength} dni` : ""}
                        </Typography>
                      </Stack>
                      <Stack direction={"row"} spacing={2} sx={{mt: 2}}>
                        <DatePicker
                          label="Data rozpoczęcia"
                          value={newLeaveData.startDate ? dayjs(newLeaveData.startDate) : null}
                          onChange={(date) =>
                            setNewLeaveData((prev) => ({
                              ...prev,
                              startDate: date ? date.toDate() : null,
                            }))
                          }
                          slotProps={{
                            textField: { variant: "standard" }
                          }}
                        />
                        <DatePicker
                          label="Data zakończenia"
                          value={newLeaveData.endDate ? dayjs(newLeaveData.endDate) : null}
                          onChange={(date) =>
                            setNewLeaveData((prev) => ({
                              ...prev,
                              endDate: date ? date.toDate() : null,
                            }))
                          }
                          slotProps={{
                            textField: { variant: "standard" }
                          }}
                        />
                      </Stack>
                      <TextField
                          select
                          label="Typ urlopu"
                          fullWidth
                          margin="normal"
                          value={newLeaveData.type}
                          onChange={(e) =>
                            setNewLeaveData((prev) => ({ ...prev, type: e.target.value }))
                          }
                        >
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
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseLeaveDialog}>Anuluj</Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmitLeaveRequest}
                        disabled={
                          !newLeaveData.type ||
                          !newLeaveData.startDate ||
                          !newLeaveData.endDate ||
                          (newLeaveData.startDate > newLeaveData.endDate)
                        }
                      >
                        Wyślij
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Snackbar
                    open={errorOpen}
                    autoHideDuration={4000}
                    onClose={() => setErrorOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  >
                    <Alert severity="error" onClose={() => setErrorOpen(false)} sx={{ width: '100%' }}>
                      {errorMessage}
                    </Alert>
                  </Snackbar>
              <TableContainer sx={{mt:2}}>
                <Table size="small" aria-label="active leaves table" >
                <TableHead>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Okres</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rodzaj</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {employeeLeaves?.filter(leave => leave.status === "OCZEKUJĄCE")
                    .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
                    .map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          {new Date(leave.dataStart).toLocaleDateString()} - {new Date(leave.dataKoniec).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{leave.rodzaj.replace(/_/g, " ")}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={
                              leave.status === "OCZEKUJĄCE"
                                ? "warning"
                                : leave.status === "ZATWIERDZONE"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                  ))}

                  {/* Puste wiersze */}
                  {Array.from({
                    length:
                      Math.max(
                        0,
                        rowsPerPageActive -
                          employeeLeaves?.filter((leave) => leave.status === "OCZEKUJĄCE")
                            .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
                            .length
                      ),
                  }).map((_, i) => (
                    <TableRow key={`empty-${i}`} sx={{ height: 33 }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
                  <TablePagination
                  component="div"
                  count={activeLeaves.length ?? 3}
                  page={pageActive}
                  onPageChange={handleChangePageActive}
                  rowsPerPage={rowsPerPageActive}
                  onRowsPerPageChange={handleChangeRowsPerPageActive}
                  rowsPerPageOptions={[]}
                  />
              </TableContainer >
              <Divider sx={{mt: 3}}/>
              <Typography variant="h6" mt={4}>
                  Wybrane urlopy
                </Typography>
              <TableContainer sx={{mt:2}}>
                    <Table size="small" aria-label="old leaves table">
                    <TableHead>
                        <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Okres</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Rodzaj</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeLeaves?.filter(leave => leave.status != "OCZEKUJĄCE")
                        .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
                        .map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>
                              {new Date(leave.dataStart).toLocaleDateString()} - {new Date(leave.dataKoniec).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{leave.rodzaj.replace(/_/g, " ")}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status}
                                color={
                                  leave.status === "OCZEKUJĄCE"
                                    ? "warning"
                                    : leave.status === "ZATWIERDZONE"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                      ))}

                      {/* Puste wiersze */}
                      {Array.from({
                        length:
                          Math.max(
                            0,
                            rowsPerPageActive -
                              employeeLeaves?.filter((leave) => leave.status != "OCZEKUJĄCE")
                                .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
                                .length
                          ),
                      }).map((_, i) => (
                        <TableRow key={`empty-${i}`} sx={{ height: 33 }}>
                          <TableCell colSpan={3} />
                        </TableRow>
                      ))}
                    </TableBody>

                    </Table>
                    <TablePagination
                    component="div"
                    count={oldLeaves.length ?? 3}
                    page={pageActive}
                    onPageChange={handleChangePageActive}
                    rowsPerPage={rowsPerPageActive}
                    onRowsPerPageChange={handleChangeRowsPerPageActive}
                    rowsPerPageOptions={[]}
                    />
              </TableContainer>
            </Paper>
          </Stack>
          {/* <Grid size={12} sx={{mt: 2}}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={4}
                justifyContent="center"
                alignItems="center"
              >
                <DatePicker
                views={['year', 'month']}
                label="Wybierz miesiąc"
                minDate={dayjs('2022-01-01')}
                maxDate={dayjs()}
                value={selectedRaportDate}
                onChange={(newValue) => {
                  if (newValue) setSelectedRaportDate(newValue);
                }}
                slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }}
              />
                
                <Chip
                  label="Stwórz raport chronologiczny"
                  // onClick={handleCreateChronologicalReport} // <- podmień na swoją funkcję
                  color="secondary"
                  clickable
                  sx={{
                    fontSize: "1.2rem",
                    px: 3,
                    py: 2,
                    height: "auto",
                  }}
                />
              </Stack>
            </Paper>
          </Grid> */}
        </Grid>
          <Grid size={5}>
            <Stack rowGap={1}>
            <Paper sx={{ p: 3, overflow: "auto", maxHeight: "24rem" }}>
              <Stack direction={"row"} spacing={3} sx={{mb: 2}}>
                <Typography variant="h6">Szczegóły godzin</Typography>
                <DatePicker
                  views={['year', 'month']}
                  label="Wybierz miesiąc"
                  minDate={dayjs('2022-01-01')}
                  maxDate={dayjs()}
                  value={selectedDate}
                  onChange={(newValue) => {
                    if (newValue) setSelectedDate(newValue);
                  }}
                  slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }}
                />
                <Chip
                  label="Stwórz raport"
                  onClick={handleGenerateReport}
                  color="primary"
                  clickable
                />
              </Stack>
                  <ListItem>
                    <ListItemText primary="Wszystkie"/>
                    <Typography>{Object.values(hoursSummary).reduce((sum, val) => sum + val, 0)}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Normalne"/>
                    <Typography>{hoursSummary.regular}</Typography>
                  </ListItem>
                  <ListItemButton onClick={handleOvertimeOpen}>
                    <ListItemText primary="Nadgodziny" />
                    {overtimeOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={overtimeOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Zwykłe" />
                        <Typography>{hoursSummary.overtimeDay}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Nocne" />
                        <Typography>{hoursSummary.overtimeNight}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Święta i niedziele" />
                        <Typography>{hoursSummary.overtimeHoliday}</Typography>
                      </ListItem>
                    </List>
                  </Collapse>
                  <ListItemButton onClick={handlePaidLeavesOpen}>
                    <ListItemText primary="Urlopy płatne" />
                    {paidLeavesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={paidLeavesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Wypoczynkowe" />
                        <Typography>{hoursSummary.leaveVacation}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Chorobowe" />
                        <Typography>{hoursSummary.sickLeave}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Okolicznościowe" />
                        <Typography>{hoursSummary.leaveCircumstance}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Szkoleniowe" />
                        <Typography>{hoursSummary.leaveTraining}</Typography>
                      </ListItem>
                    </List>
                  </Collapse>
                  <ListItemButton onClick={handleFreeLeavesOpen}>
                    <ListItemText primary="Urlopy bezpłatne" />
                    {freeLeavesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={freeLeavesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Bezpłatny" />
                        <Typography>{hoursSummary.leaveUnpaid}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Wychowawczy" />
                        <Typography>{hoursSummary.leaveParental}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Macierzyński" />
                        <Typography>{hoursSummary.leavePregnant}</Typography>
                      </ListItem>
                    </List>
                  </Collapse>
                  <ListItemButton onClick={handleSpecialLeavesOpen}>
                    <ListItemText primary="Urlopy specjalne" />
                    {specialLeavesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={specialLeavesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Na poszukiwanie pracy" />
                        <Typography>{hoursSummary.leaveJobSearch}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Oddanie krwi" />
                        <Typography>{hoursSummary.leaveBlood}</Typography>
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText primary="Siła wyższa" />
                        <Typography>{hoursSummary.leaveHigherPower}</Typography>
                      </ListItem>
                    </List>
                  </Collapse>
                  <ListItem>
                    <ListItemText primary="Opiekuńczy"/>
                    <Typography>{hoursSummary.leaveCarer}</Typography>
                  </ListItem>
            </Paper>
            <Paper sx={{p: 3, pb: 0, minHeight: "23rem"}}>
              <Stack direction={"row"} spacing={3}>
                {/* views={['year', 'month']}
                label="Wybierz miesiąc"
                minDate={dayjs('2022-01-01')}
                maxDate={dayjs()}
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) setSelectedDate(newValue);
                }}
                slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }} */}
                <Typography variant="h6">Godziny</Typography>
                <DatePicker
                  views={['year', 'month']}
                  label="Wybierz miesiąc"
                  minDate={dayjs('2022-01-01')}
                  maxDate={dayjs()}
                  value={selectedAttendanceDate}
                  onChange={(newValue) => {
                    if (newValue) setSelectedAttendanceDate(newValue);
                  }}
                  slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }}
                />
                <Chip
                  label={"Uzupełnij godziny"}
                  color="primary"
                  clickable
                  onClick={handleOpenAttendanceDialog}
                />
                <Chip
                  label="Stwórz raport"
                  onClick={handleCreateChronologicalReport} // 
                  color="secondary"
                  clickable
                />
                <Dialog
                  open={openAttendanceDialog}
                  onClose={handleCloseAttendanceDialog}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Dodaj godziny pracy</DialogTitle>
                  <DialogContent>
                    <Stack direction="column" spacing={2}>
                      <DatePicker
                        label="Data obecności"
                        value={newAttendanceData.date ? dayjs(newAttendanceData.date) : null}
                        onChange={(date) =>
                          setNewAttendanceData((prev) => ({
                            ...prev,
                            date: date ? date.toDate() : null,
                          }))
                        }
                        slotProps={{
                          textField: { variant: "standard", required: true },
                        }}
                      />
                      <TextField
                        label="Godzina rozpoczęcia (np. 08:00)"
                        variant="filled"
                        fullWidth
                        required
                        value={newAttendanceData.startTime}
                        onChange={(e) =>
                          setNewAttendanceData((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                      />
                      <TextField
                        label="Godzina zakończenia (opcjonalnie)"
                        variant="filled"
                        fullWidth
                        value={newAttendanceData.endTime}
                        onChange={(e) =>
                          setNewAttendanceData((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                      />
                    </Stack>
                    {!isDateValid && newAttendanceData.date && (
                      <Typography color="error" sx={{ mt: 2 }}>
                        Nie można dodać obecności starszej niż 3 dni.
                      </Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseAttendanceDialog}>Anuluj</Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitAttendance}
                      disabled={
                        !newAttendanceData.startTime ||
                        !newAttendanceData.date ||
                        !isDateValid
                      }
                    >
                      Zapisz
                    </Button>
                  </DialogActions>
                </Dialog>
              </Stack>
                <TableContainer sx={{mt:2, width: "100%"}}>
                  <Table>
                    <TableHead>
                      <TableRow >
                        {/* <TableCell sx={{ fontWeight: "bold" }}>Pracownik</TableCell> */}
                        <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Rozpoczęcie</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Zakończenie</TableCell>
                        {/* <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell> */}
                        {/* <TableCell sx={{ fontWeight: "bold" }}>Przerwa</TableCell> */}
                        {/* <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {employeeAttendance
                      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((att) => (
                        <TableRow key={att.id} hover>
                          <TableCell>{att.date}</TableCell>
                          <TableCell>{att.startTime}</TableCell>
                          <TableCell>{att.endTime || "-"}</TableCell>
                          {/* <TableCell></TableCell> */}
                        </TableRow>
                    ))}

                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={employeeAttendance?.length || 0}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[]}
                />
              </Paper>
            </Stack>
          </Grid>
          
      </Grid>
    </Box>
  )
};

export default PersonalPanel;
