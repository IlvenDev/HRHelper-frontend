export interface EmployeeBasicResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
}

export interface EmployeeDetailResponse extends EmployeeBasicResponse {
    pesel: string;
    phone: string;
    dateOfBirth: Date;
    sex: string;
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
    pesel: string;
    phone: string;
    email: string;
    dateOfBirth: Date;
    sex: string;
}