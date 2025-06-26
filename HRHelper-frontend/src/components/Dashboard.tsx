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
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { ExpandLess, ExpandMore} from "@mui/icons-material";
import type { AttendanceTimeResponse } from "../types/attendanceDTO";
import { getMissingAttendance, getTodayAttendance } from "../services/attendanceService";
import type { EmployeeBasicResponse } from "../types/profilesDTO";
import { getMonthlySummary } from "../services/dashboardService";
import { getLeavesByParams } from "../services/leavesService";
import dayjs from "dayjs";
import type { LeaveResponse } from "../types/leavesDTO";

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

const EMPLOYEES_PER_PAGE = 6;
const ABSENCES_PER_PAGE = 5;
const LEAVES_PER_PAGE = 5;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const [overtimeOpen, setOvertimeOpen] = useState(false);
  const [paidLeavesOpen, setPaidLeaveOpen] = useState(false);
  const [freeLeavesOpen, setFreeLeavesOpen] = useState(false);
  const [specialLeavesOpen, setSpecialLeavesOpen] = useState(false);

  const [presentEmployees, setPresentEmployees] = useState<AttendanceTimeResponse[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveResponse[]>([]);

  const [absences, setAbsences] = useState<EmployeeBasicResponse[]>([]);

  const [empPage, setEmpPage] = useState(1);
  const [absPage, setAbsPage] = useState(1);
  const [leavePage, setLeavePage] = useState(1);

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
  
  useEffect(() => {
    (async () => {
      try {
        // pobieramy np. czerwiec 2025, z dwoma świętami
        const summary = await getMonthlySummary(2025, 6, [
          "2025-06-01",
          "2025-06-15",
        ]);
        setHoursSummary(summary);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pagedEmployees = presentEmployees.slice(
    (empPage - 1) * EMPLOYEES_PER_PAGE,
    empPage * EMPLOYEES_PER_PAGE
  );

  // const filteredAbsences = absences.filter(a => a. > 2 && !a.excused);

  const pagedAbsences = absences.slice(
    (absPage - 1) * ABSENCES_PER_PAGE,
    absPage * ABSENCES_PER_PAGE
  )

  const pagedLeaves = leaveRequests.slice(
    (leavePage - 1) * LEAVES_PER_PAGE,
    leavePage * LEAVES_PER_PAGE
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{width: '100rem', mx: '8rem', mt: '3rem' }}>
      <Grid container rowSpacing={2} columnSpacing={2} minHeight={'40rem'}>
        {/* Obecni pracownicy */}
        <Grid size={6}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3, minHeight: '16rem'}}>
              <Typography variant="h6">Obecni pracownicy (dziś)</Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pracownik</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rozpoczęto</TableCell>
                    <TableCell>Zakończono</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip 
                          avatar={<Avatar>{emp.employee.name.charAt(0)}</Avatar>}
                          label={emp.employee.name + " " + emp.employee.lastname}
                          />
                        </Stack>  
                      </TableCell>
                      <TableCell>
                      <Chip
                        label={
                          emp.startTime == null
                            ? "Nieobecny"
                            : emp.endTime != null
                              ? "Po pracy"
                              : "Obecny"
                        }
                        color={
                          emp.startTime == null
                            ? "default"
                            : emp.endTime != null
                              ? "primary"
                              : emp.breakTaken
                                ? "warning"
                                : "success"
                        }
                        size="small"
                      />
                      </TableCell>
                      <TableCell>{emp.startTime}</TableCell>
                      <TableCell>{emp.endTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Math.ceil(presentEmployees.length / EMPLOYEES_PER_PAGE)}
                  page={empPage}
                  onChange={(_, val) => setEmpPage(val)}
                  size="small"
                />
              </Box>
            </Paper>
            <Paper sx={{ p: 3, minHeight: '23rem', maxHeight: '23rem' }}>
              <Typography variant="h6">Nieusprawiedliwione nieobecności</Typography>
              <Divider sx={{ mb: 2 }} />
              {absences.length === 0 ? (
                <Typography variant="body2">Brak nieusprawiedliwionych nieobecności powyżej 2 dni.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pracownik</TableCell>
                      {/* <TableCell>Ilość dni</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedAbsences
                      .map(a => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Chip 
                              avatar={<Avatar>{a.name.charAt(0)}</Avatar>}
                              label={a.name + " " + a.lastname}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Math.ceil(absences.length / ABSENCES_PER_PAGE)}
                  page={absPage}
                  onChange={(_, val) => setAbsPage(val)}
                  size="small"
                />
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Podsumowanie godzin | może warto dodać przycisk (profil) gdzie wrzuca na jego profil z danymi*/}
        <Grid size={6}>
          <Stack spacing={2} >
            <Grid container rowSpacing={2}>
              <Grid size={12}>
                <Paper sx={{ p: 3, minHeight: "18rem", maxHeight: "18rem", overflow: "auto"}}>
                  <Typography variant="h6">Szczegóły przepracowanych godzin</Typography>
                  <Divider sx={{ mb: 2 }} />
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

                {/* regular: 602,
        leavePregnant: 36,
        leaveParental: 52,
        leaveTraining: 12,
        leaveHigherPower: 8,
        leaveJobSearch: 25,
        leaveBlood: 5,
        leaveCarer: 16,
        sickLeave: 214, */}
              </Grid>
              <Grid size={12}>
                <Paper sx={{ p: 3, minHeight: "18rem" }}>
                  <Typography variant="h6">Rozkład godzin</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <PieChart
                    series={[
                      {
                        data: [
                          // { id: 0, value: hoursSummary.regular, label: 'Normalne' },
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
                        ],
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                        valueFormatter: (value) => {
                          const total = Object.values(hoursSummary).reduce((sum, val) => sum + val, 0);
                          return `${((value.value/total)*100).toFixed(1)}%`
                        },

                        // arcLabel: (item) => {
                        //   const total = Object.values(hoursSummary).reduce((sum, val) => sum + val, 0);
                        //   if (total === 0) return '0%';
                        //   const percent = (item.value / total) * 100;
                        //   return `${percent.toFixed(1)}%`;
                        // },

                      },
                    ]}
                    width={400}
                    height={250}
                  />

                </Paper>
              </Grid>
            </Grid>
            
          </Stack>
        </Grid>

        {/* Wnioski urlopowe */}
        <Grid size={12}>
          <Paper sx={{ p: 3, minHeight: 280 }}>
            <Typography variant="h6">Wnioski urlopowe wymagające uwagi</Typography>
            <Divider sx={{ mb: 2 }} />
            {leaveRequests.length === 0 ? (
              <Typography variant="body2">Brak oczekujących wniosków.</Typography>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pracownik</TableCell>
                      <TableCell>Rodzaj</TableCell>
                      <TableCell>Złożono</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedLeaves.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <Chip 
                            avatar={<Avatar>{req.employee.name.charAt(0)}</Avatar>}
                            label={req.employee.name}
                          />
                        </TableCell>
                        <TableCell>{req.rodzaj}</TableCell>
                        <TableCell>{new Date(req.złożono).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label="Potrzebna akcja" 
                            color="warning" 
                            size="small" 
                            clickable/>
                        </TableCell>
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
    </Box>
  );
};

export default Dashboard;
