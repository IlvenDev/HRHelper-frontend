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
} from "@mui/material";
import type { EmployeeBasicResponse } from "../../types/profilesDTO";
import { getById } from "../../services/profilesService";
import { getEmployeeLeaves, requestLeave } from "../../services/leavesService";
import type { LeaveResponse } from "../../types/leavesDTO";
import { finalizeAttendance, initializeAttendance } from "../../services/attendanceService";
import type { AttendanceTimeRequest } from "../../types/attendanceDTO";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

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
  const response = await getEmployeeLeaves(Number(localStorage.getItem("employeeId")));
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

  const handleOpenLeaveDialog = () => {
    setOpenLeaveDialog(true);
  };

  const handleCloseLeaveDialog = () => {
    setOpenLeaveDialog(false);
    setNewLeaveData({ type: "", startDate: null, endDate: null, reason: "" });
  };

  const handleSubmitLeaveRequest = async () => {
    // Tu dodaj wywołanie API do wysłania prośby urlopowej (np. leaveService.submitLeaveRequest)
    try {
      // Przykladowy payload - dopasuj do API
      const payload = {
        employeeId: Number(localStorage.getItem("employeeId")),
        rodzaj: newLeaveData.type,
        dataStart: newLeaveData.startDate?.toISOString().slice(0, 10),
        dataKoniec: newLeaveData.endDate?.toISOString().slice(0, 10),
        // powod: newLeaveData.reason,
      };

      await requestLeave(payload);

      console.log("Submit leave request payload:", payload);

      handleCloseLeaveDialog();

      // Po wysłaniu możesz odświeżyć listę urlopów
      await loadLeaves();

    } catch (error) {
      console.error("Błąd przy wysyłaniu prośby o urlop", error);
    }
  };

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
      <Grid container >
        {/* Obecni pracownicy */}
        <Grid size={7}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3, minHeight: "16rem" }}>
                <Box mt={2}>
                    <Stack direction={"row"} spacing={6}>
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
                      <Typography variant="h4">Czas pracy: {formatTime(timeInSeconds)}</Typography>
                    </Stack>
                      {/* <Typography variant="h4">Czas pracy: {formatTime(timeInSeconds)}</Typography> */}
                      {isOnBreak && (
                      <Typography variant="h6" color="warning.main" mt={1}>
                          Przerwa aktywna
                      </Typography>
                      )}
                </Box>
                
                <TableContainer component={Paper} sx={{mt: 2, minHeight: "100px"}}>
                  <Typography variant="h6">Wpisz brakujące obecności</Typography>
                  <Table>
                    <TableHead>
                      <TableRow >
                        <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Rozpoczęcie</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Zakończenie</TableCell>
                        {/* <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell> */}
                        <TableCell sx={{ fontWeight: "bold" }}>Przerwa</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    <TableRow>
                        <TableCell>
                          <DatePicker
                            format="YYYY-MM-DD"
                            value={dayjs(editValues?.date)}
                            onChange={(newValue) => {
                              if (newValue) {
                                setEditValues((prev) => ({ ...prev!, date: newValue.toDate() }));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            variant="standard"
                            value={editValues?.startTime}
                            onChange={(e) => setEditValues((prev) => ({ ...prev!, startTime: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            variant="standard"
                            value={editValues?.endTime}
                            onChange={(e) => setEditValues((prev) => ({ ...prev!, endTime: e.target.value }))}
                          />
                          </TableCell>
                        <TableCell>
                          <TextField 
                            select
                            variant="standard"
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev!,
                                przerwa: Boolean(e.target.value),
                              }))
                            }
                          >
                            <MenuItem value="true">Tak</MenuItem>
                            <MenuItem value="false">Nie</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <Chip 
                          color="primary"
                          label={"Wypełnij"}
                          clickable
                          onClick={async () => {
                            try {
                              const updatedData: AttendanceTimeRequest = {
                                date: editValues?.date,
                                startTime: editValues?.startTime,
                                endTime: editValues?.endTime,
                                breakTaken: editValues?.przerwa,
                              };
  
                              await initializeAttendance(updatedData);
                            } catch (err) {
                              console.error(err)
                          }}}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <Button
                    variant="text"
                    color="secondary"
                    sx={{ mt: 4 }}
                    onClick={() => alert("Tu będzie wpisywanie starych godzin")}
                >
                    Wpisz stare godziny
                </Button> */}
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
                  <Stack direction={"row"} spacing={2} mb={2}>
                  <Typography variant="h6" gutterBottom>
                      Aktywne prośby o urlop
                  </Typography>
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

                      {/* <TextField
                        label="Powód (opcjonalnie)"
                        multiline
                        rows={3}
                        fullWidth
                        margin="normal"
                        value={newLeaveData.reason}
                        onChange={(e) =>
                          setNewLeaveData((prev) => ({ ...prev, reason: e.target.value }))
                        }
                      /> */}
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
                <Stack direction={"row"} spacing={2}>
                    <Typography>
                      {"Dostępne dni urlopu: " +  employeeData?.dostępneDniUrlopu || ""}
                    </Typography>
                    <Typography>
                      {"Użyte dni urlopu: " +  employeeData?.wykorzystaneDniUrlopu || ""}
                    </Typography>
                </Stack>
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
                            <TableCell>{leave.rodzaj.replace(/_/g, " ")}</TableCell>
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
                    count={activeLeaves.length ?? 5}
                    page={pageActive}
                    onPageChange={handleChangePageActive}
                    rowsPerPage={rowsPerPageActive}
                    onRowsPerPageChange={handleChangeRowsPerPageActive}
                    rowsPerPageOptions={[5, 10]}
                    />
                </TableContainer>

                <Divider sx={{ my: 3 }} />
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="h6" gutterBottom>
                      Stare prośby o urlop
                  </Typography>
                </Stack>
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
                            <TableCell>{leave.rodzaj.replace(/_/g, " ")}</TableCell>
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
                    count={oldLeaves.length ?? 5}
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
