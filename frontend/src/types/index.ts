export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isPeakHour: boolean;
  isActive: boolean;
}

export interface Pitch {
  id: number;
  name: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  description?: string;
}

export interface PitchSlot {
  id: number;
  pitchId: number;
  pitchName?: string;
  pitchTypeName?: string;
  timeSlotId: number;
  startTime?: string;
  endTime?: string;
  slotDate?: string;
  dateslot?: string;
  price: number;
  status: 'AVAILABLE' | 'HOLDING' | 'BOOKED' | 'MAINTENANCE' | 'CLOSED';
  isPeakHour?: boolean;
  peakHour?: boolean;
  holdExpiresAt?: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  category: 'DRINK' | 'EQUIPMENT' | 'REFEREE';
  isActive?: boolean;
  active?: boolean;
  description?: string;
}

export interface BookingCreateRequest {
  pitchSlotId: number;
  customerId?: number;
  guestName?: string;
  guestPhone?: string;
  customerNote?: string;
  services: {
    serviceId: number;
    quantity: number;
  }[];
}

export interface Booking {
  id: number;
  bookingCode: string;
  pitchSlot?: PitchSlot;
  pitchSlotId?: number;
  pitchName?: string;
  customerId?: number;
  customerName?: string;
  guestName?: string;
  guestPhone?: string;
  dateslot?: string;
  startTime?: string;
  endTime?: string;
  totalPitchAmount: number;
  totalServiceAmount: number;
  totalAmount: number;
  depositAmount: number;
  bookingType?: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerNote?: string;
  createdAt?: string;
  services?: any[];
}

export interface UserResponse {
  id: number;
  email: string;
  phoneNumber: string;
  fullName: string;
  status: string;
  roleName?: string;
}

export interface PaymentTransactionResponse {
  id: number;
  transactionCode: string;
  paymentMethodCode?: string;
  bookingCode?: string;
  amount: number;
  paymentType: string;
  status: string;
}

export interface PitchResponse {
  id: number;
  name: string;
  pitchTypeId?: number;
  pitchTypeName?: string;
  playerCapacity?: number;
  status: string;
  description?: string;
}

export interface TimeSlotResponse {
  id: number;
  startTime: string;
  endTime: string;
  isPeakHour: boolean;
  isActive: boolean;
}

export interface PriceMatrixResponse {
  id: number;
  isPeakHour?: boolean;
  peakHour?: boolean;
  pitchTypeId?: number;
  pitchTypeName?: string;
  dayType: string;
  price: number;
}

export interface PitchTypeResponse {
  id: number;
  name: string;
  playerCapacity: number;
  description?: string;
}

export interface HolidayResponse {
  id: number;
  holidayDate: string;
  holidayName: string;
  description?: string;
}
