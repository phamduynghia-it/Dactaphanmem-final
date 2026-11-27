import React, { useState, useEffect } from 'react';
import { PitchSlot, ServiceItem, Booking, PitchResponse, TimeSlotResponse } from '../../types';
import axiosClient from '../../api/axiosClient';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/dateUtils';
import { toast } from '../../utils/toast';
import {
  Calendar,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  QrCode,
  X,
  Copy,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ClientBookingView: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [pitches, setPitches] = useState<PitchResponse[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([]);
  const [slots, setSlots] = useState<PitchSlot[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [selectedSlot, setSelectedSlot] = useState<PitchSlot | null>(null);
  const [selectedServices, setSelectedServices] = useState<{ [key: number]: number }>({});

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Modal mô phỏng thanh toán VNPay
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [pendingServicesDto, setPendingServicesDto] = useState<{ serviceId: number; quantity: number }[]>([]);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // Popup thông báo kết quả & xác nhận
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<Booking | null>(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
    setSelectedSlot(null); // Reset selection on date change
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pitchesRes, timeSlotsRes, slotsRes, servicesRes] = await Promise.all([
        adminApi.getPitches(),
        adminApi.getTimeSlots(),
        axiosClient.get<any, PitchSlot[]>('/pitch-slots', { params: { date: selectedDate } }),
        adminApi.getServices(true), // Only active services
      ]);

      if (Array.isArray(pitchesRes)) setPitches(pitchesRes);
      if (Array.isArray(timeSlotsRes)) {
        const sorted = [...timeSlotsRes].sort((a, b) =>
          String(a.startTime).localeCompare(String(b.startTime))
        );
        setTimeSlots(sorted);
      }
      if (Array.isArray(slotsRes)) setSlots(slotsRes);
      if (Array.isArray(servicesRes)) setServices(servicesRes);
    } catch (err: any) {
      console.error('Không thể tải dữ liệu từ máy chủ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Format time range: "06:00:00" -> "06:00 - 07:30"
  const formatTimeRange = (start?: string, end?: string) => {
    if (!start || !end) return '';
    return `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
  };

  // Format price: 200000 -> "200k"
  const formatPriceK = (price?: number) => {
    if (price === undefined || price === null) return '';
    if (price >= 1000) {
      return `${price / 1000}k`;
    }
    return `${price} đ`;
  };

  // Check if slot time has passed
  const isPastTime = (slotDate?: string, endTime?: string) => {
    if (!slotDate || !endTime) return false;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (slotDate < today) return true;
    if (slotDate > today) return false;

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const [endH, endM] = endTime.split(':').map(Number);
    if (endH < currentHours || (endH === currentHours && endM <= currentMinutes)) {
      return true;
    }
    return false;
  };

  // Fallback unique pitches from slots
  const displayPitches: PitchResponse[] = pitches.length > 0 ? pitches : (() => {
    const map = new Map<number, PitchResponse>();
    slots.forEach(s => {
      if (s.pitchId && !map.has(s.pitchId)) {
        map.set(s.pitchId, {
          id: s.pitchId,
          name: s.pitchName || `Sân #${s.pitchId}`,
          pitchTypeName: s.pitchTypeName || 'Sân bóng mini',
          status: 'ACTIVE',
        } as any);
      }
    });
    return Array.from(map.values());
  })();

  // Fallback unique timeslots from slots
  const displayTimeSlots: TimeSlotResponse[] = timeSlots.length > 0 ? timeSlots : (() => {
    const map = new Map<number, TimeSlotResponse>();
    slots.forEach(s => {
      if (s.timeSlotId && !map.has(s.timeSlotId)) {
        map.set(s.timeSlotId, {
          id: s.timeSlotId,
          startTime: (s.startTime || '00:00') as any,
          endTime: (s.endTime || '00:00') as any,
          isPeakHour: Boolean(s.peakHour ?? s.isPeakHour),
          isActive: true,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      String(a.startTime).localeCompare(String(b.startTime))
    );
  })();

  const pitchPrice = selectedSlot ? selectedSlot.price : 0;
  const serviceTotal = Object.entries(selectedServices).reduce((sum, [serviceId, qty]) => {
    const s = services.find((item) => item.id === Number(serviceId));
    return sum + (s ? s.price * qty : 0);
  }, 0);
  const totalAmount = pitchPrice + serviceTotal;
  const depositAmount = totalAmount * 0.3;

  const handleServiceChange = (serviceId: number, qty: number) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[serviceId];
      } else {
        next[serviceId] = qty;
      }
      return next;
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.warning('Vui lòng chọn một ca đá còn trống trên ma trận lịch!');
      return;
    }
    if (!guestName.trim()) {
      toast.warning('Vui lòng nhập họ tên người đặt sân!');
      return;
    }
    if (!guestPhone.trim()) {
      toast.warning('Vui lòng nhập số điện thoại người đặt sân!');
      return;
    }

    setBookingLoading(true);

    const servicesDto = Object.entries(selectedServices)
      .filter(([_, qty]) => qty > 0)
      .map(([serviceId, quantity]) => ({
        serviceId: Number(serviceId),
        quantity,
      }));

    const payload = {
      pitchSlotId: selectedSlot.id,
      guestName,
      guestPhone,
      customerNote,
      bookingType: 'ONLINE',
      services: servicesDto,
    };

    try {
      // 1. Tạo đơn chờ cọc trong DB (bảng booking_services chưa insert)
      const res = await axiosClient.post<any, Booking>('/bookings', payload);
      setPendingBooking(res);
      setPendingServicesDto(servicesDto);
      setShowVNPayModal(true); // Bật popup mô phỏng VNPay
      fetchData(); // Cập nhật lại ma trận ca đá (chuyển sang HOLDING)
    } catch (err: any) {
      console.error('Đặt sân thất bại:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleConfirmDeposit = async () => {
    if (!pendingBooking) return;
    setConfirmingPayment(true);
    try {
      // 2. Gọi API xác nhận thanh toán cọc thành công, truyền DTO dịch vụ để chính thức insert vào DB
      const res = await adminApi.confirmBookingPayment(pendingBooking.id, {
        services: pendingServicesDto,
      });

      setShowVNPayModal(false);
      setConfirmedBookingData(res);
      setShowSuccessModal(true); // Bật popup thông báo thành công

      setPendingBooking(null);
      setPendingServicesDto([]);
      setSelectedSlot(null);
      setSelectedServices({});
      setGuestName('');
      setGuestPhone('');
      setCustomerNote('');
      fetchData(); // Cập nhật lại ma trận ca đá (chuyển sang BOOKED)
      toast.success(`Đơn #${res.bookingCode} đã xác nhận đặt cọc thành công!`);
    } catch (err: any) {
      console.error('Xác nhận thanh toán cọc thất bại:', err);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleRequestCancelVNPay = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancelVNPay = async () => {
    if (pendingBooking) {
      try {
        await adminApi.cancelBookingPayment(pendingBooking.id);
        toast.info(`Đã hủy giao dịch cho đơn #${pendingBooking.bookingCode}. Ca đá đã được mở lại.`);
      } catch (err) {
        console.error('Lỗi khi hủy giao dịch thanh toán:', err);
      }
    }
    setShowCancelConfirmModal(false);
    setShowVNPayModal(false);
    setShowCancelSuccessModal(true); // Mở popup thông báo đã hủy
    setPendingBooking(null);
    setPendingServicesDto([]);
    setSelectedSlot(null);
    setSelectedServices({});
    fetchData(); // Ca đá được nhả về trống (AVAILABLE) trên ma trận
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cổng Đặt Sân Trực Tuyến</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chọn ngày, chọn sân theo ma trận giờ và đặt kèm các dịch vụ tiện ích</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors border-r border-gray-200"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="bg-transparent font-semibold text-gray-800 text-sm focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors border-l border-gray-200"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setSelectedSlot(null);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shadow-xs ${selectedDate === todayStr
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
          >
            Hôm nay
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors shadow-xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend Bar (Chú giải trạng thái) */}
      <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-white rounded-xl border border-gray-200 shadow-xs text-xs text-gray-600">
        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          Quy ước:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-emerald-400 bg-emerald-50"></span>
          <span>Trống (Giờ thường)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-50"></span>
          <span>Giờ vàng (Cao điểm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-red-400 bg-red-50"></span>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-orange-400 bg-orange-50"></span>
          <span>Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-dashed border-gray-400 bg-gray-50"></span>
          <span>Đã qua giờ</span>
        </div>
      </div>

      {/* SECTION 1: MATRIX GRID TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="font-bold text-gray-800 text-sm">Chọn ca đá còn trống theo ma trận sân (Ngày: {formatDate(selectedDate)})</h2>
          </div>
          {selectedSlot && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Đang chọn: {selectedSlot.pitchName} ({formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)})</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-700">
                <th className="sticky left-0 z-20 bg-gray-50 px-4 py-4 min-w-[160px] font-bold text-gray-900 border-r border-gray-200 shadow-xs">
                  Sân / Khung giờ
                </th>
                {displayTimeSlots.map((ts) => (
                  <th
                    key={ts.id}
                    className="px-3 py-4 text-center font-bold text-gray-800 border-r border-gray-200 whitespace-nowrap min-w-[130px] tracking-tight"
                  >
                    {formatTimeRange(String(ts.startTime), String(ts.endTime))}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayPitches.length === 0 ? (
                <tr>
                  <td colSpan={displayTimeSlots.length + 1} className="py-12 text-center text-gray-400">
                    Chưa có ca đá nào trong ngày này. Vui lòng chọn ngày khác.
                  </td>
                </tr>
              ) : (
                displayPitches.map((pitch) => {
                  const isMaintenance = pitch.status === 'MAINTENANCE';

                  return (
                    <tr key={pitch.id} className="hover:bg-gray-50/30 transition-colors">
                      {/* Cột Tên sân cố định (Sticky) */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-3.5 border-r border-gray-200 shadow-xs">
                        <div className="font-bold text-gray-900 text-sm">{pitch.name}</div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">
                          {pitch.pitchTypeName || (pitch.name.includes('7') ? 'Sân 7 người' : 'Sân 5 người')}
                        </div>
                      </td>

                      {/* Các ô ca đá */}
                      {displayTimeSlots.map((ts) => {
                        const slot = slots.find(
                          (s) => s.pitchId === pitch.id && s.timeSlotId === ts.id
                        );

                        if (isMaintenance) {
                          return (
                            <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                              <div className="h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium">
                                Bảo trì
                              </div>
                            </td>
                          );
                        }

                        if (!slot) {
                          return (
                            <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                              <div className="h-16 rounded-xl bg-gray-50/60 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                Chưa mở
                              </div>
                            </td>
                          );
                        }

                        const isPast = isPastTime(slot.dateslot || slot.slotDate, String(ts.endTime || slot.endTime));
                        const isPeak = Boolean(slot.peakHour ?? slot.isPeakHour ?? ts.isPeakHour);
                        const priceK = formatPriceK(slot.price);
                        const isSelected = selectedSlot?.id === slot.id;
                        const isAvailable = slot.status === 'AVAILABLE' && !isPast;

                        let cardStyle = '';
                        let priceStyle = '';
                        let statusText = '';
                        let statusStyle = '';

                        if (isSelected) {
                          cardStyle = 'border-emerald-600 bg-emerald-700 text-white shadow-md ring-2 ring-emerald-600 transform scale-102';
                          priceStyle = 'text-white font-black text-sm';
                          statusText = 'Đang chọn ✓';
                          statusStyle = 'text-emerald-100 font-bold';
                        } else if (slot.status === 'BOOKED') {
                          cardStyle = 'border-red-300 bg-red-50/90 text-red-700 cursor-not-allowed opacity-85';
                          priceStyle = 'text-red-700 font-bold';
                          statusText = 'Đã đặt';
                          statusStyle = 'text-red-600 font-semibold';
                        } else if (slot.status === 'HOLDING') {
                          cardStyle = 'border-orange-300 bg-orange-50/90 text-orange-800 cursor-not-allowed opacity-85';
                          priceStyle = 'text-orange-800 font-bold';
                          statusText = 'Đang giữ chỗ';
                          statusStyle = 'text-orange-700 font-semibold';
                        } else if (isPast) {
                          cardStyle = 'border-dashed border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed';
                          priceStyle = 'text-gray-400 font-medium';
                          statusText = 'Đã qua';
                          statusStyle = 'text-gray-400';
                        } else if (isPeak) {
                          cardStyle = 'border-amber-400 bg-amber-50 hover:bg-amber-100/90 text-amber-900 cursor-pointer shadow-2xs hover:scale-102';
                          priceStyle = 'text-amber-900 font-bold';
                          statusText = 'Giờ vàng';
                          statusStyle = 'text-amber-700 font-semibold';
                        } else {
                          cardStyle = 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 cursor-pointer shadow-2xs hover:scale-102';
                          priceStyle = 'text-emerald-900 font-bold';
                          statusText = 'Trống';
                          statusStyle = 'text-emerald-700 font-semibold';
                        }

                        return (
                          <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${cardStyle}`}
                            >
                              <span className={`text-sm ${priceStyle}`}>{priceK}</span>
                              <span className={`text-[11px] mt-0.5 ${statusStyle}`}>{statusText}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2 & 3: SERVICES & CHECKOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Services (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>Dịch vụ tiện ích kèm theo (Tùy chọn)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((item) => {
              const qty = selectedServices[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${qty > 0 ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                >
                  <div className="pr-2">
                    <div className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</div>
                    <div className="text-xs text-emerald-700 font-bold mt-1">
                      {item.price.toLocaleString('vi-VN')} đ / {item.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-white border border-gray-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleServiceChange(item.id, qty - 1)}
                      className="w-7 h-7 rounded text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-gray-900">{qty}</span>
                    <button
                      type="button"
                      onClick={() => handleServiceChange(item.id, qty + 1)}
                      className="w-7 h-7 rounded text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Booking Form & Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-20">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Thông tin đặt sân</span>
            </h2>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên của bạn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Khách"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ghi chú cho sân (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Yêu cầu riêng về bóng, trang phục hoặc chuẩn bị nước lạnh..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Chi tiết chi phí */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-sm bg-gray-50/70 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Ca đá đã chọn:</span>
                <span className="font-bold text-gray-800">
                  {selectedSlot
                    ? `${selectedSlot.pitchName} (${formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)})`
                    : 'Chưa chọn'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Tiền sân:</span>
                <span className="font-semibold text-gray-800">{pitchPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Tiền dịch vụ kèm:</span>
                <span className="font-semibold text-gray-800">{serviceTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                <span>Tổng chi phí:</span>
                <span className="text-base text-emerald-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span>Tiền cọc giữ sân (30%):</span>
                <span>{depositAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {bookingLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{selectedSlot ? 'Tiến Hành Đặt Sân & Đặt Cọc' : 'Vui lòng chọn ca đá ở bước 1'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MODAL MÔ PHỎNG CỔNG THANH TOÁN VNPAY SANDBOX ĐẸP MẮT  */}
      {/* ======================================================== */}
      {showVNPayModal && pendingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 flex flex-col my-auto animate-in zoom-in-95">
            {/* Header VNPay */}
            <div className="bg-gradient-to-r from-[#005baa] via-[#004b8d] to-[#00386b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center shadow-xs">
                  <span className="text-[#005baa] font-black text-lg tracking-tighter">VN</span>
                  <span className="text-[#ed1c24] font-black text-lg tracking-tighter">PAY</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">Cổng Thanh Toán Trực Tuyến</span>
                    <span className="bg-amber-400 text-amber-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                      SANDBOX DEMO
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Hệ thống tạm giữ sân trong 15 phút để bạn thanh toán cọc</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestCancelVNPay}
                className="p-2 rounded-full text-blue-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Đóng / Hủy giao dịch"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - 2 Cột trên màn hình Desktop, không bị cuộn */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4.5 bg-gray-50/50">
              {/* CỘT TRÁI: Thông tin thanh toán & Tài khoản nhận */}
              <div className="md:col-span-7 space-y-3.5">
                {/* Box Số tiền cọc cần chuyển */}
                <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
                  <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Số tiền cọc cần thanh toán (30%)</span>
                    <span className="text-[#005baa] bg-blue-100/70 px-2 py-0.5 rounded text-[11px] font-bold">
                      Cọc giữ sân
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#005baa] tracking-tight">
                      {(pendingBooking.depositAmount || depositAmount).toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(pendingBooking.depositAmount || depositAmount), 'amount')}
                      className="text-xs text-blue-700 hover:text-blue-800 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-2xs flex items-center gap-1 font-medium transition-all cursor-pointer"
                      title="Sao chép số tiền"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-100 text-xs text-blue-800 flex justify-between font-medium">
                    <span>Tổng chi phí đơn đặt:</span>
                    <span className="font-bold text-gray-900">
                      {(pendingBooking.totalAmount || totalAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Thông tin đơn đặt sân */}
                <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2 text-xs shadow-2xs">
                  <div className="font-bold text-gray-900 pb-1 border-b border-gray-100 flex items-center justify-between">
                    <span>Chi tiết đặt sân</span>
                    <span className="font-mono text-gray-600">#{pendingBooking.bookingCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Sân bóng:</span>
                    <strong className="text-gray-900">{pendingBooking.pitchName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Khung giờ:</span>
                    <strong className="text-gray-900">
                      {formatTimeRange(pendingBooking.startTime, pendingBooking.endTime)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Ngày đá:</span>
                    <strong className="text-gray-900">
                      {formatDate(pendingBooking.dateslot || selectedDate)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Người đặt:</span>
                    <span className="font-semibold text-gray-800">{guestName || pendingBooking.guestName}</span>
                  </div>
                </div>

                {/* Tài khoản ngân hàng nhận tiền */}
                <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2 text-xs shadow-2xs">
                  <div className="font-bold text-gray-900 flex items-center justify-between pb-1 border-b border-gray-100">
                    <span>Tài khoản ngân hàng nhận cọc</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Khớp lệnh tự động
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Ngân hàng:</span>
                    <strong className="text-gray-800">MB Bank (Ngân hàng Quân Đội)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="font-mono text-sm text-gray-900">0901234567</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('0901234567', 'stk')}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Chủ tài khoản:</span>
                    <strong className="text-gray-800">HE THONG SAN BONG FPMS</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Nội dung CK:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="font-mono text-sm text-[#005baa]">FPMS {pendingBooking.bookingCode}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(`FPMS ${pendingBooking.bookingCode}`, 'memo')}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Sao chép nội dung chuyển khoản"
                      >
                        {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: Khung VietQR Demo & Dịch vụ */}
              <div className="md:col-span-5 space-y-3.5 flex flex-col justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs text-center space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900">
                      <QrCode className="w-4 h-4 text-[#005baa]" />
                      <span>Quét mã VietQR / VNPay</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Mở ứng dụng Ngân hàng để quét mã</p>
                  </div>

                  <div className="relative inline-block p-2.5 bg-gradient-to-b from-blue-50/50 to-white border-2 border-blue-100 rounded-2xl shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=2|99|0901234567|HE%20THONG%20SAN%20BONG%20FPMS|admin@fpms.com|0|0|${pendingBooking.depositAmount || depositAmount}|FPMS%20${pendingBooking.bookingCode}|transfer_myqr`}
                      alt="VietQR Mockup"
                      className="w-36 h-36 object-contain rounded-lg mx-auto"
                    />
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#005baa] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs tracking-wider">
                      VietQR PRO
                    </div>
                  </div>
                </div>

                {/* Danh sách dịch vụ đặt kèm */}
                {pendingServicesDto.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 shadow-2xs">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-950">
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                      <span>Dịch vụ đặt kèm ({pendingServicesDto.length} loại):</span>
                    </div>
                    <ul className="divide-y divide-amber-200/60 text-amber-900 text-xs">
                      {pendingServicesDto.map((s) => {
                        const item = services.find((sv) => sv.id === s.serviceId);
                        return (
                          <li key={s.serviceId} className="py-1 flex justify-between">
                            <span>{item ? item.name : `Dịch vụ #${s.serviceId}`}</span>
                            <span className="font-bold">x {s.quantity}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmDeposit}
                disabled={confirmingPayment}
                className="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-50 cursor-pointer"
              >
                {confirmingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang ghi nhận cọc vào hệ thống...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>Xác Nhận Đặt Cọc Thành Công</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRequestCancelVNPay}
                disabled={confirmingPayment}
                className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm cursor-pointer"
              >
                Hủy / Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. POPUP THÔNG BÁO XÁC NHẬN ĐẶT CỌC THÀNH CÔNG           */}
      {/* ======================================================== */}
      {showSuccessModal && (confirmedBookingData || pendingBooking) && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-5 border border-gray-100 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-gray-900">Đặt Cọc Sân Thành Công!</h3>
              <p className="text-xs text-gray-500">
                Đơn đặt sân của bạn đã được xác nhận thanh toán cọc và lưu trữ thành công trên hệ thống.
              </p>
            </div>

            {(() => {
              const b = confirmedBookingData || pendingBooking;
              if (!b) return null;
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mã đơn đặt sân:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {b.bookingCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Trạng thái đơn:</span>
                    <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      ĐÃ XÁC NHẬN (CONFIRMED)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Sân bóng:</span>
                    <strong className="text-gray-800">{b.pitchName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Khung giờ:</span>
                    <strong className="text-gray-800">
                      {formatTimeRange(b.startTime, b.endTime)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Ngày thi đấu:</span>
                    <strong className="text-gray-800">
                      {formatDate(b.dateslot || selectedDate)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 font-bold text-sm">
                    <span className="text-gray-800">Tiền cọc đã nhận:</span>
                    <span className="text-emerald-700">
                      {(b.depositAmount || depositAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setConfirmedBookingData(null);
              }}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Hoàn Tất & Xem Lịch Đặt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. POPUP XÁC NHẬN HỦY GIAO DỊCH THANH TOÁN CỌC           */}
      {/* ======================================================== */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">Xác Nhận Hủy Thanh Toán?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bạn có chắc chắn muốn hủy giao dịch đặt cọc này không? Ca đá sẽ không được giữ chỗ và các dịch vụ kèm theo sẽ không được lưu.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirmModal(false)}
                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tiếp tục thanh toán
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelVNPay}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. POPUP THÔNG BÁO ĐÃ HỦY GIAO DỊCH                      */}
      {/* ======================================================== */}
      {showCancelSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-gray-50">
              <X className="w-7 h-7 text-gray-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">Đã Hủy Giao Dịch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Giao dịch thanh toán cọc đã được hủy. Ca đá đã được mở lại cho người khác và các dịch vụ chưa được ghi nhận vào hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCancelSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
