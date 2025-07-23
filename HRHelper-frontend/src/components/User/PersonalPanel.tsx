import React, { use, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Grid,
  Stack,
  Chip,
  Breadcrumbs,
  Avatar,
  LinearProgress,
  styled,
  Badge,
  IconButton,
  Tooltip,
  Card,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import type { EmployeeBasicResponse } from "../../types/profilesDTO";
import { getById } from "../../services/profilesService";
import { getLeavesByParams, requestLeave } from "../../services/leavesService";
import type { LeaveResponse } from "../../types/leavesDTO";
import { finalizeAttendance, getAttendanceByEmployeeAndDateRange, initializeAttendance } from "../../services/attendanceService";
import { type AttendanceTimeResponse, type AttendanceTimeRequest } from "../../types/attendanceDTO";
import { DateCalendar, DateField, DatePicker, PickersDay, type PickersDayProps } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { AnnouncementOutlined, CalendarMonth, DateRange, MoreHoriz, Schedule } from "@mui/icons-material";
import type { HoursSummary } from "../../types/dashboardDTO";
import {getPersonalSummary } from "../../services/dashboardService";
import { downloadDetailedDailyReportPdf, downloadMonthlyPersonalSummaryPdf } from "../../raporting/raportingService";
import { Link } from "react-router-dom";
import { PieChart, useDrawingArea } from "@mui/x-charts";

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
      if (!goingOnBreak) setBreakTaken(true); // oznacz że przerwa została wzięta
      return goingOnBreak;
    });
  };

  const [employeeLeaves, setEmployeeLeaves] = useState<LeaveResponse[]>();

  const [employeeId, setEmployeeId] = useState<number>(Number(localStorage.getItem("employeeId")))

  // This load leaves incorrectly. Always the same ones

  async function loadLeaves() {
    setLoading(true);
    try {
      const response = await getLeavesByParams(
        selectedDate.startOf("month").toDate(),
        selectedDate.endOf("month").toDate(),
        undefined,
        undefined,
        employeeId
      );
      setEmployeeLeaves(response);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, [])

  const [newLeaveData, setNewLeaveData] = useState({
    type: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    reason: "",
  });

  const [leaveMenuAnchor, setLeaveMenuAnchor] = useState<null | HTMLElement>(null);
  const leaveMenuOpen = Boolean(leaveMenuAnchor)
  const handleOpenLeaveMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLeaveMenuAnchor(event.currentTarget)
  }
  const handleCloseLeaveMenu = () => {
    setLeaveMenuAnchor(null)
  }

  const [isLeaveRequestDialogOpen, setIsLeaveRequestDialogOpen] = useState(false)

  // Toggle might work here
  const handleLeaveRequestDialogOpen = () => {
    setIsLeaveRequestDialogOpen(true)
  }

  const handleLeaveRequestDialogClose = () => {
    setIsLeaveRequestDialogOpen(false)
  }

  const handleLeaveRequestDialogSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const dataStart = formJson.dataStart;
    console.log(dataStart);
    handleLeaveRequestDialogClose();
  };

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

  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});

  useEffect(() => {
    const fetchSummary = async () => {
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

  const [totalHours, setTotalHours] = useState<number>(Object.values(hoursSummary).reduce((sum, val) => sum + val, 0));
  
  useEffect(() => {
      const total = Object.values(hoursSummary).reduce((sum, val) => sum + val, 0);
      setTotalHours(total);
    }, [hoursSummary]);

  const [employeeAttendance, setEmployeeAttendance] = useState<AttendanceTimeResponse[]>();
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedDate) return;
  
      const startDate = selectedDate.startOf("month").format("YYYY-MM-DD");
      const endDate = selectedDate.endOf("month").format("YYYY-MM-DD");
  
      try {
        const data = await getAttendanceByEmployeeAndDateRange(Number(localStorage.getItem("employeeId")), startDate, endDate);
        setEmployeeAttendance(data);
      } catch (error) {
        console.error("Błąd podczas pobierania obecności:", error);
      }
    };
  
    fetchAttendance();
  }, [selectedDate]);

  const [reportMenuAnchor, setReportMenuAnchor] = useState<null | HTMLElement>(null);
  const reportMenuOpen = Boolean(reportMenuAnchor)
  const handleOpenReportMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setReportMenuAnchor(event.currentTarget)
  }
  const handleCloseReportMenu = () => {
    setReportMenuAnchor(null)
  }

  const handleCreateChronologicalReport = () => {

    downloadDetailedDailyReportPdf(employeeData, employeeAttendance, employeeLeaves?.filter(leave => leave.status != "OCZEKUJĄCE"), selectedDate.year(), selectedDate.month() + 1);
  };

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
  
  useEffect(() => {
    if (employeeAttendance && employeeLeaves) {
      const mapped = mapAttendanceStatus(employeeAttendance, employeeLeaves);
      setAttendance(mapped);
    }
  }, [employeeAttendance, employeeLeaves]);

  const calculateUpcomingLeaveDayAmount = (dataStart: Date): number => {
    const today = dayjs().startOf('day');
    const leaveStart = dayjs(dataStart).startOf('day');

    const daysUntilLeave = leaveStart.diff(today, 'day');

    return daysUntilLeave;
  }

  const [selectedSlice, setSelectedSlice] = useState(["Suma", totalHours.toString()]);

  useEffect(() => {
        setSelectedSlice(["Suma", totalHours.toString()]);
      }, [totalHours]);  

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  function LinearProgressWithLabel({ value, max = 100 }) {
    const clampedValue = Math.min((value / max) * 100, 100);
    const actualPercentage = ((value / max) * 100).toFixed(0);
  
    const overLimit = value > max;
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={clampedValue}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: overLimit ? '#ffebee' : undefined,
              '& .MuiLinearProgress-bar': {
                backgroundColor: overLimit ? '#d32f2f' : undefined,
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 45 }}>
          <Typography variant="body2" color={overLimit ? 'error' : 'textSecondary'}>
            {actualPercentage}%
          </Typography>
        </Box>
      </Box>
    );
  }

  const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
  }));
  
  function PieCenterLabel({ selected }: { selected: string[] | undefined}) {
    const { width, height, left, top } = useDrawingArea();
    return (
      <>
        <StyledText x={left + width / 2} y={top + height / 2.3} fontWeight={"bold"} sx={{fontSize: "1rem", overflow: "auto", maxWidth: "1rem"}}>
          {selected[0]}
        </StyledText>
        <StyledText x={left + width / 2} y={top + height / 1.8} sx={{fontSize: "2rem"}}>
          {selected[1]}
        </StyledText>
      </>
    );
  }

  const pieData = [
    { id: 0, value: hoursSummary.regular, label: 'Normalne' },
    { id: 1, value: hoursSummary.overtimeDay, label: 'Nadgodziny dzienne' },
    { id: 2, value: hoursSummary.overtimeNight, label: 'Nadgodziny nocne' },
    { id: 3, value: hoursSummary.overtimeHoliday, label: 'Nadgodziny świąteczne' },
    { id: 4, value: hoursSummary.leaveVacation, label: 'Urlop wypoczynkowy' },
    { id: 5, value: hoursSummary.leaveUnpaid, label: 'Urlop bezpłatny' },
    { id: 6, value: hoursSummary.leaveCircumstance, label: 'Urlop okolicznościowy' },
    { id: 7, value: hoursSummary.leavePregnant, label: 'Urlop macierzyński' },
    { id: 8, value: hoursSummary.leaveParental, label: 'Urlop wychowawczy' },
    { id: 9, value: hoursSummary.leaveTraining, label: 'Urlop szkoleniowy' },
    { id: 10, value: hoursSummary.leaveHigherPower, label: 'Siła wyższa' },
    { id: 11, value: hoursSummary.leaveJobSearch, label: 'Poszukiwanie pracy' },
    { id: 12, value: hoursSummary.leaveBlood, label: 'Oddanie krwi' },
    { id: 13, value: hoursSummary.leaveCarer, label: 'Opiekuńczy' },
    { id: 14, value: hoursSummary.sickLeave, label: 'Urlop chorobowy' },
  ];

  const leaveTypes = [
    'Urlop wypoczynkowy',
    'Urlop bezpłatny',
    'Urlop okolicznościowy',
    'Urlop macierzyński',
    'Urlop wychowawczy',
    'Urlop szkoleniowy',
    'Siła wyższa',
    'Poszukiwanie pracy',
    'Oddanie krwi',
    'Opiekuńczy',
    'Urlop chorobowy'
  ];

  function mapAttendanceStatus(
    attendanceData: AttendanceTimeResponse[],
    leaveData: LeaveResponse[]
  ): Record<string, 'present' | 'absent' | 'leave'> {
    const statusMap: Record<string, 'present' | 'absent' | 'leave'> = {};

    attendanceData.forEach(({ date, startTime, endTime }) => {
      if (startTime && endTime) {
        statusMap[date] = 'present';
      } else {
        statusMap[date] = 'absent';
      }
    });
  
    leaveData.forEach(({ dataStart, dataKoniec }) => {
      const start = dayjs(dataStart);
      const end = dayjs(dataKoniec);
  
      for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
        const dateStr = d.format('YYYY-MM-DD');
        if (statusMap[dateStr] == null) {
          statusMap[dateStr] = 'leave';
        }
      }
    });
  
    return statusMap;
  }
  
  const badgeColorMap: Record<string, string> = {
    present: 'success',
    absent: 'error',
    leave: 'primary'
  };
  
  function DayWithBadge(props: PickersDayProps & { day: Dayjs }) {
    const { day, outsideCurrentMonth, ...rest } = props;
    const dateStr = day.format('YYYY-MM-DD');
    const status = attendance[dateStr];
    
    const showBadge = !outsideCurrentMonth;
    const color = badgeColorMap[status] || 'error';
  
    // Label to show in tooltip
    const tooltipTitle = status === 'present' ? 'Obecny' : status === 'leave' ? 'Urlop' : 'Nieobecny'
  
    return (
      <Tooltip title={tooltipTitle}>
        <Badge
          variant="dot"
          color={color as any}
          overlap="circular"
          invisible={!showBadge}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <PickersDay 
            day={day} 
            outsideCurrentMonth={outsideCurrentMonth} 
            {...rest} 
          />
        </Badge>
      </Tooltip>
    );
  }
  
  return (
    <Box sx={{width: '100rem', mx: '8rem', mt: '3rem' }}>
      <Breadcrumbs>
        <Link color="inherit" to={"/"}>
          Dashboard
        </Link>
        <Typography sx={{ color: 'text.primary' }}>Home</Typography>
      </Breadcrumbs>
      <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
        <Typography align="left" variant="h3">
          {"Witaj z powrotem " + employeeData?.name + "! Dzisiaj jest " + dayjs().date() + " " + dayjs().format('MMMM')}
        </Typography>
        <Stack direction={"row"} spacing={2}>
          <DatePicker
            views={['year', 'month']}
            label="Wybierz miesiąc"
            minDate={dayjs('2025-01-01')}
            maxDate={dayjs()}
            value={selectedDate}
            onChange={(newValue) => {
              setSelectedDate(newValue);
            }}
            slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }}
          />
        </Stack>
      </Box>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid size={7}>
          <Grid container columnSpacing={2} rowSpacing={2} sx={{mb: 2}}>
            <Grid size={6}>
              <Paper sx={{ minHeight: "14rem", borderRadius: 4}} elevation={2}>
                {/* <Box display={"flex"}>
                  <Avatar sx={{width: 30, height: 30, boxShadow: 4, ml: 2, mt: 2, mb: 2}}>
                    <Schedule />
                  </Avatar>  
                  <Typography variant="h5" sx={{mt: 2, ml: 2}}>Status: Oczekuje</Typography>
                </Box> */}
                <Box display="flex">
                  <Stack sx={{pl: 2, pt: 2, mb: 2}}>
                    {/* <Typography>Zaplanowano: 00:00:00</Typography> */}
                    <Typography variant="h4">Pracujesz: {formatTime(timeInSeconds)}</Typography>
                  </Stack>
                </Box>
                <Divider />
                <Box display={"flex"} mt={2} ml={2}>
                  {!isWorking && 
                  <Button
                    variant="contained"
                    sx={{borderRadius: 4}}
                    size="large"
                    onClick={handleStart}
                  >
                    Rozpocznij pracę
                  </Button>}
                </Box>
                {isWorking && 
                  <Stack sx={{pl: 2, pt: 2, mb: 2}} direction={"row"} spacing={2}> 
                    <Button 
                      variant="contained"
                      sx={{borderRadius: 4}}
                      color="error"
                      size="large"
                      onClick={handleStop}
                    >
                      Zakończ pracę
                    </Button>
                    {!breakTaken && 
                    <Button 
                      variant="contained"
                      sx={{borderRadius: 4}}
                      color="warning"
                      size="large"
                      onClick={handleBreakToggle}
                    >
                      {!isOnBreak ? "Weź przerwę" : "Zakończ przerwę"}  
                    </Button>}
                  </Stack>
                }
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper elevation={2} sx={{borderRadius: 4, pb: 4}}>
                <Box justifyContent={"space-between"} display={"flex"} minHeight={"4rem"}>
                  <Box display={"flex"} gap={2} m={2}>
                    <DateRange sx={{mt: 0.5}}/>
                    <Typography variant="h5">
                      Najbliższy urlop
                    </Typography>
                  </Box>
                  <Box m={2}>
                    <IconButton onClick={handleOpenLeaveMenu}>
                      <MoreHoriz />
                    </IconButton>
                    <Menu 
                      id="leave-menu"
                      anchorEl={leaveMenuAnchor}
                      open={leaveMenuOpen}
                      onClose={handleCloseLeaveMenu}
                    >
                      <MenuItem onClick={handleLeaveRequestDialogOpen}>Złóż wniosek o urlop</MenuItem>
                      <Dialog open={isLeaveRequestDialogOpen} onClose={handleLeaveRequestDialogClose}>
                        <DialogTitle>Złóż wniosek urlopowy</DialogTitle>
                        <DialogContent sx={{ paddingBottom: 0 }}>
                          <form onSubmit={handleLeaveRequestDialogSubmit}>
                            <Box display={"flex"} justifyContent={"space-between"} gap={2}>
                              <TextField
                                required
                                margin="dense"
                                id="dataStart"
                                name="dataStart"
                                label="Początek urlopu"
                                type="date"
                                fullWidth
                                slotProps={{
                                  inputLabel: {shrink: true}
                                }}
                              />
                              <TextField
                                required
                                margin="dense"
                                id="dataKoniec"
                                name="dataKoniec"
                                label="DataKoniec"
                                type="date"
                                fullWidth
                                slotProps={{
                                  inputLabel: {shrink: true}
                                }}
                              />
                            </Box>
                            <TextField
                              select
                              required
                              margin="dense"
                              id="rodzaj"
                              name="rodzaj"
                              label="Rodzaj"
                              type="select"
                              fullWidth
                            >
                              <Box sx={{maxHeight: "15rem", overflow: "auto"}}>
                                {leaveTypes.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Box>
                            </TextField>
                            
                            <DialogActions>
                              <Button onClick={handleLeaveRequestDialogClose}>Odrzuć</Button>
                              <Button type="submit">Złóż</Button>
                            </DialogActions>
                          </form>
                        </DialogContent>
                      </Dialog>  
                    </Menu>
                  </Box>
                </Box>
                <Divider />
                <Card elevation={4} sx={{ m: 2, borderRadius: 4 }}>
                  {/* This needs separate logic from backend to actually get the last leave, as currently I only get this months */}
                  {employeeLeaves && employeeLeaves.length > 0 && (
                  <Stack direction="row" spacing={2} alignItems="center" ml={2} mt={2} mb={2}>
                    <CalendarMonth />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {`${dayjs(employeeLeaves[0].dataStart).format('D MMMM')} - ${dayjs(employeeLeaves[0].dataKoniec).format('D MMMM')}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="left">
                        Ilość dni do: {calculateUpcomingLeaveDayAmount(employeeLeaves[0].dataStart)}
                      </Typography>
                    </Box>
                  </Stack>)}
                </Card>
              </Paper>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Paper elevation={2} sx={{minHeight: "16rem", borderRadius: 4 }}>
              <Grid container columnSpacing={2}>
                <Grid size={6}>
                  <Stack 
                    direction={"row"} 
                    spacing={2}
                    m={2}
                  >
                    <Card elevation={4} sx={{p: 1, borderRadius: 4}}>
                      <Typography>
                        {`Wymiar pracy: ${employeeData?.wymiarPracy === "Pełny etat" ? 160 : 80} godz.`}
                      </Typography>
                    </Card>
                    <Card elevation={4} sx={{p: 1, borderRadius: 4}}>
                      <Typography>
                        {`Przepracowano: ${hoursSummary.regular+hoursSummary.overtimeDay+hoursSummary.overtimeHoliday+hoursSummary.overtimeNight} godz. `} 
                      </Typography>
                    </Card>
                    <Card elevation={4} sx={{p: 1, borderRadius: 4}}>
                      <Typography>
                        {`Nadgodziny: ${hoursSummary.overtimeDay+hoursSummary.overtimeHoliday+hoursSummary.overtimeNight} godz.`}
                      </Typography>
                    </Card>
                  </Stack>
                  <Box ml={2}>
                    <LinearProgressWithLabel value={hoursSummary.regular+hoursSummary.overtimeDay+hoursSummary.overtimeHoliday+hoursSummary.overtimeNight} max={employeeData?.wymiarPracy === "Pełny etat" ? 160 : 80} />
                  </Box>
                  <Divider sx={{mt: 2, mb: 2}} />
                  <DateCalendar
                    value={selectedDate}
                    slots={{ 
                      day: DayWithBadge,   
                      leftArrowIcon: () => null,
                      rightArrowIcon: () => null, 
                      switchViewIcon: () => null,
                      calendarHeader: () => null,
                    }}
                    slotProps={{
                      day: (ownerState) => ownerState,
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <Box display="flex" justifyContent="flex-end" m={2}>
                    <IconButton onClick={handleOpenReportMenu} >
                      <MoreHoriz />
                    </IconButton>
                    <Menu 
                      id="report-menu"
                      anchorEl={reportMenuAnchor}
                      open={reportMenuOpen}
                      onClose={handleCloseReportMenu}
                    >
                      <MenuItem onClick={handleGenerateReport}>Stwórz raport sumaryczny</MenuItem>  
                      <MenuItem onClick={handleCreateChronologicalReport}>Stwórz raport chronologiczny</MenuItem>  
                    </Menu>
                  </Box>
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { color: 'gray' },
                        innerRadius: 120,
                        valueFormatter: (value) => {
                          const total = Object.values(hoursSummary).reduce((sum, val) => sum + val, 0);
                          return `${((value.value/total)*100).toFixed(1)}%`
                        },
                      },
                    ]}
            
                    hideLegend={true}
                    width={400}
                    height={400}
                    onHighlightChange={(highlightedItem) => {
                      if (highlightedItem) {
                        setSelectedSlice([pieData[highlightedItem.dataIndex]?.label, pieData[highlightedItem.dataIndex]?.value]);
                      } else {
                        setSelectedSlice(["Suma", totalHours.toString()]);
                      }
                    }}
                  >
                    <PieCenterLabel selected={selectedSlice} />
                  </PieChart>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
          <Grid size={5}>
            <Stack rowGap={1}>
              <Paper sx={{overflow: "auto", maxHeight: "46rem", minHeight: "15rem", borderRadius: 4}} elevation={2}>
                <Paper elevation={4} sx={{marginInline: 2, mt: 2, p: 2, borderRadius: 4, width: "18rem"}}>
                  <Stack direction={"row"} spacing={3} ml={2}>
                    <AnnouncementOutlined sx={{alignSelf: "center"}}/>
                    <Typography variant="h5">Ostatnie ogłoszenia</Typography>
                  </Stack>
                </Paper>
                <Stack>
                  <Card elevation={4} sx={{display: "flex", align: "left", marginInline: 2, mt: 2, borderRadius: 4}}>
                    <Stack sx={{p:2}}>
                      <Typography variant="h5" align="left"  sx={{fontWeight: "bold", mb: 1}}>Tytuł ogłoszenia</Typography>
                      <Typography variant="h6" align="left">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer accumsan enim vel mi viverra congue. Sed condimentum at mauris a varius. Duis ac rutrum felis. Integer quis euismod quam. Nam malesuada porttitor semper. Vivamus finibus, urna quis dictum molestie, augue ante congue felis, eu rutrum mi tellus sed libero. Aenean tristique cursus magna ultricies vehicula. Fusce a auctor eros, nec volutpat velit. </Typography>
                    </Stack>
                  </Card>
                  <Card elevation={4} sx={{display: "flex", align: "left", marginInline: 2, mb: 2, mt: 2, borderRadius: 4}}>
                    <Stack sx={{p:2}}>
                      <Typography variant="h5" align="left"  sx={{fontWeight: "bold", mb: 1}}>Tytuł ogłoszenia</Typography>
                      <Typography variant="h6" align="left">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer accumsan enim vel mi viverra congue. Sed condimentum at mauris a varius. Duis ac rutrum felis. Integer quis euismod quam. Nam malesuada porttitor semper. Vivamus finibus, urna quis dictum molestie, augue ante congue felis, eu rutrum mi tellus sed libero. Aenean tristique cursus magna ultricies vehicula. Fusce a auctor eros, nec volutpat velit. </Typography>
                    </Stack>
                  </Card>
                  <Card elevation={4} sx={{display: "flex", align: "left", marginInline: 2, mb: 2, mt: 2, borderRadius: 4}}>
                    <Stack sx={{p:2}}>
                      <Typography variant="h5" align="left"  sx={{fontWeight: "bold", mb: 1}}>Tytuł ogłoszenia</Typography>
                      <Typography variant="h6" align="left">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer accumsan enim vel mi viverra congue. Sed condimentum at mauris a varius. Duis ac rutrum felis. Integer quis euismod quam. Nam malesuada porttitor semper. Vivamus finibus, urna quis dictum molestie, augue ante congue felis, eu rutrum mi tellus sed libero. Aenean tristique cursus magna ultricies vehicula. Fusce a auctor eros, nec volutpat velit. </Typography>
                    </Stack>
                  </Card>
                </Stack>
            </Paper>
            {/* <Paper sx={{ minHeight: "16rem", maxHeight: "16rem", borderRadius: 4, overflow: "auto"}} elevation={2} >
                <Paper elevation={4} sx={{display: "flex", m: 1, borderRadius: 4}}>
                  <Avatar sx={{width: 30, height: 30, boxShadow: 4, ml: 2, mt: 2, mb: 2}}>
                    <Schedule />
                  </Avatar>  
                  <Typography variant="h5" sx={{mt: 2, ml: 2}}>Alert</Typography>
                </Paper>
                <Paper elevation={4} sx={{display: "flex", m: 1, borderRadius: 4}}>
                  <Avatar sx={{width: 30, height: 30, boxShadow: 4, ml: 2, mt: 2, mb: 2}}>
                    <Schedule />
                  </Avatar>  
                  <Typography variant="h5" sx={{mt: 2, ml: 2}}>Alert</Typography>
                </Paper>
                <Paper elevation={4} sx={{display: "flex", m: 1, borderRadius: 4}}>
                  <Avatar sx={{width: 30, height: 30, boxShadow: 4, ml: 2, mt: 2, mb: 2}}>
                    <Schedule />
                  </Avatar>  
                  <Typography variant="h5" sx={{mt: 2, ml: 2}}>Alert</Typography>
                </Paper>
                <Paper elevation={4} sx={{display: "flex", m: 1, borderRadius: 4}}>
                  <Avatar sx={{width: 30, height: 30, boxShadow: 4, ml: 2, mt: 2, mb: 2}}>
                    <Schedule />
                  </Avatar>  
                  <Typography variant="h5" sx={{mt: 2, ml: 2}}>Alert</Typography>
                </Paper>
              </Paper> */}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
};

export default PersonalPanel;
