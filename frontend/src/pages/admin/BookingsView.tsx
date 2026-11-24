import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Booking } from '../../types';
import { RefreshCw } from 'lucide-react';

export const BookingsView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await axiosClient.get<any, Booking[]>('/bookings');
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      setBookings([]);
      setError(err.message || 'Không thể tải danh sách đơn đặt sân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Đơn Đặt Sân</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách đơn đặt online và tại quầy trong hệ thống</p>
        </div>

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
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Số Điện Thoại</th>
                <th className="px-6 py-4">Hình Thức</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Đã Cọc</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Chưa có đơn đặt sân nào trong hệ thống.
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-emerald-800">{b.bookingCode}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.guestName}</td>
                  <td className="px-6 py-4 text-gray-600">{b.guestPhone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      {b.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {b.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">
                    {b.depositAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-emerald-600 hover:text-emerald-800 font-medium text-xs">
                      Xử lý
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
