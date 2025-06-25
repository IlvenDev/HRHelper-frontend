import api from "../api/axios";

export const login = async (username: string, password: string) => {
  const response = await api.post("auth/login", {
    username,
    password,
  });

  const {id, role} = response.data;
  // localStorage.setItem("username", username);

  localStorage.setItem("employeeId", id);
  localStorage.setItem("role", role);
};
