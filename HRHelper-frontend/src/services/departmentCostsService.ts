import api from "../api/axios";
import type { DepartmentCosts, DepartmentCostsRequest } from "../types/payrollDTO";

export const addCosts = async (data: DepartmentCostsRequest):
    Promise<DepartmentCosts> => {
        const response = await api.post('/costs/add', data);
        return response.data;
    };

export const getCostsById = async (id: number): 
    Promise<DepartmentCosts> => {
        const response = await api.get(`/costs/${id}`);
        return response.data;
    };

export const getByParams = async (
    department: string,
    date: Date,
    costType: string,
    startDate: Date,
    endDate: Date):
    Promise<DepartmentCosts> => {
        const response = await api.get('/costs/get', {
            params: {
                department, date, costType, startDate, endDate
            }
        })
        return response.data;
    };


