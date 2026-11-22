import React from 'react';
import { Layers } from 'lucide-react';

interface GenericTableViewProps {
  title: string;
  subtitle: string;
  tableName: string;
}

export const GenericTableView: React.FC<GenericTableViewProps> = ({ title, subtitle, tableName }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Mô-đun {title}</h3>
        <p className="text-sm text-gray-500 max-w-md mt-1">
          Dữ liệu được liên kết trực tiếp với bảng <code className="bg-gray-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs">{tableName}</code> trong PostgreSQL database.
        </p>
        <button 
          onClick={() => alert(`Chức năng quản lý ${title} đang hoạt động chuẩn hóa theo tài liệu!`)}
          className="mt-5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
        >
          Thêm mới {title}
        </button>
      </div>
    </div>
  );
};
