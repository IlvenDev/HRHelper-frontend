import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import EmployeeList from './components/Hr/Profiles/EmployeeList'
import Dashboard from './components/Dashboard'
import EmployeeDetails from './components/Hr/Profiles/EmployeeDetails'
import EmployeeAddition from './components/Hr/Profiles/EmployeeAddition'
import EmployeeEdit from './components/Hr/Profiles/EmployeeEdit'
import CostsList from './components/Hr/Payroll/Costs/CostsList'
import CostsAddition from './components/Hr/Payroll/Costs/CostsAddition'
import PaymentsList from './components/Hr/Payroll/Payments/PaymentsList'
import PaymentsAddition from './components/Hr/Payroll/Payments/PaymentAddition'
import LeavesList from './components/Hr/Leaves/LeavesList'
import LeaveAddition from './components/Hr/Leaves/LeaveAddition'
import AttendanceList from './components/Hr/Attendance/AttendanceList'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoginPage from './components/LoginPage'
import PersonalPanel from './components/User/PersonalPanel'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/pl';


dayjs.locale("pl");

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedId = localStorage.getItem("employeeId");
    setRole(storedRole);
    setIsLoggedIn(storedId !== null);
  }, []);

  // Dodaj funkcję, którą przekażesz do LoginPage, żeby zaktualizować stan po zalogowaniu:
  const onLogin = () => {
    setRole(localStorage.getItem("role"));
    setIsLoggedIn(localStorage.getItem("employeeId") !== null);
  };

  const onLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
        <BrowserRouter>
          {isLoggedIn && <Navbar onLogout={onLogout} />}
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage onLogin={onLogin}/>} />
            {/* HR paths */}
            <Route path='/dashboard' element={localStorage.getItem("role") === "HR" ? <Dashboard /> : <Navigate to="/unauthorized" />}/>
            <Route path='/employees' element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/employees/add" element={<EmployeeAddition />} />
            <Route path="/employees/:id/edit" element={<EmployeeEdit />} />
            <Route path="/costs" element={<CostsList />} />
            <Route path="/costs/add" element={<CostsAddition />} />
            <Route path="/payments" element={<PaymentsList />} />
            <Route path="/payments/create" element={<PaymentsAddition />} />
            <Route path="/leaves" element={<LeavesList />} />
            <Route path="/leaves/add" element={<LeaveAddition />} />
            <Route path="/attendance" element={<AttendanceList />} />
            {/* Employee paths */}
            <Route path="/personal-panel" element={<PersonalPanel />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
      
    </>
  )
}

export default App
