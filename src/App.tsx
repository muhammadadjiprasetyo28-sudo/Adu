import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.tsx';
import { DashboardOverview } from './components/dashboard/DashboardOverview.tsx';
import { VolunteerUnitList } from './components/volunteers/VolunteerUnitList.tsx';
import { VolunteerMap } from './components/volunteers/VolunteerMap.tsx';
import { AspirationList } from './components/aspirations/AspirationList.tsx';
import { AspirationDetailModal } from './components/aspirations/AspirationDetailModal.tsx';
import { AspirationMap } from './components/aspirations/AspirationMap.tsx';
import { RealizationManagement } from './components/realizations/RealizationManagement.tsx';
import { RegionalReportView } from './components/reports/RegionalReportView.tsx';
import { RegionManagementView } from './components/regions/RegionManagementView.tsx';
import { UserManagementView } from './components/users/UserManagementView.tsx';
import { LandingWebsite } from './components/public/LandingWebsite.tsx';
import { SubmitAspirationModal } from './components/aspirations/SubmitAspirationModal.tsx';

import { store } from './services/store.ts';
import {
  User,
  UserRole,
  VolunteerUnit,
  Aspiration,
  FollowUpRecord,
  RealizationRecord,
  Region,
  AspirationCategory,
  AuditLog,
  UnitStatus,
  AspirationStatus
} from './types/index.ts';
import { CheckCircle2, AlertCircle, LayoutDashboard, Globe, MessageSquarePlus } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // View Mode: Landing Website (Initial view requested) vs Internal Workspace Dashboard
  const [isWebsiteView, setIsWebsiteView] = useState(true);

  // Database reactive states
  const [regions, setRegions] = useState<Region[]>(store.getRegions());
  const [volunteerUnits, setVolunteerUnits] = useState<VolunteerUnit[]>(store.getVolunteerUnits());
  const [categories, setCategories] = useState<AspirationCategory[]>(store.getCategories());
  const [aspirations, setAspirations] = useState<Aspiration[]>(store.getAspirations());
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(store.getDatabase().followUps);
  const [realizations, setRealizations] = useState<RealizationRecord[]>(store.getRealizations());
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(store.getAuditLogs());

  // Detailed Modals
  const [selectedAspirationId, setSelectedAspirationId] = useState<string | null>(null);
  const [selectedUnitOnMap, setSelectedUnitOnMap] = useState<VolunteerUnit | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshStateFromStore = () => {
    setCurrentUser(store.getCurrentUser());
    setRegions([...store.getRegions()]);
    setVolunteerUnits([...store.getVolunteerUnits()]);
    setCategories([...store.getCategories()]);
    setAspirations([...store.getAspirations()]);
    setFollowUps([...store.getDatabase().followUps]);
    setRealizations([...store.getRealizations()]);
    setUsers([...store.getUsers()]);
    setAuditLogs([...store.getAuditLogs()]);
  };

  // Subscribe to backend API & store sync
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      refreshStateFromStore();
    });
    return unsubscribe;
  }, []);

  // Handlers for Volunteer Units
  const handleAddUnit = async (data: Omit<VolunteerUnit, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await store.addVolunteerUnit(data);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Unit ${data.unit_type} ${data.rw_number} berhasil didaftarkan.`);
    }
    return res;
  };

  const handleUpdateUnit = async (id: string, updates: Partial<VolunteerUnit>) => {
    const res = await store.updateVolunteerUnit(id, updates);
    if (res.success) {
      refreshStateFromStore();
      showToast('Perubahan data unit relawan berhasil disimpan.');
    }
    return res;
  };

  const handleSetUnitStatus = async (id: string, status: UnitStatus) => {
    const res = await store.setVolunteerUnitStatus(id, status);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Status unit relawan diubah menjadi ${status}.`);
    }
    return res;
  };

  const handleViewUnitOnMap = (unit: VolunteerUnit) => {
    setSelectedUnitOnMap(unit);
    setIsWebsiteView(false);
    setActiveTab('volunteer-map');
  };

  // Handlers for Aspirations
  const handleAddAspiration = async (
    data: Omit<Aspiration, 'id' | 'aspiration_number' | 'updated_at'>
  ) => {
    const res = await store.addAspiration(data);
    if (res.success && res.data) {
      refreshStateFromStore();
      showToast(`Aspirasi ${res.data.aspiration_number} berhasil dicatat.`);
    }
    return res;
  };

  const handleUpdateAspirationStatus = async (
    id: string,
    newStatus: AspirationStatus,
    notes?: string
  ) => {
    const res = await store.updateAspirationStatus(id, newStatus, notes);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Status aspirasi berhasil diubah ke ${newStatus}.`);
    }
  };

  // Handlers for Follow Ups
  const handleAddFollowUp = async (data: Omit<FollowUpRecord, 'id' | 'created_at'>) => {
    const res = await store.addFollowUp(data);
    if (res.success) {
      refreshStateFromStore();
      showToast('Tindak lanjut baru berhasil dicatat.');
    }
  };

  // Handlers for Realizations
  const handleAddRealization = async (data: Omit<RealizationRecord, 'id' | 'created_at'>) => {
    const res = await store.addRealization(data);
    if (res.success) {
      refreshStateFromStore();
      showToast('Dokumentasi realisasi hasil berhasil disimpan.');
    }
  };

  const handleVerifyRealization = async (
    id: string,
    status: 'Terverifikasi' | 'Perlu Perbaikan',
    notes?: string
  ) => {
    const res = await store.verifyRealization(id, status, notes);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Realisasi hasil diverifikasi: ${status}.`);
    }
  };

  // Handlers for Regions
  const handleAddRegion = (data: Omit<Region, 'id'>) => {
    const res = store.addRegion(data);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Wilayah ${data.name} berhasil ditambahkan.`);
    }
    return res;
  };

  // Handlers for Users & Roles
  const handleRoleChange = (newRole: UserRole) => {
    const updated = { ...currentUser, role: newRole };
    store.setCurrentUser(updated);
    setCurrentUser(updated);
    showToast(`Beralih ke peran: ${newRole}`);
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    await store.updateUserRole(userId, newRole);
    refreshStateFromStore();
    showToast('Hak akses pengguna berhasil diperbarui.');
  };

  const handleAddUser = async (data: Omit<User, 'id'>) => {
    const res = await store.addUser(data);
    if (res.success) {
      refreshStateFromStore();
      showToast(`Pengguna ${data.name} berhasil ditambahkan.`);
    }
    return { success: true };
  };

  const handleResetData = async () => {
    if (window.confirm('Reset seluruh data ke kondisi awal demo sistem Sahabat ADU?')) {
      await store.resetToDefault();
      refreshStateFromStore();
      showToast('Data berhasil direset ke bawaan.');
    }
  };

  // Stats calculation
  const dashboardStats = store.getDashboardStats();
  const pendingUnitsCount = volunteerUnits.filter((u) => u.status === 'Menunggu Verifikasi').length;
  const urgentAspirationsCount = aspirations.filter(
    (a) => a.priority === 'Darurat' || a.priority === 'Tinggi'
  ).length;

  const inspectedAspiration = selectedAspirationId
    ? aspirations.find((a) => a.id === selectedAspirationId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl bg-slate-900 text-white text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-700">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main App Navbar - Only rendered in internal portal view (Clean single-header for public pre-login view) */}
      {!isWebsiteView && (
        <Navbar
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onResetData={handleResetData}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isWebsiteView={isWebsiteView}
          onToggleWebsiteView={(web) => setIsWebsiteView(web)}
          onOpenSubmitAspiration={() => setIsSubmitModalOpen(true)}
          onLogout={() => {
            setIsWebsiteView(true);
            showToast('Anda telah keluar ke halaman publik.');
          }}
        />
      )}

      {/* CONDITIONAL ROOT VIEW: WEBSITE PUBLIK (BERANDA KEKINIAN SEBELUM LOGIN) vs PORTAL DASHBOARD KERJA TIM */}
      {isWebsiteView ? (
        <LandingWebsite
          stats={dashboardStats}
          aspirations={aspirations}
          realizations={realizations}
          regions={regions}
          categories={categories}
          users={users}
          onLogin={(user) => {
            setCurrentUser(user);
            store.setCurrentUser(user);
            setIsWebsiteView(false);
            showToast(`Selamat datang di Portal, ${user.name} (${user.role})`);
          }}
          onOpenDashboard={() => setIsWebsiteView(false)}
          onOpenSubmitAspiration={() => setIsSubmitModalOpen(true)}
          onSelectAspiration={(id) => setSelectedAspirationId(id)}
          onNavigateTab={(tab) => {
            setIsWebsiteView(false);
            setActiveTab(tab);
          }}
          onQuickSubmitAspiration={async (data) => {
            const res = await store.addAspiration({
              title: data.message.length > 50 ? `${data.message.slice(0, 47)}...` : data.message,
              description: data.message,
              category_id: data.category_id || 'cat-infra',
              region_id: 'kec-pasarkemis',
              village_id: data.village_id || 'vil-pasarkemis',
              source_type: 'Masyarakat',
              submitted_at: new Date().toISOString().split('T')[0],
              location_description: 'Wilayah Kecamatan Pasarkemis',
              attachment_urls: [],
              priority: 'Sedang',
              current_status: 'Diajukan',
              created_by: data.name,
              reporter_name: data.name,
              reporter_contact: data.contact
            });
            if (res.success && res.data) {
              refreshStateFromStore();
              showToast(`Aspirasi ${res.data.aspiration_number} berhasil dikirim!`);
            }
            return res;
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'volunteer-map') setSelectedUnitOnMap(null);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            userRole={currentUser.role}
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onNavigateToWebsite={() => setIsWebsiteView(true)}
            onLogout={() => {
              setIsWebsiteView(true);
              showToast('Anda telah keluar ke halaman publik.');
            }}
            pendingVerificationsCount={pendingUnitsCount}
            urgentAspirationsCount={urgentAspirationsCount}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {/* Back to Website bar */}
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <LayoutDashboard className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-slate-800">
                    Portal Kerja Tim & Dewan: {activeTab.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setIsWebsiteView(true)}
                  className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Kembali ke Website Publik</span>
                </button>
              </div>

              {/* VIEW 1: DASHBOARD UTAMA */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  stats={dashboardStats}
                  units={volunteerUnits}
                  aspirations={aspirations}
                  regions={regions}
                  categories={categories}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectAspiration={(id) => setSelectedAspirationId(id)}
                />
              )}

              {/* VIEW 2: UNIT RELAWAN RT/RW */}
              {activeTab === 'volunteers' && (
                <VolunteerUnitList
                  units={volunteerUnits}
                  regions={regions}
                  userRole={currentUser.role}
                  auditLogs={auditLogs}
                  onAddUnit={handleAddUnit}
                  onUpdateUnit={handleUpdateUnit}
                  onSetStatus={handleSetUnitStatus}
                  onViewOnMap={handleViewUnitOnMap}
                />
              )}

              {/* VIEW 3: PETA RELAWAN WILAYAH */}
              {activeTab === 'volunteer-map' && (
                <VolunteerMap
                  units={volunteerUnits}
                  regions={regions}
                  userRole={currentUser.role}
                  selectedUnitFromParent={selectedUnitOnMap}
                  onClearSelectedUnit={() => setSelectedUnitOnMap(null)}
                />
              )}

              {/* VIEW 4: ASPIRASI MASYARAKAT */}
              {activeTab === 'aspirations' && (
                <AspirationList
                  aspirations={aspirations}
                  regions={regions}
                  categories={categories}
                  volunteerUnits={volunteerUnits}
                  userRole={currentUser.role}
                  onSelectAspiration={(id) => setSelectedAspirationId(id)}
                  onAddAspiration={handleAddAspiration}
                />
              )}

              {/* VIEW 5: PETA ASPIRASI */}
              {activeTab === 'aspiration-map' && (
                <AspirationMap
                  aspirations={aspirations}
                  regions={regions}
                  categories={categories}
                  userRole={currentUser.role}
                  onSelectAspiration={(id) => setSelectedAspirationId(id)}
                />
              )}

              {/* VIEW 6: REALISASI & TINDAK LANJUT */}
              {activeTab === 'realizations' && (
                <RealizationManagement
                  realizations={realizations}
                  aspirations={aspirations}
                  regions={regions}
                  userRole={currentUser.role}
                  onVerify={handleVerifyRealization}
                  onSelectAspiration={(id) => setSelectedAspirationId(id)}
                />
              )}

              {/* VIEW 7: LAPORAN PER WILAYAH */}
              {activeTab === 'reports' && (
                <RegionalReportView
                  regions={regions}
                  units={volunteerUnits}
                  aspirations={aspirations}
                  realizations={realizations}
                  categories={categories}
                />
              )}

              {/* VIEW 8: STRUKTUR WILAYAH */}
              {activeTab === 'regions' && (
                <RegionManagementView
                  regions={regions}
                  volunteerUnits={volunteerUnits}
                  userRole={currentUser.role}
                  onAddRegion={handleAddRegion}
                />
              )}

              {/* VIEW 9: PENGGUNA & RBAC */}
              {activeTab === 'users' && (
                <UserManagementView
                  users={users}
                  currentUser={currentUser}
                  regions={regions}
                  onUpdateRole={handleUpdateUserRole}
                  onAddUser={handleAddUser}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Floating Mobile Action Button for Quick Aspiration Submission */}
      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="p-3.5 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-800 transition-all border-2 border-white"
          aria-label="Kirim Aspirasi Warga"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      {/* Global Submit Aspiration Modal */}
      <SubmitAspirationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        regions={regions}
        categories={categories}
        onAddAspiration={handleAddAspiration}
      />

      {/* Global Aspiration Detail Modal */}
      {inspectedAspiration && (
        <AspirationDetailModal
          aspiration={inspectedAspiration}
          regions={regions}
          categories={categories}
          followUps={followUps.filter((f) => f.aspiration_id === inspectedAspiration.id)}
          realizations={realizations.filter((r) => r.aspiration_id === inspectedAspiration.id)}
          userRole={currentUser.role}
          onClose={() => setSelectedAspirationId(null)}
          onUpdateStatus={handleUpdateAspirationStatus}
          onAddFollowUp={handleAddFollowUp}
          onAddRealization={handleAddRealization}
          onVerifyRealization={handleVerifyRealization}
        />
      )}
    </div>
  );
}
