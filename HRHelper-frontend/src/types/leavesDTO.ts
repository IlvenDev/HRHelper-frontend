import type { EmployeeDetailResponse } from "./profilesDTO";

export interface LeaveResponse {
    id: number;
    date: Date;
    leaveType: string; // might enum
    leaveStatus: string; // might enum
    employee: EmployeeDetailResponse
}

export interface LeaveRequest {
    date: Date;
    leaveType: string;
    employeeId: number;
}