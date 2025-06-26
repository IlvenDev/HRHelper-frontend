import type { EmployeeBasicResponse, EmployeeDetailResponse } from "./profilesDTO";

export interface AttendanceTimeResponse {
    id: number;
    startTime: string;
    endTime?: string;
    breakTaken: boolean;
    date: Date;
    employee: EmployeeBasicResponse;
}

export interface AttendanceTimeRequest {
    startTime: string;
    endTime?: string;
    date: string;
    employeeId: number;
}

export interface AttendanceEditRequest {
    startTime: string;
    endTime?: string;
    date: Date;
    breakTaken: boolean;
}
