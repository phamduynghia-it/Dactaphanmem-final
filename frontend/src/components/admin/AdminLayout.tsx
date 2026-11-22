import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children?: React.ReactNode;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 text-gray-900 font-sans ${darkMode ? 'dark bg-gray-900 text-gray-100' : ''}`}>
      {/* Reusable Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onLogout={onLogout}
      />

      {/* Main Right Area: Header + Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          userName="Chủ Sân Admin"
          userRole="Quản trị viên"
          avatarText="CA"
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
