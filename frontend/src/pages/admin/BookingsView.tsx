import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';

export const BookingsView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const mockBookings: any[] = [
    {
      id: 1,
      bookingCode: 'BK2026112501',
      guestName: 'Nguyễn Văn Khách',
      guestPhone: '0912345678',
      pitchSlotId: 1,
      totalAmount: 200000,
      depositAmount: 60000,
      status: 'CONFIRMED',
      bookingType: 'ONLINE'
    },
    {
      id: 2,
      bookingCode: 'BK2026112502',
      guestName: 'Hoàng Minh Tuấn',
      guestPhone: '0987654321',
      pitchSlotId: 2,
      totalAmount: 400000,
      depositAmount: 120000,
      status: 'CONFIRMED',
      bookingType: 'ONLINE'
    },
    {
      id: 3,
      bookingCode: 'BK2026112503',
      guestName: 'Trần Quốc Bảo',
      guestPhone: '0933445566',
      pitchSlotId: 3,
      totalAmount: 350000,
      depositAmount: 105000,
      status: 'PENDING_PAYMENT',
      bookingType: 'ONLINE'
    },
    {
      id: 4,
      bookingCode: 'BK2026112504',
      guestName: 'Đặng Hải Đăng',
      guestPhone: '0944556677',
      pitchSlotId: 4,
      totalAmount: 800000,
      depositAmount: 240000,
      status: 'COMPLETED',
      bookingType: 'DIRECT'
    },
    {
      id: 5,
      bookingCode: 'BK2026112505',
      guestName: 'Vũ Đình Trọng',
      guestPhone: '0977889900',
      pitchSlotId: 5,
      totalAmount: 450000,
      depositAmount: 135000,
      status: 'CANCELLED',
      bookingType: 'ONLINE'
    }
  ];

  useEffect(() => {
    setBookings(mockBookings as any);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Đơn Đặt Sân</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách đơn đặt online và tại quầy trong hệ thống</p>
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
                <th className="px-6 py-4">Đã Cọc</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
