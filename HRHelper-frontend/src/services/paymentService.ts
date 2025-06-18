import api from "../api/axios"
import type { PaymentRequest, PaymentResponseBasic, PaymentResponseDetail } from "../types/payrollDTO";

export const requestPayment = async (data: PaymentRequest):
    Promise<PaymentResponse> => {
        const response = await api.post('/payments/request', data);
        return response.data;
    };

export const makePayment = async (paymentId: number):
    Promise<String> => {
        const response = await api.put(`/payments/${paymentId}/pay`);
        return response.data;
    };

export const getPaymentById = async (paymentId: number):
    Promise<PaymentResponseDetail> => {
        const response = await api.get(`/payments/${paymentId}`);
        return response.data;
    };

export const getPaymentByParams = async (
    startDate: Date | undefined,
    endDate: Date | undefined,
    bankAccountNumber: string | undefined,
    status: string | undefined,
    dueDate: Date | undefined):
    Promise<PaymentResponseBasic[]> => {
        const response = await api.get('/payments/get', {
            params: {startDate, endDate, bankAccountNumber, status, dueDate}
        });
        return response.data;
    };

