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

export const getCostsByParams = async (
    department: string | undefined,
    date: Date | undefined,
    costType: string | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined):
    Promise<DepartmentCosts[]> => {
        const response = await api.get('/costs/get', {
            params: {
                department, date, costType, startDate, endDate
            }
        })
        return response.data;
    };

export const getTotalCostsInMonth = async (year: number, month: number): Promise<number> => {
    const response = await api.get('/profiles/costs/total', {
        params: { year, month }
    });
    return response.data;
    };
    
    // Pobierz rozkład kosztów według typów (np. SALARY, BONUS, OFFICE)
    export const getCostDistributionInMonth = async (year: number, month: number): Promise<Record<string, number>> => {
    const response = await api.get('/profiles/costs/distribution', {
        params: { year, month }
    });
    return response.data;
    };

