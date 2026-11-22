import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { PitchSlot } from '../../types';
import { RefreshCw, Clock } from 'lucide-react';

export const PitchSlotsView: React.FC = () => {
  const [slots, setSlots] = useState<PitchSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await axiosClient.get<any, PitchSlot[]>('/pitch-slots');
      setSlots(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách ca đá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Ca Đá Theo Ngày</h1>
          <p className="text-sm text-gray-500 mt-1">Lịch hoạt động của từng sân theo ngày và trạng thái giữ chỗ</p>
        </div>
        <button
          onClick={loadSlots}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã Slot</th>
                <th className="px-6 py-4">Sân Bóng</th>
                <th className="px-6 py-4">Khung Giờ</th>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Giá Thuê</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slots.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Chưa có ca đá nào hoặc không kết nối được server.
                  </td>
                </tr>
              )}
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">#{s.id}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-800">{s.pitchName}</td>
                  <td className="px-6 py-4 flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.startTime} - {s.endTime}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{s.slotDate || s.dateslot}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {s.price.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'HOLDING' ? 'bg-amber-100 text-amber-800' :
                      s.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-emerald-600 hover:text-emerald-800 font-medium text-xs">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
