import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { adminApi } from '../../api/adminApi';
import { Booking, PitchResponse, PitchSlot, ServiceItem } from '../../types';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';
import { RefreshCw, Plus, Search, X, ChevronLeft, ChevronRight, Check, Banknote, Landmark, Eye, Calendar, ShoppingBag, User, Pencil, Save } from 'lucide-react';

export const BookingsView: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Modal Xem Chi Tiết & Chỉnh sửa Đơn
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestPhone, setEditGuestPhone] = useState('');
  const [editCustomerNote, setEditCustomerNote] = useState('');
  const [editServices, setEditServices] = useState<{ [serviceId: number]: number }>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // State cho Modal Tạo Đơn Tại Quầy (3 bước)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [pitches, setPitches] = useState<PitchResponse[]>([]);
  const [availableSlots, setAvailableSlots] = useState<PitchSlot[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ [serviceId: number]: number }>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedPitchId, setSelectedPitchId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'FULL'>('DEPOSIT');
  const [paymentMethodCode, setPaymentMethodCode] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [customerNote, setCustomerNote] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get<any, Booking[]>('/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewDetail = async (bookingId: number) => {
    setLoadingDetailId(bookingId);
    setIsEditingDetail(false);
    try {
      const detail = await adminApi.getBookingById(bookingId);
      setDetailBooking(detail);
    } catch {
      // axiosClient đã tự động hiển thị toast.error nếu có lỗi
    } finally {
      setLoadingDetailId(null);
    }
  };

  const canEditDetail =
    detailBooking?.status === 'CONFIRMED' || detailBooking?.status === 'CHECKED_IN';

  const startEditDetail = async () => {
    if (!detailBooking) return;
    setEditGuestName(detailBooking.guestName || detailBooking.customerName || '');
    setEditGuestPhone(detailBooking.guestPhone || '');
    setEditCustomerNote(detailBooking.customerNote || '');

    const initialServices: { [serviceId: number]: number } = {};
    if (Array.isArray(detailBooking.services)) {
      for (const srv of detailBooking.services) {
        if (srv.serviceId) {
          initialServices[srv.serviceId] = srv.quantity || 0;
        }
      }
    }
    setEditServices(initialServices);

    if (servicesList.length === 0) {
      try {
        const res = await adminApi.getServices(true);
        if (Array.isArray(res)) setServicesList(res);
      } catch {
        // ignore
      }
    }
    setIsEditingDetail(true);
  };

  const handleEditServiceQtyChange = (serviceId: number, delta: number) => {
    setEditServices((prev) => {
      const current = prev[serviceId] || 0;
      const nextQty = Math.max(0, current + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: nextQty };
    });
  };

  const editTotalServiceAmount = useMemo(() => {
    return Object.entries(editServices).reduce((sum, [idStr, qty]) => {
      const idNum = Number(idStr);
      const fromCatalog = servicesList.find((item) => item.id === idNum);
      const fromDetail = detailBooking?.services?.find((s: any) => s.serviceId === idNum);
      const unitPrice = fromCatalog?.price ?? fromDetail?.unitPrice ?? 0;
      return sum + Number(unitPrice) * qty;
    }, 0);
  }, [editServices, servicesList, detailBooking]);

  const handleSaveDetailEdit = async () => {
    if (!detailBooking) return;
    if (!editGuestName.trim()) {
      toast.warning('Tên khách hàng không được để trống!');
      return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(editGuestPhone.trim())) {
      toast.warning('Số điện thoại không đúng định dạng (10 chữ số, VD: 0987654321)');
      return;
    }

    const servicesDto = Object.entries(editServices)
      .filter(([, qty]) => qty > 0)
      .map(([serviceId, quantity]) => ({
        serviceId: Number(serviceId),
        quantity,
      }));

    setSavingEdit(true);
    try {
      const updated = await adminApi.updateBooking(detailBooking.id, {
        guestName: editGuestName.trim(),
        guestPhone: editGuestPhone.trim(),
        customerNote: editCustomerNote.trim(),
        services: servicesDto,
      });
      setDetailBooking(updated);
      setIsEditingDetail(false);
      toast.success('Cập nhật thông tin đơn và dịch vụ thành công!');
      fetchBookings();
    } catch {
      // axiosClient tự động hiển thị toast.error
    } finally {
      setSavingEdit(false);
    }
  };

  // Load danh sách sân và dịch vụ đang hoạt động khi mở modal
  useEffect(() => {
    if (!showCreateModal) return;
    adminApi.getPitches().then((res) => {
      if (Array.isArray(res)) {
        setPitches(res);
        if (res.length > 0 && selectedPitchId === '') {
          setSelectedPitchId(res[0].id);
        }
      }
    }).catch(() => { });

    adminApi.getServices(true).then((res) => {
      if (Array.isArray(res)) {
        setServicesList(res);
      }
    }).catch(() => { });
  }, [showCreateModal]);

  // Load các ca đá trống theo ngày đã chọn
  useEffect(() => {
    if (!showCreateModal || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlotId('');
    adminApi.getAvailablePitchSlots(selectedDate)
      .then((res) => {
        setAvailableSlots(Array.isArray(res) ? res : []);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [showCreateModal, selectedDate]);

  // Lọc khung giờ trống theo sân đang chọn (và chưa qua giờ kết thúc endTime)
  const filteredSlots = useMemo(() => {
    if (!selectedPitchId) return [];
    const now = new Date();
    return availableSlots
      .filter((s) => {
        if (s.pitchId !== Number(selectedPitchId) || s.status !== 'AVAILABLE') {
          return false;
        }
        const datePart = s.dateslot || s.slotDate || selectedDate;
        if (datePart && s.endTime) {
          const endDt = new Date(`${datePart}T${String(s.endTime).slice(0, 8)}`);
          if (!isNaN(endDt.getTime()) && now > endDt) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
  }, [availableSlots, selectedPitchId, selectedDate]);

  const selectedSlotObj = useMemo(
    () => filteredSlots.find((s) => s.id === Number(selectedSlotId)) || null,
    [filteredSlots, selectedSlotId]
  );

  const handleServiceQtyChange = (serviceId: number, delta: number) => {
    setSelectedServices((prev) => {
      const current = prev[serviceId] || 0;
      const nextQty = Math.max(0, current + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: nextQty };
    });
  };

  const totalServiceAmount = useMemo(() => {
    return Object.entries(selectedServices).reduce((sum, [idStr, qty]) => {
      const s = servicesList.find((item) => item.id === Number(idStr));
      return sum + (s ? s.price * qty : 0);
    }, 0);
  }, [selectedServices, servicesList]);

  const totalOrderAmount = (selectedSlotObj?.price || 0) + totalServiceAmount;
  const amountToPayNow =
    paymentType === 'FULL' ? totalOrderAmount : Math.round(totalOrderAmount * 0.3);

  // Lọc danh sách đơn theo từ khóa tìm kiếm
  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        (b.bookingCode || '').toLowerCase().includes(q) ||
        (b.guestName || '').toLowerCase().includes(q) ||
        (b.guestPhone || '').toLowerCase().includes(q)
    );
  }, [bookings, searchTerm]);

  const resetForm = () => {
    setCurrentStep(1);
    setGuestName('');
    setGuestPhone('');
    setSelectedSlotId('');
    setSelectedServices({});
    setPaymentType('DEPOSIT');
    setPaymentMethodCode('CASH');
    setCustomerNote('');
  };

  const handleNextStep1 = () => {
    if (!guestName.trim()) {
      toast.warning('Vui lòng nhập tên khách hàng!');
      return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(guestPhone.trim())) {
      toast.warning('Số điện thoại không đúng định dạng (10 chữ số, VD: 0987654321)');
      return;
    }
    if (!selectedSlotId) {
      toast.warning('Vui lòng chọn khung giờ trống!');
      return;
    }
    setCurrentStep(2);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.warning('Vui lòng chọn khung giờ trống!');
      return;
    }

    const servicesDto = Object.entries(selectedServices)
      .filter(([, qty]) => qty > 0)
      .map(([serviceId, quantity]) => ({
        serviceId: Number(serviceId),
        quantity,
      }));

    setSubmitting(true);
    try {
      const created = await adminApi.createAdminBooking({
        pitchSlotId: Number(selectedSlotId),
        guestName,
        guestPhone,
        paymentType,
        paymentMethodCode,
        customerNote: customerNote.trim() || undefined,
        services: servicesDto,
      });
      toast.success(`Tạo đơn tại quầy thành công! Mã đơn: ${created.bookingCode}`);
      setShowCreateModal(false);
      resetForm();
      fetchBookings();
    } catch {
      // axiosClient đã tự động hiển thị toast.error ở góc trên phải màn hình
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Đơn Đặt Sân</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách đơn đặt online và tại quầy trong hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-60"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn tại quầy</span>
          </button>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Số Điện Thoại</th>
                <th className="px-6 py-4">Hình Thức</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Chưa có đơn đặt sân nào trong hệ thống.
                  </td>
                </tr>
              )}
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-emerald-800">{b.bookingCode}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.guestName}</td>
                  <td className="px-6 py-4 text-gray-600">{b.guestPhone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${b.bookingType === 'DIRECT'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {b.bookingType === 'DIRECT' ? 'TẠI QUẦY' : b.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {b.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetail(b.id)}
                      disabled={loadingDetailId === b.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors disabled:opacity-60"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{loadingDetailId === b.id ? 'Đang tải...' : 'Xem chi tiết'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Đơn Tại Quầy (3 bước) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Tạo Đơn Tại Quầy</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper 3 bước */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
              {[
                { step: 1, label: 'Chọn Sân & Giờ' },
                { step: 2, label: 'Chọn Dịch Vụ' },
                { step: 3, label: 'Thanh Toán' },
              ].map((item, idx) => {
                const isDone = currentStep > item.step;
                const isActive = currentStep === item.step;
                return (
                  <React.Fragment key={item.step}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold transition-colors ${isDone
                            ? 'bg-emerald-600 text-white'
                            : isActive
                              ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : item.step}
                      </span>
                      <span
                        className={`font-semibold ${isActive || isDone ? 'text-emerald-900' : 'text-gray-400'
                          }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 rounded ${currentStep > item.step ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6">
              {/* BƯỚC 1: KHÁCH HÀNG, CHỌN SÂN & KHUNG GIỜ */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Tên khách hàng
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Nhập tên khách hàng..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="VD: 0987654321"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Chọn Sân
                      </label>
                      <select
                        value={selectedPitchId}
                        onChange={(e) => {
                          setSelectedPitchId(e.target.value ? Number(e.target.value) : '');
                          setSelectedSlotId('');
                        }}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {pitches.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.pitchTypeName ? ` (${p.pitchTypeName})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Ngày đá
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Khung giờ trống
                    </label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value ? Number(e.target.value) : '')}
                      disabled={loadingSlots}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">
                        {loadingSlots
                          ? 'Đang tải khung giờ trống...'
                          : filteredSlots.length === 0
                            ? '-- Không có khung giờ trống --'
                            : '-- Chọn khung giờ trống --'}
                      </option>
                      {filteredSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {String(slot.startTime).slice(0, 5)} - {String(slot.endTime).slice(0, 5)} ({slot.price.toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep1}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs"
                    >
                      <span>Tiếp tục: Chọn dịch vụ</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: CHỌN DỊCH VỤ ĐI KÈM */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Chọn dịch vụ đi kèm (có thể bỏ qua nếu khách không đặt thêm)</span>
                    <span className="font-semibold text-emerald-700">
                      Tiền dịch vụ: {totalServiceAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {servicesList.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      Hiện chưa có dịch vụ nào đang hoạt động.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-60 overflow-y-auto bg-gray-50/50">
                      {servicesList.map((srv) => {
                        const qty = selectedServices[srv.id] || 0;
                        return (
                          <div
                            key={srv.id}
                            className="flex items-center justify-between px-4 py-2.5 text-xs"
                          >
                            <div className="min-w-0 pr-3">
                              <div className="font-semibold text-gray-800 text-sm truncate">{srv.name}</div>
                              <div className="text-emerald-700 font-medium">
                                {srv.price.toLocaleString('vi-VN')} đ / {srv.unit}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleServiceQtyChange(srv.id, -1)}
                                disabled={qty === 0}
                                className="w-7 h-7 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 font-bold text-gray-700 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-sm text-gray-900">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleServiceQtyChange(srv.id, 1)}
                                className="w-7 h-7 rounded-lg border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-700 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                    <span>
                      Tiền sân: <strong>{(selectedSlotObj?.price || 0).toLocaleString('vi-VN')} đ</strong>
                    </span>
                    <span>
                      Tổng tạm tính:{' '}
                      <strong className="text-emerald-700 text-sm">
                        {totalOrderAmount.toLocaleString('vi-VN')} đ
                      </strong>
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs"
                    >
                      <span>Tiếp tục: Thanh toán</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: PHƯƠNG THỨC THANH TOÁN & XÁC NHẬN */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {/* Tóm tắt đơn */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-600">
                      <span>Khách hàng:</span>
                      <strong className="text-gray-900">{guestName} ({guestPhone})</strong>
                    </div>
                    {selectedSlotObj && (
                      <div className="flex justify-between text-gray-600">
                        <span>Ca đá:</span>
                        <strong className="text-gray-900">
                          {pitches.find((p) => p.id === Number(selectedPitchId))?.name} •{' '}
                          {String(selectedSlotObj.startTime).slice(0, 5)} - {String(selectedSlotObj.endTime).slice(0, 5)}
                        </strong>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 pt-1.5 border-t border-gray-200">
                      <span>Tiền sân + Dịch vụ:</span>
                      <strong className="text-gray-900">{totalOrderAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold text-sm">
                      <span>Số tiền thu ngay:</span>
                      <span>{amountToPayNow.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Hình thức thu tiền
                      </label>
                      <div className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm bg-emerald-50 text-emerald-800 font-semibold">
                        Cọc 30% (Mặc định)
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Ghi chú (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="Ghi chú thêm..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phương thức thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethodCode('CASH')}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${paymentMethodCode === 'CASH'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                          }`}
                      >
                        <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Tiền mặt</div>
                          <div className="text-[11px] text-gray-500">CASH</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethodCode('BANK_TRANSFER')}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${paymentMethodCode === 'BANK_TRANSFER'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                          }`}
                      >
                        <Landmark className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Chuyển khoản</div>
                          <div className="text-[11px] text-gray-500">BANK_TRANSFER</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                    >
                      {submitting ? 'Đang tạo đơn...' : 'Xác nhận Tạo Đơn'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết & Sửa Đơn (Ca đá & Dịch vụ đi kèm) */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditingDetail ? 'Chỉnh Sửa Đơn & Dịch Vụ' : 'Chi Tiết Đơn Đặt Sân'}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {detailBooking.bookingCode}
                </span>
              </div>
              <button
                onClick={() => {
                  setDetailBooking(null);
                  setIsEditingDetail(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-sm">
              {/* Thông tin khách hàng */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Thông tin khách hàng</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {detailBooking.status}
                  </span>
                </div>

                {isEditingDetail ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Tên khách hàng
                        </label>
                        <input
                          type="text"
                          value={editGuestName}
                          onChange={(e) => setEditGuestName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={editGuestPhone}
                          onChange={(e) => setEditGuestPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Ghi chú
                      </label>
                      <input
                        type="text"
                        value={editCustomerNote}
                        onChange={(e) => setEditCustomerNote(e.target.value)}
                        placeholder="Nhập ghi chú..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-gray-500">Khách hàng:</span>{' '}
                        <strong className="text-gray-900">{detailBooking.guestName || detailBooking.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Số điện thoại:</span>{' '}
                        <strong className="text-gray-900">{detailBooking.guestPhone}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Hình thức:</span>{' '}
                        <strong className="text-gray-900">
                          {detailBooking.bookingType === 'DIRECT' ? 'Tại quầy' : detailBooking.bookingType}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>{' '}
                        <strong className="text-emerald-700">{detailBooking.status}</strong>
                      </div>
                    </div>
                    {detailBooking.customerNote && (
                      <div className="text-xs text-gray-600 pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Ghi chú:</span> {detailBooking.customerNote}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Thông tin Ca Đá */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Thông tin ca đá</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-gray-600">Sân bóng:</span>{' '}
                    <strong className="text-gray-900">{detailBooking.pitchName || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày đá:</span>{' '}
                    <strong className="text-gray-900">
                      {detailBooking.dateslot ? formatDate(detailBooking.dateslot) : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Khung giờ:</span>{' '}
                    <strong className="text-gray-900">
                      {detailBooking.startTime && detailBooking.endTime
                        ? `${String(detailBooking.startTime).slice(0, 5)} - ${String(detailBooking.endTime).slice(0, 5)}`
                        : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền sân:</span>{' '}
                    <strong className="text-emerald-700">
                      {(detailBooking.totalPitchAmount || 0).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>
              </div>

              {/* Thông tin Dịch vụ đi kèm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Dịch vụ đi kèm</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    Tổng dịch vụ:{' '}
                    {(isEditingDetail
                      ? editTotalServiceAmount
                      : detailBooking.totalServiceAmount || 0
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>

                {isEditingDetail ? (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-52 overflow-y-auto bg-gray-50/50">
                    {servicesList.map((srv) => {
                      const qty = editServices[srv.id] || 0;
                      return (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-gray-800 truncate">{srv.name}</div>
                            <div className="text-emerald-700 font-medium">
                              {srv.price.toLocaleString('vi-VN')} đ / {srv.unit}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditServiceQtyChange(srv.id, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 font-bold text-gray-700 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-gray-900">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleEditServiceQtyChange(srv.id, 1)}
                              className="w-7 h-7 rounded-lg border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-700 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !detailBooking.services || detailBooking.services.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    Đơn này không có dịch vụ đi kèm.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-3.5 py-2.5">Tên dịch vụ</th>
                          <th className="px-3.5 py-2.5 text-center">SL</th>
                          <th className="px-3.5 py-2.5 text-right">Đơn giá</th>
                          <th className="px-3.5 py-2.5 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailBooking.services.map((srv: any, idx: number) => (
                          <tr key={srv.id || idx}>
                            <td className="px-3.5 py-2.5 font-medium text-gray-900">
                              {srv.serviceName}
                              {srv.unit ? <span className="text-gray-400"> ({srv.unit})</span> : null}
                            </td>
                            <td className="px-3.5 py-2.5 text-center font-semibold">{srv.quantity}</td>
                            <td className="px-3.5 py-2.5 text-right text-gray-600">
                              {Number(srv.unitPrice || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-bold text-gray-900">
                              {Number(srv.totalPrice || 0).toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tổng cộng */}
              <div className="p-3.5 bg-gray-900 text-white rounded-xl flex items-center justify-between text-xs">
                <span>
                  Đã cọc / thu: <strong>{(detailBooking.depositAmount || 0).toLocaleString('vi-VN')} đ</strong>
                </span>
                <span className="text-sm">
                  Tổng tiền đơn:{' '}
                  <strong className="text-emerald-400">
                    {(isEditingDetail
                      ? (detailBooking.totalPitchAmount || 0) + editTotalServiceAmount
                      : detailBooking.totalAmount || 0
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </strong>
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0">
              {isEditingDetail ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingDetail(false)}
                    disabled={savingEdit}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
                  >
                    Hủy sửa
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDetailEdit}
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </>
              ) : (
                <>
                  {canEditDetail ? (
                    <button
                      type="button"
                      onClick={startEditDetail}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Chỉnh sửa đơn & dịch vụ</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Chỉ được sửa khi đơn ở trạng thái CONFIRMED hoặc CHECKED_IN
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setDetailBooking(null);
                      setIsEditingDetail(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
                  >
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
