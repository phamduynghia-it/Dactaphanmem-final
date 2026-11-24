import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { PitchSlot, PitchResponse, TimeSlotResponse } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { 
  RefreshCw, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Info,
  X,
  Clock
} from 'lucide-react';

export const PitchSlotsView: React.FC = () => {
  const [pitches, setPitches] = useState<PitchResponse[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([]);
  const [slots, setSlots] = useState<PitchSlot[]>([]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected slot for Quick Details modal
  const [inspectSlot, setInspectSlot] = useState<{
    slot?: PitchSlot;
    pitch: PitchResponse;
    timeSlot: TimeSlotResponse;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Change date by +/- N days
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const loadData = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const [pitchesRes, timeSlotsRes, slotsRes] = await Promise.all([
        adminApi.getPitches(),
        adminApi.getTimeSlots(),
        adminApi.getPitchSlots(dateStr),
      ]);

      if (Array.isArray(pitchesRes)) setPitches(pitchesRes);
      if (Array.isArray(timeSlotsRes)) {
        // Sort time slots by start_time
        const sorted = [...timeSlotsRes].sort((a, b) => 
          String(a.startTime).localeCompare(String(b.startTime))
        );
        setTimeSlots(sorted);
      }
      if (Array.isArray(slotsRes)) setSlots(slotsRes);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu ca đá và sân bóng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleGenerateSlots = async () => {
    if (!window.confirm('Hệ thống sẽ tự động sinh và đồng bộ lịch ca đá cho 30 ngày tới theo bảng ma trận giá. Bạn có muốn tiếp tục?')) {
      return;
    }
    setGenerating(true);
    try {
      await adminApi.generatePitchSlots(30);
      showToast('Đã tự động sinh và cập nhật giá ca đá 30 ngày tới theo ma trận giá thành công!', 'success');
      loadData(selectedDate);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi sinh lịch ca đá', 'error');
    } finally {
      setGenerating(false);
    }
  };

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

  // Fallback unique pitches from slots if pitches list is empty
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

  // Fallback unique timeslots from slots if timeslots list is empty
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

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Ca Đá Theo Ngày</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ma trận lịch hoạt động của từng sân theo khung giờ và trạng thái đặt chỗ
          </p>
        </div>

        {/* Date Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker & Navigators */}
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
                onChange={(e) => setSelectedDate(e.target.value)}
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
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shadow-xs ${
              selectedDate === todayStr 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Hôm nay
          </button>

          {/* Làm mới */}
          <button
            onClick={() => loadData(selectedDate)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 shadow-xs transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          {/* Sinh lịch 30 ngày */}
          <button
            onClick={handleGenerateSlots}
            disabled={generating}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            title="Tự động sinh và đồng bộ toàn bộ ca đá cho 30 ngày tới theo ma trận giá"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Đang tạo...' : 'Sinh lịch 30 ngày'}</span>
          </button>
        </div>
      </div>

      {/* Legend Bar (Chú giải trạng thái) */}
      <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-white rounded-xl border border-gray-200 shadow-xs text-xs text-gray-600">
        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          Chú thích:
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
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-gray-300 bg-gray-100"></span>
          <span>Bảo trì</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MATRIX GRID TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            {/* Header row: Sân / Khung giờ + các mốc thời gian */}
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

            {/* Body rows: Mỗi sân là một hàng */}
            <tbody className="divide-y divide-gray-100">
              {displayPitches.length === 0 ? (
                <tr>
                  <td colSpan={displayTimeSlots.length + 1} className="py-12 text-center text-gray-400">
                    Chưa có dữ liệu sân bóng hoặc ca đá nào. Hãy bấm "Sinh lịch 30 ngày" để khởi tạo.
                  </td>
                </tr>
              ) : (
                displayPitches.map((pitch) => {
                  const isMaintenance = pitch.status === 'MAINTENANCE';

                  return (
                    <tr key={pitch.id} className="hover:bg-gray-50/30 transition-colors">
                      {/* Cột Tên sân cố định bên trái (Sticky) */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-3.5 border-r border-gray-200 shadow-xs">
                        <div className="font-bold text-gray-900 text-sm">{pitch.name}</div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">
                          {pitch.pitchTypeName || (pitch.name.includes('7') ? 'Sân 7 người' : 'Sân 5 người')}
                        </div>
                      </td>

                      {/* Các ô ca đá theo từng khung giờ */}
                      {displayTimeSlots.map((ts) => {
                        const slot = slots.find(
                          (s) => s.pitchId === pitch.id && s.timeSlotId === ts.id
                        );

                        // Trường hợp sân đang bảo trì
                        if (isMaintenance) {
                          return (
                            <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                              <div className="h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium">
                                Bảo trì
                              </div>
                            </td>
                          );
                        }

                        // Trường hợp chưa sinh ca đá cho ô này
                        if (!slot) {
                          return (
                            <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                              <div className="h-16 rounded-xl bg-gray-50/60 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                Chưa mở
                              </div>
                            </td>
                          );
                        }

                        // Có ca đá: tính toán trạng thái
                        const isPast = isPastTime(slot.dateslot || slot.slotDate, String(ts.endTime || slot.endTime));
                        const isPeak = Boolean(slot.peakHour ?? slot.isPeakHour ?? ts.isPeakHour);
                        const priceK = formatPriceK(slot.price);

                        let cardStyle = '';
                        let priceStyle = '';
                        let statusText = '';
                        let statusStyle = '';

                        if (slot.status === 'BOOKED') {
                          cardStyle = 'border-red-300 bg-red-50/90 text-red-700';
                          priceStyle = 'text-red-700 font-bold';
                          statusText = 'Đã đặt';
                          statusStyle = 'text-red-600 font-semibold';
                        } else if (slot.status === 'HOLDING') {
                          cardStyle = 'border-orange-300 bg-orange-50/90 text-orange-800';
                          priceStyle = 'text-orange-800 font-bold';
                          statusText = 'Đang giữ chỗ';
                          statusStyle = 'text-orange-700 font-semibold';
                        } else if (isPast) {
                          cardStyle = 'border-dashed border-gray-300 bg-gray-50 text-gray-400';
                          priceStyle = 'text-gray-400 font-medium';
                          statusText = 'Đã qua';
                          statusStyle = 'text-gray-400';
                        } else if (isPeak) {
                          // Giờ vàng cao điểm
                          cardStyle = 'border-amber-400 bg-amber-50 hover:bg-amber-100/80 text-amber-900 cursor-pointer shadow-2xs';
                          priceStyle = 'text-amber-900 font-bold';
                          statusText = 'Giờ vàng';
                          statusStyle = 'text-amber-700 font-semibold';
                        } else {
                          // Giờ thường còn trống
                          cardStyle = 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 cursor-pointer shadow-2xs';
                          priceStyle = 'text-emerald-900 font-bold';
                          statusText = 'Trống';
                          statusStyle = 'text-emerald-700 font-semibold';
                        }

                        return (
                          <td key={ts.id} className="p-2 border-r border-gray-200 text-center">
                            <button
                              type="button"
                              onClick={() => setInspectSlot({ slot, pitch, timeSlot: ts })}
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

      {/* QUICK DETAIL MODAL */}
      {inspectSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-900">Chi tiết Ca đá #{inspectSlot.slot?.id || 'N/A'}</h3>
                </div>
                <button
                  onClick={() => setInspectSlot(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sân bóng:</span>
                  <span className="font-bold text-gray-900">{inspectSlot.pitch.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loại sân:</span>
                  <span className="text-gray-700">{inspectSlot.pitch.pitchTypeName || 'Sân tiêu chuẩn'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Khung giờ:</span>
                  <span className="font-semibold text-gray-800">
                    {formatTimeRange(String(inspectSlot.timeSlot.startTime), String(inspectSlot.timeSlot.endTime))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ngày đá:</span>
                  <span className="font-medium text-gray-700">{formatDate(inspectSlot.slot?.dateslot || selectedDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loại giờ:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    inspectSlot.timeSlot.isPeakHour ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {inspectSlot.timeSlot.isPeakHour ? 'Giờ vàng (Cao điểm)' : 'Giờ thường'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Giá niêm yết:</span>
                  <span className="text-base font-bold text-emerald-700">
                    {inspectSlot.slot?.price ? `${inspectSlot.slot.price.toLocaleString('vi-VN')} đ` : 'Chưa định giá'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    inspectSlot.slot?.status === 'BOOKED' ? 'bg-red-100 text-red-800' :
                    inspectSlot.slot?.status === 'HOLDING' ? 'bg-orange-100 text-orange-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {inspectSlot.slot?.status === 'BOOKED' ? 'Đã đặt' :
                     inspectSlot.slot?.status === 'HOLDING' ? 'Đang giữ chỗ' : 'Còn trống'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectSlot(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
