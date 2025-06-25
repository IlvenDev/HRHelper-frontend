import api from '../api/axios';
import type { AttendanceEditRequest, AttendanceTimeRequest, AttendanceTimeResponse } from '../types/attendanceDTO';

export const initializeAttendance = async (data: AttendanceTimeRequest): 
    Promise<AttendanceTimeResponse> => {
        const response = await api.post('/attendance/initialize', data);
        return response.data;
    };

export const finalizeAttendance = async (id: number, endTime: string, breakTaken: boolean): 
    Promise<AttendanceTimeResponse> => {
        const response = await api.patch(`/attendance/finalize/${id}`, null, {
        params: { endTime, breakTaken },
    });
    return response.data;
};

export const editAttendance = async (
    id: number,
    payload: AttendanceEditRequest
  ): Promise<AttendanceTimeResponse> => {
    const response = await api.patch(`/attendance/edit/${id}`, payload);
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


export const getAttendanceByDateRange = async (startDate: string, endDate: string):
    Promise<AttendanceTimeResponse[]> => {
        const response = await api.get('/attendance/date', {
            params: {startDate, endDate},
        });
        return response.data;
    };


export const getAttendanceByEmployeeAndDateRange = async (employeeId: number, 
    startDate: string, 
    endDate: string):
        Promise<AttendanceTimeResponse[]> => {
            const response = await api.get('/attendance/employee', {
                params: {employeeId, startDate, endDate},
            });
        return response.data;
    };

export const getWorkedHoursInMonth = async (year: number, month: number): Promise<number> => {
    const response = await api.get('/profiles/attendance/hours', {
        params: { year, month }
    });
    return response.data;
    };