// import axios from "axios";

// const api = axios.create({
//     baseURL: 'http://localhost:8888/api/v1/'
// });

// // api.interceptors.request.use((config) => {
// //     const token = localStorage.getItem("token");
  
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
  
// //     return config;
// //   });

// export default api;

import axios from "axios";
import qs from "qs";

const api = axios.create({
  baseURL: "http://localhost:8888/api/v1/",
  paramsSerializer: params =>
    qs.stringify(params, { arrayFormat: "repeat" }),
  // arrayFormat: 'repeat' → holidays=2025-06-01&holidays=2025-06-15
});

export default api;