import React from 'react';
import { BarChart3 } from 'lucide-react';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Thống Kê
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi tổng quan hoạt động và các chỉ số vận hành hệ thống
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-xs text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-xs">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Đây là trang thống kê
        </h2>
        <p className="text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
          Trang theo dõi và phân tích số liệu thống kê của hệ thống quản lý sân bóng.
        </p>
      </div>
    </div>
  );
};
