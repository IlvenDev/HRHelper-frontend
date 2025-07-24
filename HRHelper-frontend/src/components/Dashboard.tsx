import React, { use, useEffect, useState } from "react";
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
  Chip,
  Pagination,
  Grid,
  Stack,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItem,
  Breadcrumbs,
  Badge,
  IconButton,
  Button,
  styled,
  Menu,
  MenuItem,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import {  ExpandLess, ExpandMore, MoreHoriz, Schedule, TrendingDown, TrendingUp} from "@mui/icons-material";
import type { AttendanceTimeResponse } from "../types/attendanceDTO";
import { getMissingAttendance, getTodayAttendance } from "../services/attendanceService";
import type { EmployeeBasicResponse } from "../types/profilesDTO";
import { getMonthlySummary } from "../services/dashboardService";
import { getLeavesByParams } from "../services/leavesService";
import dayjs, { Dayjs } from "dayjs";
import type { LeaveResponse } from "../types/leavesDTO";
import { DatePicker } from "@mui/x-date-pickers";
import { downloadMonthlyPersonalSummaryPdf, downloadMonthlySummaryPdf, generateAllMonthlyReportsForEmployees, generateCompanyDetailedReportPdf } from "../raporting/raportingService";
import { getEmployeeList } from "../services/profilesService";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, useDrawingArea } from "@mui/x-charts";

type HoursSummary = {
  regular: number;
  overtimeDay: number;
  overtimeNight: number;
  overtimeHoliday: number;
  leaveVacation: number;
  leaveUnpaid: number;
  leaveCircumstance: number;
  leavePregnant: number;
  leaveParental: number;
  leaveTraining: number;
  leaveHigherPower: number;
  leaveJobSearch: number;
  leaveBlood: number;
  leaveCarer: number;
  sickLeave: number;
};

const LEAVES_PER_PAGE = 5;

