import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Layers, RefreshCw, Plus } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface GenericTableViewProps {
  title: string;
  subtitle: string;
  tableName: string;
  apiEndpoint?: string;
  hideHeaderButtons?: boolean;
  showAddButton?: boolean;
}

// Bảng ánh xạ tên cột tiếng Anh sang tiếng Việt chuẩn hóa
const COLUMN_LABEL_MAP: Record<string, string> = {
  // Chung
  id: 'Mã ID',
  name: 'Tên',
  description: 'Mô tả',
  status: 'Trạng thái',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
  isActive: 'Trạng thái hoạt động',

  // Giao dịch thanh toán (payment_transaction)
  transactionCode: 'Mã giao dịch',
  paymentMethodCode: 'Phương thức',
  paymentMethodName: 'Tên PTTT',
  paymentMethodId: 'Mã PTTT',
  bookingId: 'Mã đơn',
  bookingCode: 'Mã đơn đặt',
  amount: 'Số tiền',
  paymentType: 'Loại thanh toán',

  // Người dùng (users)
  fullName: 'Họ và tên',
  email: 'Email liên hệ',
  phoneNumber: 'Số điện thoại',
  roleId: 'Mã vai trò',
  roleName: 'Vai trò',
  roleDescription: 'Mô tả quyền hạn',

  // Quản lý Sân (pitches)
  pitchName: 'Tên sân',
  pitchTypeId: 'Mã loại sân',
  pitchTypeName: 'Loại sân',
  playerCapacity: 'Sức chứa',

  // Khung giờ (time_slots)
  startTime: 'Giờ bắt đầu',
  endTime: 'Giờ kết thúc',
  isPeakHour: 'Khung giờ vàng',

  // Ca đá (pitch_slots)
  pitchSlotId: 'Mã ca đá',
  slotDate: 'Ngày đá',
  dateslot: 'Ngày đá',
  price: 'Đơn giá',
  holdExpiresAt: 'Hạn giữ chỗ',

  // Dịch vụ (services)
  unit: 'Đơn vị tính',
  category: 'Phân loại',

  // Bảng giá (price_matrices) & Ngày lễ (holidays)
  dayType: 'Phân loại ngày',
  holidayDate: 'Ngày lễ',
  holidayName: 'Tên ngày lễ',
};

