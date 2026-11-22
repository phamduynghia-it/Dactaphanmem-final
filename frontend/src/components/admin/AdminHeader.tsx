import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  userName?: string;
  userRole?: string;
  avatarText?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  darkMode = false,
  onToggleDarkMode,
  userName = 'Chủ Sân Admin',
  userRole = 'Quản trị viên',
  avatarText = 'CA',
}) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Hamburger Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Thu gọn / Mở rộng Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-xs"
          title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right leading-tight">
            <div className="font-semibold text-gray-800 text-sm">{userName}</div>
            <div className="text-xs text-gray-500 mt-0.5">{userRole}</div>
          </div>
          
          {/* Avatar Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shadow-xs select-none">
            {avatarText}
          </div>
        </div>
      </div>
    </header>
  );
};
