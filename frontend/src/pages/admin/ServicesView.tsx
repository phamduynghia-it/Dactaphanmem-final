import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { ServiceItem } from '../../types';
import { Plus, RefreshCw, ShoppingBag, Edit, Trash2 } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const defaultServices: ServiceItem[] = [
    {
      id: 1,
      name: 'Nước khoáng Aquafina 500ml',
      unit: 'Chai',
      price: 10000,
      category: 'DRINK',
      isActive: true,
      description: 'Nước khoáng tinh khiết đóng chai 500ml',
    },
    {
      id: 2,
      name: 'Nước tăng lực Revive bù khoáng',
      unit: 'Chai',
      price: 15000,
      category: 'DRINK',
      isActive: true,
      description: 'Nước giải khát bổ sung điện giải thể thao',
    },
    {
      id: 3,
      name: 'Bộ áo bib thi đấu (10 áo)',
      unit: 'Bộ',
      price: 30000,
      category: 'EQUIPMENT',
      isActive: true,
      description: 'Bộ áo lưới phân đội màu cam hoặc xanh',
    },
    {
      id: 4,
      name: 'Thuê bóng thi đấu số 4',
      unit: 'Quả',
      price: 20000,
      category: 'EQUIPMENT',
      isActive: true,
      description: 'Bóng đúc tiêu chuẩn FIFA cho sân mini',
    },
    {
      id: 5,
      name: 'Dịch vụ Trọng tài điều khiển',
      unit: 'Trận',
      price: 200000,
      category: 'REFEREE',
      isActive: true,
      description: 'Trọng tài có bằng cấp điều khiển trận đấu',
    },
  ];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get<any, ServiceItem[]>('/services');
      if (data && data.length > 0) {
        setServices(data);
      } else {
        setServices(defaultServices);
      }
    } catch (err) {
      // Dùng dữ liệu mẫu nếu API backend chưa chạy
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Quản Lý Dịch Vụ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh mục nước uống, dụng cụ thi đấu và dịch vụ tiện ích phục vụ khách thuê sân
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => alert('Chức năng thêm mới dịch vụ tiện ích.')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-sm">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'ALL'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tất cả ({services.length})
        </button>
        <button
          onClick={() => setSelectedCategory('DRINK')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'DRINK'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Nước giải khát (DRINK)
        </button>
        <button
          onClick={() => setSelectedCategory('EQUIPMENT')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'EQUIPMENT'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dụng cụ & Áo bib (EQUIPMENT)
        </button>
        <button
          onClick={() => setSelectedCategory('REFEREE')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'REFEREE'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dịch vụ Trọng tài (REFEREE)
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã DV</th>
                <th className="px-6 py-4">Tên Dịch Vụ</th>
                <th className="px-6 py-4">Đơn Vị Tính</th>
                <th className="px-6 py-4">Đơn Giá Niêm Yết</th>
                <th className="px-6 py-4">Phân Loại</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Không có dịch vụ nào trong phân loại này.
                  </td>
                </tr>
              ) : (
                filteredServices.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-500">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-400 font-normal">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {item.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.category === 'DRINK' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'EQUIPMENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Đang mở bán
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => alert(`Chỉnh sửa dịch vụ: ${item.name}`)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Xóa dịch vụ: ${item.name}`)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
