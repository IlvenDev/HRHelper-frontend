export interface EmployeeBasicResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
    pesel: string;
    phone: string;
    dateOfBirth: Date;
    sex: string;
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
    pesel: string;
    phone: string;
    email: string;
    dateOfBirth: Date;
    sex: string;
    jobDetails: EmployeeJobDetailsRequest;
    residenceDetails: EmployeeResidenceDetailsRequest;
    emergencyContact: EmergencyContactRequest;
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