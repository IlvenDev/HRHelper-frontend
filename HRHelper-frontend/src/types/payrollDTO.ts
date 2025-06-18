import type { CostType, PaymentStatus } from "../enums/enums";
import type { EmployeeBasicResponse } from "./profilesDTO";

export interface PaymentResponseBasic {
    id: number;
    bankAccountNumber: string;
    amount: number;
    currency: string;
    status: string; // Might want to ENUM this
}

export interface PaymentResponseDetail extends PaymentResponseBasic {
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
    department: string;
    date: Date;
    amount: number;
    costType: CostType;
  }
  
export interface DepartmentCostsRequest {
    department: string; // Might want to ENUM
    date: Date;
    amount: number;
    costType: string; // Might want to ENUM
}

export interface PaymentRequest {
    bankAccountNumber: string;
    amount: number;
    currency: string;
    status: PaymentStatus; // Might want to ENUM this
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