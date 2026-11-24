import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { ServiceItem } from '../../types';
import {
  Plus,
  RefreshCw,
  ShoppingBag,
  Edit,
  Lock,
  Unlock,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Chai',
    price: 10000,
    category: 'DRINK' as 'DRINK' | 'EQUIPMENT' | 'REFEREE',
    description: '',
    isActive: true,
  });

  // Confirm Lock / Unlock Modal State
  const [confirmLockItem, setConfirmLockItem] = useState<{
    item: ServiceItem;
    action: 'lock' | 'unlock';
  } | null>(null);
  const [lockLoading, setLockLoading] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper xác định chính xác trạng thái hoạt động (bất kể JSON trả về isActive hay active)
  const isItemActive = (item: ServiceItem): boolean => {
    if (item.isActive !== undefined && item.isActive !== null) return Boolean(item.isActive);
    if (item.active !== undefined && item.active !== null) return Boolean(item.active);
    return false;
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getServices(false);
      if (Array.isArray(data)) {
        setServices(data);
      } else {
        setServices([]);
      }
    } catch (err: any) {
      setServices([]);
      showToast(err.message || 'Không thể tải danh sách dịch vụ từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      unit: 'Chai',
      price: 10000,
      category: 'DRINK',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      price: item.price,
      category: item.category,
      description: item.description || '',
      isActive: isItemActive(item),
    });
    setIsModalOpen(true);
  };

  // Submit Modal Form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên dịch vụ', 'error');
      return;
    }
    if (formData.price < 0) {
      showToast('Đơn giá không hợp lệ', 'error');
      return;
    }

    try {
      if (editingItem) {
        // Update Service
        await adminApi.updateService(editingItem.id, formData);
        showToast(`Đã cập nhật dịch vụ "${formData.name}" thành công!`, 'success');
      } else {
        // Create Service
        await adminApi.createService(formData);
        showToast(`Đã thêm mới dịch vụ "${formData.name}" thành công!`, 'success');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu thông tin dịch vụ', 'error');
    }
  };

  // Initiate Lock / Unlock (Open confirm modal)
  const handleInitiateToggleStatus = (item: ServiceItem) => {
    const isCurrentlyActive = isItemActive(item);
    setConfirmLockItem({
      item,
      action: isCurrentlyActive ? 'lock' : 'unlock',
    });
  };

  // Perform confirmed Lock / Unlock
  const handleConfirmToggleStatus = async () => {
    if (!confirmLockItem) return;
    setLockLoading(true);
    try {
      await adminApi.toggleServiceStatus(confirmLockItem.item.id);
      const actionName = confirmLockItem.action === 'lock' ? 'Đã khóa dịch vụ' : 'Đã mở khóa dịch vụ';
      showToast(`${actionName} "${confirmLockItem.item.name}" thành công!`, 'success');
      setConfirmLockItem(null);
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái dịch vụ', 'error');
    } finally {
      setLockLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${toastMessage.type === 'success'
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
            onClick={handleOpenCreateModal}
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
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === 'ALL'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          Tất cả ({services.length})
        </button>
        <button
          onClick={() => setSelectedCategory('DRINK')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === 'DRINK'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          Nước giải khát (DRINK)
        </button>
        <button
          onClick={() => setSelectedCategory('EQUIPMENT')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === 'EQUIPMENT'
              ? 'bg-emerald-700 text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          Dụng cụ & Áo bib (EQUIPMENT)
        </button>
        <button
          onClick={() => setSelectedCategory('REFEREE')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === 'REFEREE'
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isItemActive(item) ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={isItemActive(item) ? 'text-gray-900 font-semibold' : 'text-gray-400 line-through'}>
                            {item.name}
                          </div>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.category === 'DRINK' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'EQUIPMENT' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                        }`}>
                        {item.category === 'DRINK' ? 'Nước uống' : item.category === 'EQUIPMENT' ? 'Dụng cụ' : 'Trọng tài'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isItemActive(item) ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          Đang mở bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* Sửa dịch vụ */}
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                        title="Chỉnh sửa dịch vụ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Khóa / Mở khóa dịch vụ (hiển thị popup confirm) */}
                      <button
                        onClick={() => handleInitiateToggleStatus(item)}
                        className={`p-1.5 rounded-lg transition-colors inline-flex items-center ${isItemActive(item)
                            ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                            : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                        title={isItemActive(item) ? 'Khóa dịch vụ (ngừng kinh doanh)' : 'Mở khóa dịch vụ (bắt đầu mở bán)'}
                      >
                        {isItemActive(item) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Thêm Mới / Chỉnh Sửa Dịch Vụ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Mới Dịch Vụ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Nước giải khát Revive 500ml"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Đơn vị tính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="VD: Chai, Quả, Bộ, Trận"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Đơn giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phân loại danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DRINK">Nước giải khát (DRINK)</option>
                    <option value="EQUIPMENT">Dụng cụ & Áo bib (EQUIPMENT)</option>
                    <option value="REFEREE">Dịch vụ Trọng tài (REFEREE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Trạng thái kinh doanh
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="true">Đang mở bán (Active)</option>
                    <option value="false">Khóa / Tạm dừng (Locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả bổ sung về dịch vụ..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Confirm Khóa / Mở khóa Dịch vụ */}
      {confirmLockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${confirmLockItem.action === 'lock'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {confirmLockItem.action === 'lock' ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Unlock className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {confirmLockItem.action === 'lock' ? 'Xác nhận khóa dịch vụ' : 'Xác nhận mở khóa dịch vụ'}
                  </h3>
                </div>
                <button
                  onClick={() => !lockLoading && setConfirmLockItem(null)}
                  disabled={lockLoading}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {confirmLockItem.action === 'lock' ? (
                    <>
                      Bạn có chắc chắn muốn khóa dịch vụ <span className="font-semibold text-gray-900">"{confirmLockItem.item.name}"</span> không?
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn mở khóa dịch vụ <span className="font-semibold text-gray-900">"{confirmLockItem.item.name}"</span> không?
                    </>
                  )}
                </p>

                {confirmLockItem.action === 'lock' ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Khi bị khóa, dịch vụ sẽ chuyển sang trạng thái <strong>Đã khóa</strong> và tạm ngừng cung cấp, khách hàng sẽ không thể lựa chọn dịch vụ này khi đặt sân.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      Dịch vụ sẽ hoạt động trở lại ở trạng thái <strong>Đang mở bán</strong> và hiển thị đầy đủ cho khách hàng khi đặt sân.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={lockLoading}
                  onClick={() => setConfirmLockItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={lockLoading}
                  onClick={handleConfirmToggleStatus}
                  className={`flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 ${confirmLockItem.action === 'lock'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                >
                  {lockLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>
                    {confirmLockItem.action === 'lock' ? 'Khóa dịch vụ' : 'Mở khóa dịch vụ'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
