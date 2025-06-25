import api from "../api/axios";

// PROFILES
export const getTotalEmployees = async (): Promise<number> => {
  const res = await api.get("/profiles/count");
  return res.data;
};

export const getNewEmployees = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/profiles/count/new", { params: { year, month } });
  return res.data;
};

// LEAVES
export const getLeavesCount = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/leaves/count", { params: { year, month } });
  return res.data;
};

export const getLeaveDistribution = async (
  year: number,
  month: number
): Promise<{ [key: string]: number }> => {
  const res = await api.get("/leaves/distribution", {
    params: { year, month },
  });
  return res.data;
};

// ATTENDANCE
export const getTotalHoursWorked = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/attendance/hours", { params: { year, month } });
  return res.data;
};

// COSTS
export const getCostTotal = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/costs/total", { params: { year, month } });
  return res.data;
};

export const getCostDistribution = async (
  year: number,
  month: number
): Promise<{ [key: string]: number }> => {
  const res = await api.get("/costs/distribution", {
    params: { year, month },
  });
  return res.data;
};

// DEPARTMENTS
export type DepartmentSummary = {
  name: string;
  headcount: number;
  totalCost: number;
};

// export const getDepartments = async (): Promise<DepartmentSummary[]> => {
//   const res = await api.get("/departments/summary");
//   return res.data;
// };
