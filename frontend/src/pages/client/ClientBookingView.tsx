import React, { useState, useEffect } from 'react';
import { PitchSlot, ServiceItem, Booking, PitchResponse, TimeSlotResponse } from '../../types';
import axiosClient from '../../api/axiosClient';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/dateUtils';
import {
  Calendar,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Check
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
    setSelectedSlot(null); // Reset selection on date change
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
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
      setErrorMsg(err.message || 'Không thể tải dữ liệu từ máy chủ');
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
      alert('Vui lòng chọn một ca đá còn trống trên ma trận lịch!');
      return;
    }

    setBookingLoading(true);
    setErrorMsg(null);

    const payload = {
      pitchSlotId: selectedSlot.id,
      guestName,
      guestPhone,
      customerNote,
      bookingType: 'ONLINE',
      services: Object.entries(selectedServices).map(([serviceId, quantity]) => ({
        serviceId: Number(serviceId),
        quantity,
      })),
    };

    try {
      const res = await axiosClient.post<any, Booking>('/bookings', payload);
      setCreatedBooking(res);
      setSelectedSlot(null);
      setSelectedServices({});
      setGuestName('');
      setGuestPhone('');
      setCustomerNote('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đặt sân thất bại');
    } finally {
      setBookingLoading(false);
    }
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

      {/* Success Alert */}
      {createdBooking && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-base">Đặt sân thành công! Mã đơn: {createdBooking.bookingCode}</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Vui lòng thanh toán tiền cọc 30% để xác nhận đơn đặt sân của bạn.
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreatedBooking(null)}
            className="text-xs font-semibold text-emerald-700 underline px-3 py-1"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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
              <span>{selectedSlot ? 'Xác Nhận Đặt Sân Ngay' : 'Vui lòng chọn ca đá ở bước 1'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
