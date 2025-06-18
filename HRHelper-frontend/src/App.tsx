import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import EmployeeList from './components/Profiles/EmployeeList'
import Dashboard from './components/Dashboard'
import EmployeeDetails from './components/Profiles/EmployeeDetails'
import EmployeeAddition from './components/Profiles/EmployeeAddition'
import EmployeeEdit from './components/Profiles/EmployeeEdit'
import CostsList from './components/Payroll/Costs/CostsList'
import CostsAddition from './components/Payroll/Costs/CostsAddition'
import PaymentsList from './components/Payroll/Payments/PaymentsList'
import PaymentsAddition from './components/Payroll/Payments/PaymentAddition'
import LeavesList from './components/Leaves/LeavesList'
import LeaveAddition from './components/Leaves/LeaveAddition'
import AttendanceList from './components/Attendance/AttendanceList'

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path='/dashboard' element={<Dashboard />} />
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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
