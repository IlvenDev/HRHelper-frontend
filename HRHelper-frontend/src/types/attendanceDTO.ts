import type { EmployeeBasicResponse} from "./profilesDTO";

export interface AttendanceTimeResponse {
    id: number;
    startTime: string;
    endTime?: string;
    breakTaken: boolean;
    date: string;
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
