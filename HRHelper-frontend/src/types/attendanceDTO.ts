import type { EmployeeDetailResponse } from "./profilesDTO";

export interface AttendanceTimeResponse {
    id: number;
    startTime: string;
    endTime?: string;
    date: Date;
    employee: EmployeeDetailResponse;
}

export interface AttendanceTimeRequest {
    startTime: string;
    endTime?: string;
    date: Date;
    employee: EmployeeDetailResponse;
}

