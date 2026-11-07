import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Lock,
  Building
} from 'lucide-react';
import { User, UserRole, Region } from '../../types/index.ts';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  regions: Region[];
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (user: Omit<User, 'id'>) => any;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  regions,
  onUpdateRole,
  onAddUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Koordinator Wilayah');
  const [formRegionId, setFormRegionId] = useState('kec-pasarkemis');

  const roles: UserRole[] = [
    'Admin Utama',
    'Admin Operasional',
    'Koordinator Wilayah',
    'Operator RT/RW',
    'Viewer'
  ];

  const roleDescriptions: Record<UserRole, string> = {
    'Admin Utama': 'Anggota DPRD (Aw Maulana & Uju). Akses penuh seluruh konfigurasi, master wilayah, pengguna, dan laporan.',
    'Admin Operasional': 'Koordinator harian tim dewan. Mengelola aspirasi, verifikasi unit relawan, dan tindak lanjut dinas.',
    'Koordinator Wilayah': 'Koordinator tingkat kecamatan/desa. Memantau unit relawan RT/RW dan pengaduan di wilayah tugas.',
    'Operator RT/RW': 'Perwakilan pengurus RT/RW bergabung. Mengirim dan memperbarui informasi unit lokal.',
    'Viewer': 'Petugas pemantau / staf monitoring. Melihat statistik dan rekapitulasi data tanpa hak mengubah.'
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    onAddUser({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      role: formRole,
      assigned_region_id: formRegionId,
      active: true
    });

    setIsModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Manajemen Pengguna & Hak Akses (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan peran pengguna sistem Sahabat ADU sesuai dengan tingkat kewenangan operasional
          </p>
        </div>

        {currentUser.role === 'Admin Utama' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Akun Tim</span>
          </button>
        )}
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" />
          Matriks Hak Akses Peran Sistem (Role-Based Access Control)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {roles.map((r) => (
            <div
              key={r}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                currentUser.role === r
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-100'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r}</span>
                  {currentUser.role === r && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-sm">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {roleDescriptions[r]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Kontak & Email</th>
                <th className="py-3.5 px-4">Hak Akses (Peran)</th>
                <th className="py-3.5 px-4">Penugasan Wilayah</th>
                <th className="py-3.5 px-4">Status Akun</th>
                {currentUser.role === 'Admin Utama' && (
                  <th className="py-3.5 px-4 text-right">Ubah Peran</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {users.map((u) => {
                const assignedRegion = regions.find((r) => r.id === u.assigned_region_id)?.name || 'Seluruh Dapil 4';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] text-blue-700 font-semibold">(Anda Sedang Login)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600">{u.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.phone || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {assignedRegion}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Aktif
                      </span>
                    </td>
                    {currentUser.role === 'Admin Utama' && (
                      <td className="py-3 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateRole(u.id, e.target.value as UserRole)}
                          className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Tambah Akun Pengguna Tim
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Daftarkan anggota tim dewan dengan peran yang sesuai.
            </p>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama anggota tim / koordinator"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="nama@sahabatadu.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Wilayah Tugas</label>
                <select
                  value={formRegionId}
                  onChange={(e) => setFormRegionId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="kab-tangerang">Seluruh Dapil 4 Tangerang</option>
                  {regions
                    .filter((r) => r.type === 'kecamatan')
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
