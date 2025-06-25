import api from "../api/axios";
import type { EmployeeBasicResponse, EmployeeDetailResponse, EmployeeRequest } from "../types/profilesDTO";

export const createEmployee = async (employee: EmployeeRequest):
    Promise<EmployeeBasicResponse> => {
        const response = await api.post('/profiles/create', employee);
        return response.data;
    };

export const updateEmployee = async (employeeId: number, employee: EmployeeRequest):
    Promise<String> => {
        const response = await api.put(`/profiles/${employeeId}`, employee);
        return response.data;
    };

export const deleteEmployee = async (employeeId: number):
    Promise<String> => {
        const response = await api.delete(`/profiles/delete/${employeeId}`);
        return response.data;
    };

export const getEmployeeList = async ():
    Promise<EmployeeDetailResponse[]> => {
        const response = await api.get('/profiles/list');
        return response.data;
    }

export const getById = async (employeeId: number): 
    Promise<EmployeeBasicResponse> => {
        const response = await api.get(`/profiles/${employeeId}`);
        return response.data;
    }

export const getEmployeeDetail = async (employeeId: number):
    Promise<EmployeeDetailResponse> => {
        const response = await api.get(`/profiles/${employeeId}`);
        return response.data;
    };

export const getAllEmployeesCount = async (): Promise<number> => {
    const response = await api.get('/profiles/count');
    return response.data;
    };
    
    export const getNewEmployeesCount = async (year: number, month: number): Promise<number> => {
    const response = await api.get('/profiles/count/new', {
        params: { year, month }
    });
    return response.data;
    };