import api from "../api/axios";
import type { LeaveRequest, LeaveResponse } from "../types/leavesDTO";

export const requestLeave = async (data: LeaveRequest):
    Promise<LeaveResponse> => {
        const response = await api.post('/leaves/request', data);
        return response.data;
    };

export const changeStatus = async (leaveId: number, newStatus: string):
    Promise<String> => {
        const response = await api.put(`/leaves/${leaveId}`, newStatus);
        return response.data;
    };

export const getAllLeaves = async ():
    Promise<LeaveResponse[]> => {
        const response = await api.get('/leaves');
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