const Dashboard = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true);

  const [presentEmployees, setPresentEmployees] = useState<EmployeeBasicResponse[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveResponse[]>([]);

  const [absences, setAbsences] = useState<EmployeeBasicResponse[]>([]);

  const [leavePage, setLeavePage] = useState(1);


  const loadPresentEmployees = async () => {
      try {
        const data = await getTodayAttendance();
        setPresentEmployees(data);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      } finally {
        setLoading(false);
      }
    };

  const loadAbsentEmployees = async () => {
    try {
      const data = await getMissingAttendance();
      setAbsences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const loadWaitingLeaves = async () => {
    try {
      const data = await getLeavesByParams(dayjs().startOf("month").toDate(), dayjs().endOf("month").toDate(), "OCZEKUJĄCE", undefined, undefined )
      setLeaveRequests(data.filter((leave => leave.status == "OCZEKUJĄCE")));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPresentEmployees();
    loadAbsentEmployees();
    loadWaitingLeaves();
  }, []);
      
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

  const pagedLeaves = leaveRequests.slice(
    (leavePage - 1) * LEAVES_PER_PAGE,
    leavePage * LEAVES_PER_PAGE
  );

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const year = selectedDate.year();
        const month = selectedDate.month() + 1;
        const days = [
          `${year}-${String(month).padStart(2, "0")}-01`,
          `${year}-${String(month).padStart(2, "0")}-15`,
        ];
  
        const summary = await getMonthlySummary(year, month, days);
        setHoursSummary(summary); // updates async
      } catch (e) {
        console.error(e);
      }
    };
  
    fetchSummary();
  }, [selectedDate]);

  const [totalHours, setTotalHours] = useState<number>(Object.values(hoursSummary).reduce((sum, val) => sum + val, 0));

  useEffect(() => {
    const total = Object.values(hoursSummary).reduce((sum, val) => sum + val, 0);
    setTotalHours(total);
  }, [hoursSummary]);

 

  const handleGenerateMonthlySummaryReport = async () => {
    // const employees = await getEmployeeList();
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;

    try {
      downloadMonthlySummaryPdf(hoursSummary, year, month);
    } catch (error) {
      console.error(error);
    }
  }

  const handleGenerateCompanySummaryReport = async () => {
      const employees = await getEmployeeList();
      const year = selectedDate.year();
      const month = selectedDate.month() + 1;
      const days = [
        `${year}-${String(month).padStart(2, "0")}-01`,
        `${year}-${String(month).padStart(2, "0")}-15`,
      ];
    
      try {
        generateAllMonthlyReportsForEmployees(
          employees,
          year,
          month,
          days
        );
    
        // downloadMonthlySummaryPdf(summary, year, month);
      } catch (error) {
        console.error("Nie udało się pobrać podsumowania do raportu", error);
      }
    };

    const handleGenerateDetailedReports = async () => {
      const year = selectedDate.year();
      const month = selectedDate.month() + 1;
    
      try {
        const employees = await getEmployeeList();
        await generateCompanyDetailedReportPdf(employees, year, month);
      } catch (error) {
        console.error("Nie udało się wygenerować raportów szczegółowych:", error);
      }
    };

    const labelMap: Record<keyof HoursSummary, string> = {
      regular: "Normalne",
      overtimeDay: "Nadgodziny dzienne",
      overtimeNight: "Nadgodziny nocne",
      overtimeHoliday: "Świąteczne",
      leaveVacation: "Urlop wypoczynkowy",
      leaveUnpaid: "Urlop bezpłatny",
      leaveCircumstance: "Urlop okolicznościowy",
      leavePregnant: "Macierzyński",
      leaveParental: "Wychowawczy",
      leaveTraining: "Szkoleniowy",
      leaveHigherPower: "Siła wyższa",
      leaveJobSearch: "Poszukiwanie pracy",
      leaveBlood: "Oddanie krwi",
      leaveCarer: "Opiekuńczy",
      sickLeave: "Chorobowe",
    };
    
    const barChartData = Object.entries(hoursSummary).map(([key, value]) => ({
      label: labelMap[key as keyof HoursSummary] || key,
      value,
    }));
    
    const StyledText = styled('text')(({ theme }) => ({
      fill: theme.palette.text.primary,
      textAnchor: 'middle',
      dominantBaseline: 'central',
      fontSize: 20,
    }));
    
    function PieCenterLabel({ selected}: { selected: string[] | undefined}) {
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

    const [selectedSlice, setSelectedSlice] = useState(["Suma", totalHours.toString()]);

    useEffect(() => {
      setSelectedSlice(["Suma", totalHours.toString()]);
    }, [totalHours]);    

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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

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
    <Box sx={{width: '100rem', mx: '8rem', mt: '3rem' }}>
      <Breadcrumbs>
        <Link color="inherit" to={"/"}>
          Dashboard
        </Link>
        <Typography sx={{ color: 'text.primary' }}>Home</Typography>
      </Breadcrumbs>
      <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
        <Typography align="left" variant="h3">
          {"Witaj z powrotem! Dzisiaj jest " + dayjs().date() + " " + dayjs().format('MMMM')}
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
      <Grid container rowSpacing={2} columnSpacing={2} minHeight={'40rem'}>
        <Grid size={6}>
          <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Paper sx={{ minHeight: "15rem", borderRadius: 4}} elevation={2}>
                    <Box display={"flex"}>
                      <Typography variant="h5" sx={{mt: 2, ml: 2, mb: 1}}>{`Obecni pracownicy: ${presentEmployees.length} / ${presentEmployees.length+absences.length}`}</Typography>
                    </Box>
                    <Divider />
                    <Stack overflow={"auto"} maxHeight={"15rem"}>
                      {presentEmployees.map((attendance) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mt: 2 }}>
                          <Badge 
                            color="success" 
                            variant="dot" 
                            overlap="circular"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                          >
                            <Avatar>
                              N
                            </Avatar>
                          </Badge>
                          <Typography ml={2} variant="h6">
                            {attendance.name + " " + attendance.lastname}
                          </Typography>
                        </Box>
                      ))}
                      
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={6}>
                <Paper sx={{ minHeight: "15rem", borderRadius: 4}} elevation={2}>
                  <Box display={"flex"}>
                    <Typography variant="h5" sx={{mt: 2, ml: 2, mb: 1}}>{`Nieobecni pracownicy: ${absences.length} / ${presentEmployees.length+absences.length}`}</Typography>
                  </Box>
                  <Divider />
                  <Stack overflow={"auto"} maxHeight={"15rem"}>
                    {absences.map((absence) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mt: 2 }}>
                      <Badge 
                        color="error" 
                        variant="dot" 
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar>
                          {absence.name.charAt(0) + absence.lastname.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Typography ml={2} variant="h6">
                        {absence.name + " " + absence.lastname}
                      </Typography>
                    </Box>
                    ))}
                    
                  </Stack>
                </Paper>
                </Grid>
              </Grid>
              <Paper sx={{minHeight: "18rem", overflow: "auto", borderRadius: 4}} elevation={2}>
                  <Box display={"flex"} justifyContent={"space-between"} sx={{mb: 2, m: 3}}>
                    <Typography variant="h6">Szczegóły godzin</Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <IconButton 
                        type="button" 
                        onClick={handleClick}>
                        <MoreHoriz />
                      </IconButton>
                      <Menu
                        id="hours-details-menu"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal:"left",
                        }}
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleGenerateCompanySummaryReport}>Stwórz raport osobowy</MenuItem>
                        <MenuItem onClick={handleGenerateMonthlySummaryReport}>Stwórz raport sumaryczny</MenuItem>
                        <MenuItem onClick={handleGenerateDetailedReports}>Stwórz raport chronologiczny</MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <BarChart
                    layout="horizontal"
                    yAxis={[{ scaleType: 'band', dataKey: 'label' }]} // Labels on Y-axis now
                    xAxis={[{ scaleType: 'linear' }]}                 // Values on X-axis
                    grid={{vertical: true}}
                    series={[{ dataKey: 'value', label: 'Godziny' }]}
                    dataset={barChartData}
                    hideLegend={true}
                    width={800}
                    height={600}
                  />
                </Paper>
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack spacing={2} >
            <Grid container spacing={2}>
              <Grid size={6}>
                <Paper sx={{ minHeight: "10rem", borderRadius: 4}} elevation={2}>
                  <Stack textAlign={"left"}>
                    <Typography variant="h5" sx={{mt: 2, ml: 2}}>Średnie godziny</Typography>
                    <Typography variant="h3" sx={{mt: 1, ml: 2, mb: 1}}>37</Typography>
                  </Stack>
                  {/* <Divider />
                  <Box display={"flex"} mt={1} >
                    <TrendingDown sx={{marginInline: 2}} color= "error"/>
                    <Typography color="error">13% upadek vs ostatni miesiąc</Typography> 
                  </Box> */}
                </Paper>
              </Grid>
              <Grid size={6}>
              <Paper sx={{ minHeight: "10rem", borderRadius: 4}} elevation={2}>
                  <Stack textAlign={"left"}>
                    <Typography variant="h5" sx={{mt: 2, ml: 2}}>Nowi pracownicy</Typography>
                    <Typography variant="h3" sx={{mt: 1, ml: 2, mb: 1}}>12</Typography>
                  </Stack>
                  {/* <Divider />
                  <Box display={"flex"} mt={1} >
                    <TrendingUp sx={{marginInline: 2}} color= "success"/>
                    <Typography color="success">27% wzrost vs ostatni miesiąc</Typography> 
                  </Box> */}
                </Paper>
              </Grid>
              {/* <Grid size={12}>
                <Paper sx={{ minHeight: "15rem", maxHeight: "15rem", borderRadius: 4, overflow: "auto"}} elevation={2} >
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
                </Paper>
              </Grid>             */}
      
              <Grid size={12}>
                <Paper sx={{minHeight: "37rem", borderRadius: 4}} elevation={2}>
                  <Typography variant="h5" align="left" sx={{ml: 2, pt: 1, mb: 1}}>Rozkład godzin</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <PieChart
                    sx={{mt: 8}}
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
                </Paper>
              </Grid>
              <Grid size={12}>
          <Paper sx={{minHeight: 280, borderRadius: 4 }} elevation={2}>
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
              <Typography variant="h6" align="left" sx={{ml: 2, pt: 1, mb: 1}}>Wnioski urlopowe wymagające uwagi</Typography>
              <Box>
              <Button 
                variant="contained"
                size="small"
                component={Link}
                to={"/leaves"}
                sx={{mr: 2}}>
               Przejdź do urlopów
              </Button>
              </Box>    
            </Box>
            <Divider sx={{ mb: 2 }} />
            {leaveRequests.length === 0 ? (
              <Typography variant="body2">Brak oczekujących wniosków.</Typography>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight: "bold"}}>Pracownik</TableCell>
                      <TableCell sx={{fontWeight: "bold"}}>Rodzaj</TableCell>
                      <TableCell sx={{fontWeight: "bold"}}>Złożono</TableCell>
                      <TableCell sx={{fontWeight: "bold"}}>Długość</TableCell>
                      {/* <TableCell sx={{fontWeight: "bold"}}>Akcje</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedLeaves.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.employee.name + " " + req.employee.lastname}</TableCell>
                        <TableCell>{req.rodzaj}</TableCell>
                        <TableCell>{new Date(req.złożono).toLocaleDateString()}</TableCell>
                        <TableCell>{calculateLeaveDays(req.dataStart, req.dataKoniec)}</TableCell>
                        {/* <TableCell>
                          <Chip 
                            label="Przejdź do" 
                            color="primary" 
                            size="small" 
                            clickable/>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={Math.ceil(leaveRequests.length / LEAVES_PER_PAGE)}
                    page={leavePage}
                    onChange={(_, val) => setLeavePage(val)}
                    size="small"
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>
            </Grid>
          </Stack>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default Dashboard;
