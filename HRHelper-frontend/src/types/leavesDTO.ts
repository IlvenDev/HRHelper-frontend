import type { EmployeeBasicResponse, EmployeeDetailResponse } from "./profilesDTO";

export interface LeaveResponse {
    id: number,
    dataStart: Date;
    dataKoniec: Date;
    rodzaj: string;
    status: string;
    złożono: Date;
    employee: EmployeeBasicResponse;
}

export interface LeaveRequest {
    dataStart: Date;
    dataKoniec: Date;
    rodzaj: string;
    employeeId: number;
}