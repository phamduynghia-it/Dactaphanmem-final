import axios from 'axios';

// Cấu hình Axios Client chuẩn hóa kết nối với Backend
const axiosClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token khi có xác thực
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động bóc tách ApiResponse chuẩn { status, success, message, data }
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu backend trả về envelope chuẩn { data: [...] }, tự động unwrap để nhận thẳng payload
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Lỗi kết nối máy chủ';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
