import { useState } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardView } from './pages/admin/DashboardView';
import { PitchSlotsView } from './pages/admin/PitchSlotsView';
import { BookingsView } from './pages/admin/BookingsView';
import { ServicesView } from './pages/admin/ServicesView';
import { GenericTableView } from './pages/admin/GenericTableView';
import { PriceMatrixView } from './pages/admin/PriceMatrixView';
import { ClientBookingView } from './pages/client/ClientBookingView';
import { ToastContainer } from './components/common/ToastContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClientMode, setIsClientMode] = useState(false);

  return (
    <>
      {/* Toast Notification Container đặt cố định ở góc trên bên phải màn hình */}
      <ToastContainer />

      {isClientMode ? (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <header className="bg-emerald-800 text-white shadow-sm sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight">Soccer365</span>
                <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100">
                  Giao diện Khách hàng
                </span>
              </div>
              <button
                onClick={() => setIsClientMode(false)}
                className="text-xs bg-white text-emerald-900 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-xs"
              >
                Vào Trang Quản Trị (Admin) ➔
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <ClientBookingView />
          </main>
        </div>
      ) : (
        <div className="relative">
          {/* Floating switcher button to switch to Client View anytime */}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setIsClientMode(true)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Xem thử giao diện khách hàng đặt sân"
            >
              <span>Xem Giao diện Khách</span>
              <span className="text-emerald-200">⚽</span>
            </button>
          </div>

          <AdminLayout
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={() => alert('Đã đăng xuất khỏi tài khoản Quản trị viên.')}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'pitch-slots' && <PitchSlotsView />}
            {activeTab === 'bookings' && <BookingsView />}
            {activeTab === 'services' && <ServicesView />}
            {activeTab === 'transactions' && (
              <GenericTableView
                title="Giao Dịch Thanh Toán"
                subtitle="Theo dõi lịch sử giao dịch tiền cọc, chuyển khoản và thanh toán tại quầy"
                tableName="payment_transaction"
                apiEndpoint="/payment-transactions"
              />
            )}
            {activeTab === 'users' && (
              <GenericTableView
                title="Quản Lý Người Dùng"
                subtitle="Danh sách khách hàng thành viên và phân quyền nhân viên"
                tableName="users"
                apiEndpoint="/users"
              />
            )}
            {activeTab === 'pitches' && (
              <GenericTableView
                title="Quản Lý Sân Bóng"
                subtitle="Danh mục các sân bóng mini, trạng thái hoạt động và cơ sở vật chất"
                tableName="pitches"
                apiEndpoint="/pitches"
              />
            )}
            {activeTab === 'timeslots' && (
              <GenericTableView
                title="Khung Giờ Ca Đá"
                subtitle="Cấu hình danh sách các ca đá cố định và quy định giờ vàng/cao điểm"
                tableName="time_slots"
                apiEndpoint="/time-slots"
              />
            )}
            {activeTab === 'pricing' && <PriceMatrixView />}
          </AdminLayout>
        </div>
      )}
    </>
  );
}
