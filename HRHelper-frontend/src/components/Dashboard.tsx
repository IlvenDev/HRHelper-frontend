import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Typography,
  TableContainer,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  fetchTotalEmployees,
  fetchNewEmployees,
  fetchLeavesCount,
  fetchLeaveDistribution,
  fetchTotalHoursWorked,
  fetchCostTotal,
  fetchCostDistribution,
  // fetchDepartments,
} from "../services/dashboardService";

type DepartmentSummary = {
  name: string;
  headcount: number;
  totalCost: number;
};

const pieColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9", flex: 1, minWidth: 300 }}>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [newHires, setNewHires] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [leaveDistribution, setLeaveDistribution] = useState<{ name: string; value: number }[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [costTotal, setCostTotal] = useState(0);
  const [costDistribution, setCostDistribution] = useState<{ name: string; value: number }[]>([]);
  // const [departments, setDepartments] = useState<DepartmentSummary[]>([]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JS: 0 = January, więc dodaj 1


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          empCount,
          newEmp,
          leaveCount,
          leaveDistRaw,
          hours,
          cost,
          costDistRaw,
          // depts,
        ] = await Promise.all([
          fetchTotalEmployees(),
          fetchNewEmployees(year, month),
          fetchLeavesCount(year, month),
          fetchLeaveDistribution(year, month),
          fetchTotalHoursWorked(year, month),
          fetchCostTotal(year, month),
          fetchCostDistribution(year, month),
          // fetchDepartments(),
        ]);

        setTotalEmployees(empCount);
        setNewHires(newEmp);
        setTotalLeaves(leaveCount);
        setLeaveDistribution(Object.entries(leaveDistRaw).map(([name, value]) => ({ name, value })));
        setTotalHours(hours);
        setCostTotal(cost);
        setCostDistribution(Object.entries(costDistRaw).map(([name, value]) => ({ name, value })));
        // setDepartments(depts);
      } catch (err) {
        console.error("Błąd ładowania danych dashboardu:", err);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ minWidth: 1200 }}>
      {/* PROFILES & LEAVES */}
      <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
        <DashboardSection title="Profiles">
          <Typography variant="subtitle1">Total Employees</Typography>
          <Typography variant="h4">{totalEmployees}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle1">New Hires (This Month)</Typography>
            <Typography variant="h4">{newHires}</Typography>
          </Box>
        </DashboardSection>

        <DashboardSection title="Leaves">
          <Typography variant="subtitle1">Leaves Taken (This Month)</Typography>
          <Typography variant="h4">{totalLeaves}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle1">Leave Type Distribution</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={leaveDistribution} cx="50%" cy="50%" outerRadius={60} dataKey="value" label>
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </DashboardSection>
      </Box>

      {/* ATTENDANCE & COSTS */}
      <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
        <DashboardSection title="Attendance">
          <Typography variant="subtitle1">Total Hours Worked</Typography>
          <Typography variant="h3">{Math.round(totalHours)} hrs</Typography>
        </DashboardSection>

        <DashboardSection title="Costs">
          <Typography variant="subtitle1">Total Monthly Costs</Typography>
          <Typography variant="h3" mb={2}>${costTotal.toLocaleString()}</Typography>
          <Typography variant="subtitle1">Cost Breakdown</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={costDistribution} cx="50%" cy="50%" outerRadius={60} dataKey="value" label>
                {costDistribution.map((entry, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardSection>
      </Box>

      {/* DEPARTMENTS
      <DashboardSection title="Departments">
        <TableContainer>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
                <th style={{ padding: 10, textAlign: "left" }}>Department</th>
                <th style={{ padding: 10, textAlign: "left" }}>Headcount</th>
                <th style={{ padding: 10, textAlign: "left" }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: 10 }}>{dept.name}</td>
                  <td style={{ padding: 10 }}>{dept.headcount}</td>
                  <td style={{ padding: 10 }}>${dept.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </DashboardSection> */}
    </Box>
  );
};

export default Dashboard;
