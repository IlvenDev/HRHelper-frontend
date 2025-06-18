export type CostType =
  | "SALARIES"
  | "TRAINING"
  | "DEVELOPMENT"
  | "RECRUITMENT"
  | "ONBOARDING"
  | "HEALTH_AND_SAFETY"
  | "OFFICE_SPACE"
  | "SUPPLIES"
  | "LEGAL"
  | "CONSULTING"
  | "OTHER";

export type Department = 
  | "IT"
  | "SALES"
  | "HR"
  | "RND";

export type PaymentStatus =
  | "UNPAID"
  | "IN_PROGRESS"
  | "PAID"

export type LeaveStatus = 
  | "PENDING"
  | "APPROVED"
  | "REJECTED"

export type LeaveType = 
  | "SICK_LEAVE"
  | "PAID_TIME_OFF"
  | "UNPAID_TIME_OFF"