import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sun, 
  Gift, 
  Zap, 
  Clock, 
  MapPin, 
  ChevronDown, 
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { HolidayResponse, PitchTypeResponse, PriceMatrixResponse } from '../../types';

interface MatrixRowState {
  normalPrice: number;
  peakPrice: number;
}

export const PriceMatrixView: React.FC = () => {
  // Types & State
  const [pitchTypes, setPitchTypes] = useState<PitchTypeResponse[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Price Matrix values for 3 day types
  const [weekday, setWeekday] = useState<MatrixRowState>({ normalPrice: 550000, peakPrice: 600000 });
  const [weekend, setWeekend] = useState<MatrixRowState>({ normalPrice: 200000, peakPrice: 400000 });
  const [holidayPrice, setHolidayPrice] = useState<MatrixRowState>({ normalPrice: 500000, peakPrice: 700000 });

  // Holiday list (read-only view)
  const [holidays, setHolidays] = useState<HolidayResponse[]>([]);

  // 1. Fetch Pitch Types on mount
  useEffect(() => {
    const loadPitchTypes = async () => {
      try {
        const types = await adminApi.getPitchTypes();
        if (Array.isArray(types) && types.length > 0) {
          setPitchTypes(types);
          setSelectedTypeId(types[0].id);
        } else {
          setPitchTypes([
            { id: 1, name: 'Sân 5 người', playerCapacity: 10 },
            { id: 2, name: 'Sân 7 người', playerCapacity: 14 },
          ]);
          setSelectedTypeId(1);
        }
      } catch (err) {
        console.warn('Fallback pitch types used', err);
        setPitchTypes([
          { id: 1, name: 'Sân 5 người', playerCapacity: 10 },
          { id: 2, name: 'Sân 7 người', playerCapacity: 14 },
        ]);
      }
    };
    loadPitchTypes();
  }, []);

  // 2. Fetch Price Matrices when selectedTypeId changes
  useEffect(() => {
    const loadMatrices = async () => {
      if (!selectedTypeId) return;
      try {
        const data = await adminApi.getPriceMatricesByPitchType(selectedTypeId);
        if (Array.isArray(data) && data.length > 0) {
          let w = { normalPrice: 550000, peakPrice: 600000 };
          let we = { normalPrice: 200000, peakPrice: 400000 };
          let h = { normalPrice: 500000, peakPrice: 700000 };

          data.forEach((pm: PriceMatrixResponse) => {
            const dt = (pm.dayType || '').toUpperCase();
            if (dt === 'WEEKDAY') {
              if (pm.isPeakHour) w.peakPrice = Number(pm.price);
              else w.normalPrice = Number(pm.price);
            } else if (dt === 'WEEKEND') {
              if (pm.isPeakHour) we.peakPrice = Number(pm.price);
              else we.normalPrice = Number(pm.price);
            } else if (dt === 'HOLIDAY') {
              if (pm.isPeakHour) h.peakPrice = Number(pm.price);
              else h.normalPrice = Number(pm.price);
            }
          });

          setWeekday(w);
          setWeekend(we);
          setHolidayPrice(h);
        }
      } catch (err) {
        console.warn('Could not load price matrices for type', selectedTypeId, err);
      }
    };
    loadMatrices();
  }, [selectedTypeId]);

  // 3. Fetch Holidays on mount (read-only view)
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const data = await adminApi.getHolidays();
        if (Array.isArray(data)) {
          setHolidays(data);
        }
      } catch (err) {
        console.warn('Could not load holidays', err);
      }
    };
    loadHolidays();
  }, []);

  // Format number to currency display string
  const formatVnd = (val: number) => {
    return Number(val || 0).toLocaleString('vi-VN');
  };

  const selectedPitchTypeName = pitchTypes.find((t) => t.id === selectedTypeId)?.name || 'Sân 5 người';

  return (
    <div className="space-y-6">
      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT CARD: BẢNG GIÁ SÂN (7 COLS ON LARGE SCREEN)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-7">
          {/* Card Header & Pitch Type Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Bảng giá sân</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Hệ thống tự động áp dụng giá theo thời điểm đặt sân.
              </p>
            </div>

            {/* Dropdown Chọn Loại Sân */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-2xs"
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{selectedPitchTypeName}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                  {pitchTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTypeId(t.id);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        selectedTypeId === t.id
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{t.name}</span>
                      {selectedTypeId === t.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matrix Grid Table */}
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="w-2/5 p-4 bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      PHÂN LOẠI NGÀY
                    </th>
                    <th className="w-3/10 p-4 bg-emerald-50/40 text-xs font-bold text-emerald-800 uppercase tracking-wider border-r border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>GIỜ THƯỜNG</span>
                      </div>
                    </th>
                    <th className="w-3/10 p-4 bg-amber-50/40 text-xs font-bold text-amber-800 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>GIỜ VÀNG (CAO ĐIỂM)</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  {/* ROW 1: Trong tuần (Thứ 2 - Thứ 6) */}
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 border border-gray-200">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">Trong tuần</div>
                          <div className="text-xs text-gray-500">Thứ 2 - Thứ 6</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="w-full text-center font-bold text-gray-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(weekday.normalPrice)} đ
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-full text-center font-bold text-amber-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(weekday.peakPrice)} đ
                      </div>
                    </td>
                  </tr>

                  {/* ROW 2: Cuối tuần (Thứ 7, Chủ Nhật) */}
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-blue-600 text-base">Cuối tuần</div>
                          <div className="text-xs text-gray-500">Thứ 7, Chủ Nhật</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="w-full text-center font-bold text-blue-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(weekend.normalPrice)} đ
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-full text-center font-bold text-amber-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(weekend.peakPrice)} đ
                      </div>
                    </td>
                  </tr>

                  {/* ROW 3: Ngày Lễ (Áp dụng phụ thu) */}
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-rose-600 text-base">Ngày Lễ</div>
                          <div className="text-xs text-gray-500">Áp dụng phụ thu</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="w-full text-center font-bold text-rose-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(holidayPrice.normalPrice)} đ
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-full text-center font-bold text-amber-900 bg-gray-100/80 rounded-lg py-2.5 px-3 border border-gray-200/50">
                        {formatVnd(holidayPrice.peakPrice)} đ
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 flex items-center justify-between text-xs text-gray-500 px-1">
            <span>ℹ️ Bảng giá hiển thị chế độ xem (Read-only) theo cấu hình hệ thống.</span>
            <span className="font-medium text-emerald-700">Đang áp dụng</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CARD: NGÀY LỄ (5 COLS ON LARGE SCREEN)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-7 flex flex-col">
          {/* Card Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ngày Lễ</h2>
              <p className="text-xs text-gray-500 mt-0.5">Danh sách các ngày nghỉ lễ áp dụng phụ thu</p>
            </div>
          </div>

          {/* Sub-section: DANH SÁCH ĐÃ THÊM */}
          <div className="mt-6 flex-1 flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              DANH SÁCH NGÀY LỄ HỆ THỐNG ({holidays.length})
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {holidays.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Chưa có ngày lễ nào trong danh sách
                </div>
              ) : (
                holidays.map((h) => {
                  const dateParts = (h.holidayDate || '').split('-');
                  const formattedDate = dateParts.length === 3 
                    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
                    : h.holidayDate;

                  return (
                    <div
                      key={h.id}
                      className="border-l-4 border-red-500 bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-red-600 text-sm">
                          {formattedDate}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mt-0.5">
                          {h.holidayName}
                        </div>
                        {h.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {h.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
