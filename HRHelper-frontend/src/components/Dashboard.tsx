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

type PresentEmployee = {
  id: number;
  name: string;
  status: string;
  startTime: string;
};

type LeaveRequest = {
  id: number;
  employee: string;
  type: string;
  submittedAt: string;
};

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

type Absence = {
  id: number;
  employee: string;
  daysAbsent: number;
  excused: boolean;
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

  const [presentEmployees, setPresentEmployees] = useState<PresentEmployee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
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
  const [absences, setAbsences] = useState<Absence[]>([]);

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

  useEffect(() => {
    // MOCK DATA
    setTimeout(() => {
      setPresentEmployees([
        { id: 1, name: "Anna Kowalska", status: "Obecny", startTime: "08:03" },
        { id: 2, name: "Jan Nowak", status: "Obecny", startTime: "07:51" },
        { id: 3, name: "Maria Wiśniewska", status: "Przerwa", startTime: "08:10" },
        { id: 4, name: "Tomasz Zieliński", status: "Obecny", startTime: "08:05" },
        { id: 5, name: "Katarzyna Mazur", status: "Przerwa", startTime: "07:58" },
        { id: 6, name: "Piotr Wójcik", status: "Obecny", startTime: "08:00" },
        { id: 7, name: "Agnieszka Kwiatkowska", status: "Obecny", startTime: "08:02" },
        { id: 8, name: "Michał Lewandowski", status: "Przerwa", startTime: "07:55" },
        { id: 9, name: "Ewa Kamińska", status: "Obecny", startTime: "08:07" },
        { id: 10, name: "Andrzej Dąbrowski", status: "Obecny", startTime: "08:12" },
        { id: 11, name: "Natalia Jabłońska", status: "Obecny", startTime: "08:04" },
        { id: 12, name: "Grzegorz Pawlak", status: "Przerwa", startTime: "08:01" },
        { id: 13, name: "Monika Król", status: "Obecny", startTime: "08:06" },
        { id: 14, name: "Rafał Wieczorek", status: "Obecny", startTime: "07:59" },
        { id: 15, name: "Paulina Nowicka", status: "Obecny", startTime: "08:08" },
        { id: 16, name: "Damian Maj", status: "Przerwa", startTime: "07:57" },
        { id: 17, name: "Karolina Olszewska", status: "Obecny", startTime: "08:09" },
        { id: 18, name: "Bartłomiej Sikora", status: "Obecny", startTime: "08:00" },
        { id: 19, name: "Joanna Walczak", status: "Obecny", startTime: "07:54" },
        { id: 20, name: "Krzysztof Rutkowski", status: "Przerwa", startTime: "08:11" },
        { id: 21, name: "Izabela Baran", status: "Obecny", startTime: "08:03" },
        { id: 22, name: "Sebastian Tomaszewski", status: "Obecny", startTime: "08:05" },
        { id: 23, name: "Zofia Górska", status: "Obecny", startTime: "08:06" },
        { id: 24, name: "Marek Szymański", status: "Przerwa", startTime: "07:56" },
        { id: 25, name: "Aleksandra Czarnecka", status: "Obecny", startTime: "08:01" },
      ]);
      

      setAbsences([
        { id: 1, employee: "Anna Kowalska", daysAbsent: 3, excused: false },
        { id: 2, employee: "Jan Nowak", daysAbsent: 1, excused: false },
        { id: 3, employee: "Maria Wiśniewska", daysAbsent: 4, excused: false },
        { id: 4, employee: "Tomasz Zieliński", daysAbsent: 5, excused: false },
        { id: 5, employee: "Agnieszka Kwiatkowska", daysAbsent: 3, excused: false },
        { id: 6, employee: "Piotr Wójcik", daysAbsent: 6, excused: false },
        { id: 7, employee: "Michał Lewandowski", daysAbsent: 2, excused: false },
        { id: 8, employee: "Ewa Kamińska", daysAbsent: 4, excused: false },
        { id: 9, employee: "Andrzej Dąbrowski", daysAbsent: 3, excused: false },
        { id: 10, employee: "Natalia Jabłońska", daysAbsent: 5, excused: false },
        { id: 11, employee: "Grzegorz Pawlak", daysAbsent: 4, excused: false },
        { id: 12, employee: "Monika Król", daysAbsent: 3, excused: false },
        { id: 13, employee: "Paulina Nowicka", daysAbsent: 5, excused: false },
        { id: 14, employee: "Damian Maj", daysAbsent: 3, excused: false },
        { id: 15, employee: "Joanna Walczak", daysAbsent: 4, excused: true },
        { id: 16, employee: "Krzysztof Malec", daysAbsent: 6, excused: false },
        { id: 17, employee: "Zofia Górska", daysAbsent: 5, excused: true },
        { id: 18, employee: "Sebastian Tomaszewski", daysAbsent: 7, excused: false },
        { id: 19, employee: "Izabela Baran", daysAbsent: 4, excused: true },
        { id: 20, employee: "Bartłomiej Sikora", daysAbsent: 3, excused: false },
      ]);
      
      

      setLeaveRequests([
        { id: 1, employee: "Krzysztof Malec", type: "Wypoczynkowy", submittedAt: "2025-06-15" },
        { id: 2, employee: "Ewa Zawadzka", type: "Opieka nad dzieckiem", submittedAt: "2025-06-16" },
        { id: 3, employee: "Łukasz Kowalczyk", type: "Chorobowe", submittedAt: "2025-06-13" },
        { id: 4, employee: "Karolina Olszewska", type: "Wypoczynkowy", submittedAt: "2025-06-14" },
        { id: 5, employee: "Sebastian Tomaszewski", type: "Bezpłatny", submittedAt: "2025-06-12" },
        { id: 6, employee: "Zofia Górska", type: "Opieka nad dzieckiem", submittedAt: "2025-06-17" },
        { id: 7, employee: "Marek Szymański", type: "Chorobowe", submittedAt: "2025-06-11" },
        { id: 8, employee: "Izabela Baran", type: "Wypoczynkowy", submittedAt: "2025-06-10" },
        { id: 9, employee: "Aleksandra Czarnecka", type: "Macierzyński", submittedAt: "2025-06-09" },
        { id: 10, employee: "Rafał Wieczorek", type: "Ojcowski", submittedAt: "2025-06-08" },
        { id: 11, employee: "Bartłomiej Sikora", type: "Wypoczynkowy", submittedAt: "2025-06-07" },
        { id: 12, employee: "Joanna Walczak", type: "Chorobowe", submittedAt: "2025-06-06" },
        { id: 13, employee: "Grzegorz Pawlak", type: "Wypoczynkowy", submittedAt: "2025-06-05" },
        { id: 14, employee: "Paulina Nowicka", type: "Opieka nad dzieckiem", submittedAt: "2025-06-04" },
        { id: 15, employee: "Damian Maj", type: "Bezpłatny", submittedAt: "2025-06-03" },
      ]);
      

      setHoursSummary({
        regular: 602,
        overtimeDay: 123,
        overtimeNight: 52,
        overtimeHoliday: 12,
        leaveVacation: 64,
        leaveUnpaid: 4,
        leaveCircumstance: 8,
        leavePregnant: 36,
        leaveParental: 52,
        leaveTraining: 12,
        leaveHigherPower: 8,
        leaveJobSearch: 25,
        leaveBlood: 5,
        leaveCarer: 16,
        sickLeave: 52,
      });

      setLoading(false);
    }, 1000);
  }, []);

  const pagedEmployees = presentEmployees.slice(
    (empPage - 1) * EMPLOYEES_PER_PAGE,
    empPage * EMPLOYEES_PER_PAGE
  );

  const filteredAbsences = absences.filter(a => a.daysAbsent > 2 && !a.excused);

  const pagedAbsences = filteredAbsences.slice(
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
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Dashboard HR - Czerwiec 2025
      </Typography>

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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip 
                          avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
                          label={emp.name}
                          />
                        </Stack>  
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={emp.status} 
                          color={
                            emp.status === "Obecny"
                              ? "success"
                              : emp.status === "Przerwa"
                              ? "warning"
                              : "default"
                          } 
                          size="small"/>
                      </TableCell>
                      <TableCell>{emp.startTime}</TableCell>
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
              {filteredAbsences.length === 0 ? (
                <Typography variant="body2">Brak nieusprawiedliwionych nieobecności powyżej 2 dni.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pracownik</TableCell>
                      <TableCell>Dni nieobecności</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedAbsences
                      .filter(a => a.daysAbsent > 2 && !a.excused)
                      .map(a => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Chip 
                              avatar={<Avatar>{a.employee.charAt(0)}</Avatar>}
                              label={a.employee}
                            />
                          </TableCell>
                          <TableCell>{a.daysAbsent}</TableCell>
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
                            avatar={<Avatar>{req.employee.charAt(0)}</Avatar>}
                            label={req.employee}
                          />
                        </TableCell>
                        <TableCell>{req.type}</TableCell>
                        <TableCell>{req.submittedAt}</TableCell>
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
