import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useMenuPermissions } from '@/hooks/use-menu-permissions';
import { navigation } from '@/config/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { hasPermission, hasRole } = useAuth();
  const { hasMenuAccess } = useMenuPermissions();

  // Filter groups and items op basis van permissies en menu permissions
  const filteredNavigation = navigation
    .filter((group) => {
      if (group.role && !hasRole(group.role)) return false;
      return true;
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.role && !hasRole(item.role)) return false;
        if (item.permission && !hasPermission(item.permission.resource, item.permission.action)) return false;
        if (item.menuItem && !hasMenuAccess(item.menuItem)) return false;
        return true;
      })
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10 bg-gray-900">
          <div className="flex items-center gap-3">
             {/* Je kunt hier je logo plaatsen */}
             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DKL</span>
             </div>
             <span className="text-lg font-bold text-white tracking-tight">Admin Panel</span>
          </div>
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-1 flex-col px-4 py-6 gap-y-4 overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {filteredNavigation.map((group) => (
              <li key={group.label}>
                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider px-2 py-2">
                  {group.label}
                </div>
                <ul role="list" className="-mx-2 space-y-1">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        end={true}
                        onClick={() => setIsOpen(false)} // Sluit menu op mobiel na klik
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer in sidebar (versienummer etc) */}
        <div className="px-6 py-4 border-t border-white/10">
           <p className="text-xs text-gray-500">v1.2.0 (Production)</p>
        </div>
      </div>
    </>
  );
};