// Hàm dịch tiêu đề cột sang tiếng Việt
const getColumnLabel = (key: string): string => {
  if (COLUMN_LABEL_MAP[key]) return COLUMN_LABEL_MAP[key];

  // Chuyển đổi camelCase sang dạng chữ dễ đọc
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Hàm dịch giá trị trạng thái & phân loại sang tiếng Việt
const getDisplayValue = (key: string, val: any): string => {
  if (val === null || val === undefined) return '';

  if (typeof val === 'boolean') {
    if (key === 'isPeakHour') return val ? 'Giờ cao điểm' : 'Giờ thường';
    if (key === 'isActive') return val ? 'Đang hoạt động' : 'Tạm khóa';
    return val ? 'Có' : 'Không';
  }

  const strVal = String(val).toUpperCase();

  // Dịch loại ngày
  if (key === 'dayType') {
    if (strVal === 'WEEKDAY') return 'Trong tuần (T2 - T6)';
    if (strVal === 'WEEKEND') return 'Cuối tuần (T7, CN)';
    if (strVal === 'HOLIDAY') return 'Ngày Lễ';
  }

  // Dịch loại thanh toán
  if (key === 'paymentType') {
    if (strVal === 'DEPOSIT') return 'Đặt cọc';
    if (strVal === 'FULL') return 'Toàn bộ';
    if (strVal === 'REMAINING') return 'Thanh toán còn lại';
    if (strVal === 'REFUND') return 'Hoàn tiền';
  }

  // Dịch trạng thái
  if (key === 'status') {
    if (strVal === 'SUCCESS') return 'Thành công';
    if (strVal === 'PENDING') return 'Chờ xử lý';
    if (strVal === 'FAILED') return 'Thất bại';
    if (strVal === 'ACTIVE') return 'Hoạt động';
    if (strVal === 'MAINTENANCE') return 'Bảo trì';
    if (strVal === 'AVAILABLE') return 'Còn trống';
    if (strVal === 'HOLDING') return 'Đang giữ chỗ';
    if (strVal === 'BOOKED') return 'Đã đặt';
    if (strVal === 'CONFIRMED') return 'Đã xác nhận';
    if (strVal === 'COMPLETED') return 'Hoàn thành';
    if (strVal === 'CANCELLED') return 'Đã hủy';
  }

  // Dịch phương thức thanh toán code
  if (key === 'paymentMethodCode') {
    if (strVal === 'MOMO') return 'Ví MoMo';
    if (strVal === 'VNPAY') return 'VNPAY QR';
    if (strVal === 'ZALOPAY') return 'ZaloPay';
    if (strVal === 'BANK_TRANSFER') return 'Chuyển khoản NH';
    if (strVal === 'CASH') return 'Tiền mặt tại quầy';
  }

  // Tự động định dạng ngày tháng sang dd/mm/yyyy
  if (
    key.toLowerCase().includes('date') || 
    key.toLowerCase().includes('at') || 
    key === 'dateslot'
  ) {
    if (typeof val === 'string' && /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(val)) {
      return formatDate(val);
    }
  }

  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

export const GenericTableView: React.FC<GenericTableViewProps> = ({ 
  title, 
  subtitle, 
  tableName, 
  apiEndpoint,
  hideHeaderButtons,
  showAddButton = false
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!apiEndpoint) return;
    setLoading(true);
    try {
      const data = await axiosClient.get<any, any[]>(apiEndpoint);
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.warn(`Could not load from ${apiEndpoint}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Ẩn các nút ở trang giao dịch thanh toán hoặc khi có prop hideHeaderButtons */}
        {!hideHeaderButtons && tableName !== 'payment_transaction' && apiEndpoint !== '/payment-transactions' && (
          <div className="flex items-center gap-3">
            {apiEndpoint && (
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-xs"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            )}

            {showAddButton && (
              <button 
                onClick={() => alert(`Chức năng thêm mới ${title}`)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mới {title}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* If data exists from API, render data table; otherwise show module status card */}
      {items.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  {Object.keys(items[0]).map((key) => (
                    <th key={key} className="px-6 py-4 whitespace-nowrap">
                      {getColumnLabel(key)}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    {Object.keys(items[0]).map((key) => {
                      const val = row[key];
                      const isMoney = key.toLowerCase().includes('price') || key.toLowerCase().includes('amount');

                      // Định dạng tiền tệ (+ tiền màu xanh, - tiền màu đỏ)
                      if (isMoney) {
                        const numVal = Number(val || 0);
                        const isRefundOrNegative = String(row.paymentType || '').toUpperCase() === 'REFUND' || numVal < 0;
                        const formatted = Math.abs(numVal).toLocaleString('vi-VN');

                        if (isRefundOrNegative) {
                          return (
                            <td key={key} className="px-6 py-4">
                              <span className="font-bold text-red-600 whitespace-nowrap">
                                - {formatted} đ
                              </span>
                            </td>
                          );
                        } else {
                          const prefix = key.toLowerCase().includes('amount') ? '+ ' : '';
                          return (
                            <td key={key} className="px-6 py-4">
                              <span className="font-bold text-emerald-600 whitespace-nowrap">
                                {prefix}{formatted} đ
                              </span>
                            </td>
                          );
                        }
                      }

                      // Định dạng badge trạng thái
                      if (key === 'status') {
                        const statusStr = String(val || '').toUpperCase();
                        const isSuccess = statusStr === 'SUCCESS' || statusStr === 'COMPLETED' || statusStr === 'ACTIVE' || statusStr === 'CONFIRMED';
                        const isPending = statusStr === 'PENDING' || statusStr === 'PENDING_PAYMENT' || statusStr === 'HOLDING';
                        return (
                          <td key={key} className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isSuccess ? 'bg-emerald-100 text-emerald-800' :
                              isPending ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getDisplayValue(key, val)}
                            </span>
                          </td>
                        );
                      }

                      // Định dạng các trường khác
                      const displayVal = getDisplayValue(key, val);
                      return (
                        <td key={key} className="px-6 py-4 whitespace-nowrap">
                          <span className={key === 'id' || key.toLowerCase().includes('code') ? 'font-mono text-gray-600 font-medium' : 'text-gray-900'}>
                            {displayVal}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
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
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Mô-đun {title}</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Dữ liệu từ bảng <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">{tableName}</code> đang trống hoặc chưa có bản ghi nào.
          </p>
        </div>
      )}
    </div>
  );
};
