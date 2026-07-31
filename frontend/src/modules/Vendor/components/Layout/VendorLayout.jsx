import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';
import VendorBottomNav from './VendorBottomNav';
import useAdminHeaderHeight from '../../../Admin/hooks/useAdminHeaderHeight';

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerHeight = useAdminHeaderHeight();

  // Prevent background scrolling when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Bottom nav height is 64px (h-16)
  const bottomNavHeight = 64;

  // Add small buffer to prevent content overlap (8px)
  const topPadding = headerHeight + 8;
  const bottomPadding = bottomNavHeight + 8;

  return (
    <div className={`h-screen overflow-hidden bg-gray-50 flex ${sidebarOpen ? 'fixed inset-0' : ''}`}>
      {/* Sidebar */}
      <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 max-w-full overflow-x-hidden">
        {/* Header */}
        <VendorHeader
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content - with dynamic padding to account for fixed header and bottom nav */}
        <main
          className={`flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden lg:pb-6 scrollbar-admin w-full min-w-0 ${
            sidebarOpen ? '!overflow-hidden' : 'overflow-y-auto'
          }`}
          style={{
            paddingTop: `${topPadding}px`,
            paddingBottom: `calc(${bottomPadding}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <div className="w-full max-w-full overflow-x-hidden min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <VendorBottomNav isHidden={sidebarOpen} />
    </div>
  );
};

export default VendorLayout;
