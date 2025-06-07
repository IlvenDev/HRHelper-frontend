import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import EmployeeList from './components/Profiles/EmployeeList'
import Dashboard from './components/Dashboard'
import EmployeeDetails from './components/Profiles/EmployeeDetails'
import EmployeeAddition from './components/Profiles/EmployeeAddition'
import EmployeeEdit from './components/Profiles/EmployeeEdit'

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

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
