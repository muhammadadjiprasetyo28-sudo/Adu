import React from 'react';
import {
  LayoutDashboard,
  Users2,
  Map,
  MessageSquareText,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  Network,
  ShieldCheck,
  Building,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  LogOut
} from 'lucide-react';
import { User, UserRole } from '../../types/index.ts';

export type ActiveTab =
  | 'dashboard'
  | 'volunteers'
  | 'volunteer-map'
  | 'aspirations'
  | 'aspiration-map'
  | 'realizations'
  | 'reports'
  | 'regions'
  | 'users';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole: UserRole;
  currentUser?: User;
  onRoleChange?: (newRole: UserRole) => void;
  onNavigateToWebsite?: () => void;
  onLogout?: () => void;
  pendingVerificationsCount?: number;
  urgentAspirationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  userRole,
  currentUser,
  onRoleChange,
  onNavigateToWebsite,
  onLogout,
  pendingVerificationsCount = 0,
  urgentAspirationsCount = 0
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'volunteers' as ActiveTab,
      label: 'Unit Relawan RT/RW',
      icon: Users2,
      badge: pendingVerificationsCount > 0 ? `${pendingVerificationsCount} Baru` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'volunteer-map' as ActiveTab,
      label: 'Peta Relawan Wilayah',
      icon: Map,
      badge: null
    },
    {
      id: 'aspirations' as ActiveTab,
      label: 'Aspirasi Warga',
      icon: MessageSquareText,
      badge: urgentAspirationsCount > 0 ? `${urgentAspirationsCount} Perlu Aksi` : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'aspiration-map' as ActiveTab,
      label: 'Peta Aspirasi',
      icon: MapPin,
      badge: null
    },
    {
      id: 'realizations' as ActiveTab,
      label: 'Tindak Lanjut & Realisasi',
      icon: CheckCircle2,
      badge: null
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan per Wilayah',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'regions' as ActiveTab,
      label: 'Struktur Wilayah',
      icon: Network,
      badge: null,
      adminOnly: true
    },
    {
      id: 'users' as ActiveTab,
      label: 'Pengguna & Akses (RBAC)',
      icon: ShieldCheck,
      badge: null,
      adminOnly: true
    }
  ];

  const roles: UserRole[] = [
    'Admin Utama',
    'Admin Operasional',
    'Koordinator Wilayah',
    'Operator RT/RW',
    'Viewer'
  ];

  const filteredItems = menuItems.filter((item) => {
    if (item.adminOnly && userRole !== 'Admin Utama') {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* 1. Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
          aria-label="Tutup Menu"
        />
      )}

      {/* 2. Sidebar Element (Responsive: Mobile Drawer + Tablet/Desktop Collapsible Rail) */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-50 md:z-30 h-dvh md:h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl md:shadow-none ${
          // Mobile state: slide in / out
          isOpen ? 'translate-x-0 w-80 max-w-[85vw]' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop state: collapsed or expanded
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between px-2 pb-3 md:hidden border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                ADU
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">PORTAL TIM & DEWAN</p>
                <p className="text-[10px] text-blue-400 font-medium">Sahabat ADU • Dapil 4</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card (Visible on Mobile Drawer & Expanded Desktop) */}
          {currentUser && (
            <div
              className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 ${
                isCollapsed ? 'md:hidden' : 'block'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Mobile Role Switcher (Protected: Only Admin Utama) */}
              {onRoleChange && userRole === 'Admin Utama' && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 md:hidden">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Simulasi Hak Akses (Admin Utama)
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg text-blue-300 font-semibold px-2 py-1.5 focus:outline-hidden focus:border-blue-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Dapil Tangerang 4 Context Card (Hidden when collapsed on desktop) */}
          <div
            className={`p-3 rounded-xl bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-800/40 ${
              isCollapsed ? 'md:hidden' : 'block'
            }`}
          >
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span>Dapil Tangerang 4</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Pasarkemis • Sindang Jaya • Rajeg
            </p>
            <div className="mt-2 text-[10px] text-blue-200/80 bg-blue-900/30 p-2 rounded-lg border border-blue-800/40 leading-relaxed">
              <span className="font-semibold text-white">Prinsip Relawan:</span> Berbasis unit RT & RW.
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div
              className={`px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                isCollapsed ? 'md:text-center md:px-0' : 'block'
              }`}
            >
              {isCollapsed ? <span className="hidden md:inline">• • •</span> : 'Navigasi Sistem'}
            </div>

            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  title={item.label}
                  className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group ${
                    isCollapsed
                      ? 'md:justify-center md:px-2 md:py-3 px-3 py-2.5 justify-between'
                      : 'px-3 py-2.5 justify-between'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isCollapsed ? 'md:space-x-0 space-x-3' : 'space-x-3'
                    } truncate`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.badgeColor || 'bg-slate-700 text-slate-300'
                      } ${isCollapsed ? 'md:hidden' : 'block'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          {/* Quick Mobile Links (Only on Mobile drawer) */}
          <div className="md:hidden space-y-1.5 pt-1">
            {onNavigateToWebsite && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToWebsite();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/50 hover:bg-blue-900/50 transition-colors"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Kembali ke Website Publik</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Keluar Akun</span>
              </button>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors text-xs font-medium ${
                isCollapsed ? 'justify-center' : 'justify-between px-3'
              }`}
              title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              <span className={`text-[11px] ${isCollapsed ? 'hidden' : 'inline'}`}>
                Ciutkan Menu
              </span>
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}

          {/* System Version Tag (Hidden in compact mode) */}
          <div
            className={`flex items-center space-x-2 text-[10px] text-slate-400 ${
              isCollapsed ? 'md:hidden' : 'flex'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Sahabat ADU v1.5 • Aman & Transparan</span>
          </div>
        </div>
      </aside>
    </>
  );
};
