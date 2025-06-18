import api from "../api/axios";

// PROFILES
export const fetchTotalEmployees = async (): Promise<number> => {
  const res = await api.get("/profiles/count");
  return res.data;
};

export const fetchNewEmployees = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/profiles/count/new", { params: { year, month } });
  return res.data;
};

// LEAVES
export const fetchLeavesCount = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/leaves/count", { params: { year, month } });
  return res.data;
};

export const fetchLeaveDistribution = async (
  year: number,
  month: number
): Promise<{ [key: string]: number }> => {
  const res = await api.get("/leaves/distribution", {
    params: { year, month },
  });
  return res.data;
};

// ATTENDANCE
export const fetchTotalHoursWorked = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/attendance/hours", { params: { year, month } });
  return res.data;
};

// COSTS
export const fetchCostTotal = async (
  year: number,
  month: number
): Promise<number> => {
  const res = await api.get("/costs/total", { params: { year, month } });
  return res.data;
};

export const fetchCostDistribution = async (
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

// export const fetchDepartments = async (): Promise<DepartmentSummary[]> => {
//   const res = await api.get("/departments/summary");
//   return res.data;
// };
