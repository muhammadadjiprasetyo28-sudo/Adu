import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Menu,
  Globe,
  LayoutDashboard,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  X
} from 'lucide-react';
import { User, UserRole } from '../../types/index.ts';

interface NavbarProps {
  currentUser: User;
  onRoleChange: (newRole: UserRole) => void;
  onResetData: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isWebsiteView: boolean;
  onToggleWebsiteView: (isWeb: boolean) => void;
  onOpenSubmitAspiration: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  onResetData,
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleCollapse,
  isWebsiteView,
  onToggleWebsiteView,
  onOpenSubmitAspiration,
  onLogout
}) => {
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);

  const roles: UserRole[] = [
    'Admin Utama',
    'Admin Operasional',
    'Koordinator Wilayah',
    'Operator RT/RW',
    'Viewer'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Left: Hamburger & Brand Info */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {!isWebsiteView && (
              <>
                {/* Mobile Drawer Trigger (< md) */}
                <button
                  onClick={onToggleSidebar}
                  className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-hidden md:hidden transition-colors"
                  aria-label="Toggle menu mobile"
                  title="Buka Menu Samping"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Desktop/Tablet Collapse Trigger (>= md) */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-hidden transition-colors"
                    aria-label="Toggle sidebar collapse"
                    title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                  >
                    {isSidebarCollapsed ? (
                      <PanelLeft className="w-5 h-5 text-blue-700" />
                    ) : (
                      <PanelLeftClose className="w-5 h-5" />
                    )}
                  </button>
                )}
              </>
            )}

            {/* Brand Logo & Name */}
            <div
              onClick={() => onToggleWebsiteView(true)}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0"
              title="Ke Halaman Beranda Publik"
            >
              {/* PAN Radiant Blue/White/Sun Logo Icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-500/25 text-white font-black tracking-wider text-sm sm:text-base relative overflow-hidden border border-blue-400/40 group-hover:scale-105 transition-transform shrink-0">
                <span className="relative z-10 font-black">ADU</span>
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xs"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full shadow-xs"></div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-black text-blue-950 tracking-tight whitespace-nowrap">
                    SAHABAT <span className="text-blue-600 font-extrabold">ADU</span>
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                    PAN Dapil 4
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate max-w-xs">
                  Aw Maulana & Uju • Pasarkemis, Rajeg & Sindang Jaya
                </p>
              </div>
            </div>
          </div>

          {/* Center: Desktop View Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => onToggleWebsiteView(true)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isWebsiteView
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Website Publik</span>
            </button>
            <button
              onClick={() => onToggleWebsiteView(false)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                !isWebsiteView
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Portal Kerja Tim & Dewan</span>
            </button>
          </div>

          {/* Right: Quick Action, Switcher, Role & User Avatar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Quick Sampaikan Aspirasi CTA */}
            <button
              onClick={onOpenSubmitAspiration}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              title="Kirim Aspirasi Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim Aspirasi</span>
              <span className="sm:hidden text-[11px]">Aspirasi</span>
            </button>

            {/* Switch to Website Button (Mobile/Tablet View) */}
            <button
              onClick={() => onToggleWebsiteView(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
              title="Kembali ke Website Publik"
            >
              <Globe className="w-4 h-4 text-blue-700" />
              <span className="hidden xs:inline text-[11px]">Website</span>
            </button>

            {/* Role Badge & Testing Switcher (Only Admin Utama has testing bypass privilege) */}
            <div className="relative group hidden md:block">
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs cursor-pointer transition-colors">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 hidden xl:inline">Peran:</span>
                <span className="font-semibold text-blue-900 truncate max-w-[120px]">
                  {currentUser.role}
                </span>
                {currentUser.role === 'Admin Utama' && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                )}
              </div>

              {/* Dropdown Menu for Roles (Protected: Only Admin Utama) */}
              {currentUser.role === 'Admin Utama' && (
                <div className="absolute right-0 mt-1 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Simulasi Hak Akses (RBAC)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Admin Utama</span>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === r
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser.role === r && <UserCheck className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Data Button (Desktop) */}
            <button
              onClick={onResetData}
              title="Reset data ke bawaan awal"
              className="hidden sm:flex p-1.5 sm:p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
              aria-label="Reset Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Avatar with Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity focus:outline-hidden"
                aria-label="Menu Pengguna"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0 shadow-2xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium truncate max-w-[110px]">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu (Responsive for Mobile & Desktop) */}
              {isMobileUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMobileUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {currentUser.role}
                      </span>
                    </div>

                    {/* Mobile-only Role Switcher in menu */}
                    <div className="md:hidden px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Ganti Hak Akses (RBAC)
                      </p>
                      <div className="space-y-1">
                        {roles.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              onRoleChange(r);
                              setIsMobileUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                              currentUser.role === r
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{r}</span>
                            {currentUser.role === r && (
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          onResetData();
                          setIsMobileUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Data Bawaan</span>
                      </button>

                      <button
                        onClick={() => {
                          onToggleWebsiteView(true);
                          setIsMobileUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 font-medium flex items-center gap-2"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ke Website Publik</span>
                      </button>

                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsMobileUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-slate-100 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Keluar ke Beranda</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Icon Button (Desktop) */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar ke Halaman Publik"
                className="hidden sm:flex p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

