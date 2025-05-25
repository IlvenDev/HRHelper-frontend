import type { EmployeeBasicResponse } from "./ProfilesDTO";

export interface PaymentResponseBasic {
    id: number;
    bankAccountNumber: string;
    amount: number;
    currency: string;
    status: string; // Might want to ENUM this
}

export interface PaymentResponseDetails extends PaymentResponseBasic {
    dueDate: Date;
    paymentDate: Date;
    employeePaymentDetails: EmployeePaymentDetails;
}

export interface EmployeePaymentDetails {
    id: number;
    bankName: string;
    baseSalary: number;
    currency: string;
    payFrequency: string; // might want to ENUM
    bankAccountNumber: string;
    employee: EmployeeBasicResponse; // Like the id? I dunno now
}

export interface DepartmentCosts {
    id: number;
    department: string; // Might want to ENUM
    date: Date;
    amount: number;
    costType: string; // Might want to ENUM
}

export interface PaymentRequest {
    id: number;
    bankAccountNumber: string;
    amount: number;
    currency: string;
    status: string; // Might want to ENUM this
    dueDate: Date;
    paymentDate: Date;
}

export interface EmployeePaymentDetailsRequest {
    bankName: string;
    baseSalary: number;
    currency: string;
    payFrequency: string; // might want to ENUM
    bankAccountNumber: string;
    employee: EmployeeBasicResponse; // Like the id? I dunno now
}