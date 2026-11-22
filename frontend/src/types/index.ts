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
  timeSlotId: number;
  startTime?: string;
  endTime?: string;
  slotDate: string;
  dateslot?: string;
  price: number;
  status: 'AVAILABLE' | 'HOLDING' | 'BOOKED' | 'MAINTENANCE' | 'CLOSED';
  holdExpiresAt?: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  category: 'DRINK' | 'EQUIPMENT' | 'REFEREE';
  isActive: boolean;
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
  customerId?: number;
  guestName?: string;
  guestPhone?: string;
  totalPitchAmount: number;
  totalServiceAmount: number;
  totalAmount: number;
  depositAmount: number;
  bookingType?: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerNote?: string;
  createdAt?: string;
}
