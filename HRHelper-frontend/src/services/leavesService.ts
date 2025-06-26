import api from "../api/axios";
import type { LeaveRequest, LeaveResponse } from "../types/leavesDTO";

export const requestLeave = async (data: LeaveRequest):
    Promise<LeaveResponse> => {
        const response = await api.post('/leaves/request', data);
        return response.data;
    };

export const changeStatus = async (leaveId: number, newStatus: string):
    Promise<String> => {
        const response = await api.patch(`/leaves/change/${leaveId}`, null, {
            params: {newStatus}
        });
        return response.data;
    };

export const getAllLeaves = async ():
    Promise<LeaveResponse[]> => {
        const response = await api.get('/leaves/all');
        return response.data;
    };

export const getEmployeeLeaves = async (employeeId: number):
    Promise<LeaveResponse[]> => {
        const response = await api.get(`/leaves/employee/${employeeId}`);
        return response.data;
    };

export const getLeaveById = async (leaveId: number):
    Promise<LeaveResponse> => {
        const response = await api.get(`/leaves/${leaveId}`);
        return response.data;
    };
    
export const getLeavesByParams = async (
    dateStart: Date | undefined,
    dateEnd: Date | undefined,
    leaveStatus: string | undefined,
    leaveType: string | undefined,
    employeeId: number | undefined
    ): Promise<LeaveResponse[]> => {
    const response = await api.get('/leaves/get', {
        params: {
        dateStart,
        dateEnd,
        leaveStatus,
        leaveType,
        employeeId
        }
    });
    return response.data;
    };

export const getLeavesCountInMonth = async (year: number, month: number): Promise<number> => {
    const response = await api.get('/profiles/leaves/count', {
        params: { year, month }
    });
    return response.data;
    };
    
export const getLeaveTypeDistributionInMonth = async (year: number, month: number): Promise<Record<string, number>> => {
    const response = await api.get('/profiles/leaves/distribution', {
        params: { year, month }
    });
    return response.data;
    };