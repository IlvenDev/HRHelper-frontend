export interface EmployeeBasicResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
    pesel: string;
    phone: string;
    dateOfBirth: Date;
    sex: string;
    role: string;
    dataZatrudnienia: Date;
    dataZwolnienia: Date; 
    stawka: number;
    wymiarPracy: string;
    rodzajRozliczenia: string;
    staż: number;
    dostępneDniUrlopu: number;
    wykorzystaneDniUrlopu: number;
}

export interface EmployeeDetailResponse extends EmployeeBasicResponse {
    emergencyContact?: EmergencyContactResponse;
    jobDetails: EmployeeJobDetailsResponse;
    residenceDetails: EmployeeResidenceDetailsResponse;
}

export interface EmergencyContactResponse {
    id: number;
    name: string;
    lastname: string;
    phone: string;
}

export interface EmployeeJobDetailsResponse {
    id: number;
    jobTitle: string;
    jobDescription: string;
    department: string; // Might wanna turn to ENUM later
    workLocation: string;
    employmentType: string; // Same here
    employmentDate: Date;
    terminationDate?: Date;
    directSupervisor: EmployeeBasicResponse;
}

export interface EmployeeResidenceDetailsResponse {
    id: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface EmployeeRequest {
    name: string;
    lastname: string;
    email: string;
    pesel: string;
    phone: string;
    dateOfBirth: Date;
    sex: string;
    role: string;
    username: string;
    password: string;
    dataZatrudnienia: Date;
    dataZwolnienia: Date | null; 
    stawka: number;
    wymiarPracy: string;
    rodzajRozliczenia: string;
    // staż: number;
}

export interface EmployeeLeavesUpdateRequest {
    dostępneDniUrlopu: number;
    wykorzystaneDniUrlopu: number;
}

export interface EmployeeJobDetailsRequest {
    jobTitle: string;
    jobDescription: string;
    department: string;
    workLocation: string;
    employmentType: string;
    employmentDate: Date;
    terminationDate?: Date;
    directSupervisorId?: number;
}

export interface EmployeeResidenceDetailsRequest {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface EmergencyContactRequest {
    name: string;
    lastname: string;
    phone: string;
}