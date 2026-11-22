import React from 'react';
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  ShoppingBag,
  Users, 
  Settings, 
  Clock, 
  LogOut, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Thống kê', icon: BarChart3 },
  { id: 'pitch-slots', label: 'Quản lý Ca Đá', icon: Calendar },
  { id: 'bookings', label: 'Quản lý Đơn', icon: CreditCard },
  { id: 'services', label: 'Dịch vụ', icon: ShoppingBag },
  { id: 'transactions', label: 'Giao dịch', icon: CreditCard },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'pitches', label: 'Quản lý Sân', icon: Settings },
  { id: 'timeslots', label: 'Khung giờ', icon: Clock },
  { id: 'pricing', label: 'Bảng giá sân', icon: FileSpreadsheet },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onLogout
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        {/* Top Brand / Logo */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 font-sans">
                  Soccer365
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Phần mềm quản lý sân bóng
              </p>
            </div>
            
            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
              title="Đóng sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border-r-4 border-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (Đăng xuất) */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout || (() => alert('Đăng xuất thành công'))}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};
