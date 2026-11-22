import React, { useState, useEffect } from 'react';
import { PitchSlot, ServiceItem, Booking } from '../../types';
import axiosClient from '../../api/axiosClient';
import { Calendar, Clock, ShieldCheck, ShoppingCart, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ClientBookingView: React.FC = () => {
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

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [slotsData, servicesData] = await Promise.all([
        axiosClient.get<any, PitchSlot[]>('/pitch-slots'),
        axiosClient.get<any, ServiceItem[]>('/services'),
      ]);
      setSlots(slotsData);
      setServices(servicesData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải dữ liệu từ máy chủ Backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (!selectedSlot) return;

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
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đặt sân thất bại');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cổng Đặt Sân Trực Tuyến</h1>
          <p className="text-sm text-gray-500 mt-1">Dành cho khách hàng đặt sân và dịch vụ đi kèm</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {createdBooking && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Đặt sân thành công! Mã đơn: {createdBooking.bookingCode}</div>
              <div className="text-xs text-emerald-700 mt-0.5">Vui lòng thanh toán cọc trong vòng 15 phút.</div>
            </div>
          </div>
          <button 
            onClick={() => setCreatedBooking(null)} 
            className="text-xs font-semibold text-emerald-700 underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Grid: Slots + Services & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Slots & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slots */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>1. Chọn ca đá trống hôm nay</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((s) => {
                const isSelected = selectedSlot?.id === s.id;
                const isAvailable = s.status === 'AVAILABLE';

                return (
                  <button
                    key={s.id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(s)}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500'
                        : isAvailable
                        ? 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{s.pitchName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-700 mt-3">
                      {s.price.toLocaleString('vi-VN')} đ
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span>2. Chọn thêm dịch vụ tiện ích</span>
            </h2>

            <div className="space-y-3">
              {services.map((item) => {
                const qty = selectedServices[item.id] || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                      <div className="text-xs text-emerald-700 font-medium">
                        {item.price.toLocaleString('vi-VN')} đ / {item.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleServiceChange(item.id, qty - 1)}
                        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-gray-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleServiceChange(item.id, qty + 1)}
                        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Booking Form */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs sticky top-20">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>3. Thông tin đặt sân</span>
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên của bạn *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Khách"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Yêu cầu về bóng, áo bib..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tiền sân:</span>
                  <span className="font-medium text-gray-900">{pitchPrice.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền dịch vụ:</span>
                  <span className="font-medium text-gray-900">{serviceTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Tổng cộng:</span>
                  <span className="text-emerald-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">
                  <span>Tiền cọc giữ chỗ (30%):</span>
                  <span className="font-bold">{depositAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSlot || bookingLoading}
                className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-xs ${
                  selectedSlot && !bookingLoading
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {bookingLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Sân'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
