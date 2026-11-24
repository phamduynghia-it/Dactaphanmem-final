import axiosClient from './axiosClient';
import { 
  PitchSlot, 
  Booking, 
  ServiceItem, 
  UserResponse, 
  PaymentTransactionResponse, 
  PitchResponse, 
  TimeSlotResponse, 
  PriceMatrixResponse 
} from '../types';

export const adminApi = {
  // 1. Quản lý Ca Đá
  getPitchSlots: (date?: string) => 
    axiosClient.get<any, PitchSlot[]>('/pitch-slots', { params: date ? { date } : {} }),
  
  getAvailablePitchSlots: (date?: string) => 
    axiosClient.get<any, PitchSlot[]>('/pitch-slots/available', { params: date ? { date } : {} }),

  generatePitchSlots: (days = 30) =>
    axiosClient.post<any, any>(`/pitch-slots/generate?days=${days}`),

  // 2. Quản lý Đơn
  getBookings: () => 
    axiosClient.get<any, Booking[]>('/bookings'),

  getBookingById: (id: number) => 
    axiosClient.get<any, Booking>(`/bookings/${id}`),

  getBookingByCode: (code: string) => 
    axiosClient.get<any, Booking>(`/bookings/code/${code}`),

  // 3. Dịch vụ (Hỗ trợ đầy đủ CRUD)
  getServices: (activeOnly = false) => 
    axiosClient.get<any, ServiceItem[]>('/services', { params: { activeOnly } }),

  getServiceById: (id: number) => 
    axiosClient.get<any, ServiceItem>(`/services/${id}`),

  createService: (data: Partial<ServiceItem>) =>
    axiosClient.post<any, ServiceItem>('/services', data),

  updateService: (id: number, data: Partial<ServiceItem>) =>
    axiosClient.put<any, ServiceItem>(`/services/${id}`, data),

  lockService: (id: number) =>
    axiosClient.patch<any, ServiceItem>(`/services/${id}/lock`),

  toggleServiceStatus: (id: number) =>
    axiosClient.patch<any, ServiceItem>(`/services/${id}/toggle-status`),

  deleteService: (id: number) =>
    axiosClient.delete<any, void>(`/services/${id}`),

  // 4. Giao dịch
  getTransactions: () => 
    axiosClient.get<any, PaymentTransactionResponse[]>('/payment-transactions'),

  getTransactionById: (id: number) => 
    axiosClient.get<any, PaymentTransactionResponse>(`/payment-transactions/${id}`),

  getTransactionsByBookingId: (bookingId: number) => 
    axiosClient.get<any, PaymentTransactionResponse[]>(`/payment-transactions/booking/${bookingId}`),

  // 5. Người dùng
  getUsers: () => 
    axiosClient.get<any, UserResponse[]>('/users'),

  getUserById: (id: number) => 
    axiosClient.get<any, UserResponse>(`/users/${id}`),

  // 6. Quản lý Sân
  getPitches: () => 
    axiosClient.get<any, PitchResponse[]>('/pitches'),

  getPitchById: (id: number) => 
    axiosClient.get<any, PitchResponse>(`/pitches/${id}`),

  // 7. Khung giờ
  getTimeSlots: () => 
    axiosClient.get<any, TimeSlotResponse[]>('/time-slots'),

  getTimeSlotById: (id: number) => 
    axiosClient.get<any, TimeSlotResponse>(`/time-slots/${id}`),

  // 8. Bảng giá sân (Chỉ xem GET)
  getPriceMatrices: () => 
    axiosClient.get<any, PriceMatrixResponse[]>('/price-matrices'),

  getPriceMatricesByPitchType: (pitchTypeId: number) => 
    axiosClient.get<any, PriceMatrixResponse[]>(`/price-matrices/pitch-type/${pitchTypeId}`),

  // 9. Loại sân (Chỉ xem GET)
  getPitchTypes: () =>
    axiosClient.get<any, any[]>('/pitch-types'),

  // 10. Quản lý Ngày lễ (Chỉ xem GET)
  getHolidays: () =>
    axiosClient.get<any, any[]>('/holidays'),
};
