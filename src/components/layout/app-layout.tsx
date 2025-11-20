import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/use-auth';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="h-full min-h-screen bg-gray-50 lg:flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col min-h-screen lg:flex-1">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown / info */}
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="hidden lg:flex lg:flex-col lg:items-end">
                    <span className="text-gray-900">{user?.naam}</span>
                    <span className="text-xs text-gray-500 font-normal">{user?.email}</span>
                </div>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
                
                <button 
                    onClick={() => logout()}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                    Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="py-8 px-4 sm:px-6 lg:px-8 flex-1">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};