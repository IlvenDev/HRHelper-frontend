import api from '../api/axios';
import type { AttendanceTimeRequest, AttendanceTimeResponse } from '../types/attendanceDTO';

export const initializeAttendance = async (data: AttendanceTimeRequest): 
    Promise<AttendanceTimeResponse> => {
        const response = await api.post('/attendance/initialize', data);
        return response.data;
    };

export const finalizeAttendance = async (id: number, endTime: string): 
    Promise<AttendanceTimeResponse> => {
        const response = await api.put(`/attendance/finalize/${id}`, null, {
        params: { endTime },
    });
    return response.data;
};
    
export const getAllAttendance = async (): 
    Promise<AttendanceTimeResponse[]> => {
        const response = await api.get('/attendance/all');
        return response.data;
    };

export const getAttendanceByEmployee = async (employeeId: number):
    Promise<AttendanceTimeResponse[]> => {
        const response = await api.get(`/attendance/employee/${employeeId}`);
        return response.data;
    }


export const getAttendanceByDateRange = async (startDate: Date, endDate: Date):
    Promise<AttendanceTimeResponse[]> => {
        const response = await api.get('/attendance/date', {
            params: {startDate, endDate},
        });
        return response.data;
    };

export const getAttendanceByEmployeeAndDateRange = async (employeeId: number, 
    startDate: number, 
    endDate: number):
        Promise<AttendanceTimeResponse[]> => {
            const response = await api.get('/attendance/employee', {
                params: {employeeId, startDate, endDate},
            });
        return response.data;
    };