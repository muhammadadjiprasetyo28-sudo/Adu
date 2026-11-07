import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  FileSpreadsheet,
  History,
  Phone,
  Building,
  AlertTriangle,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import {
  VolunteerUnit,
  Region,
  UserRole,
  AuditLog,
  UnitType,
  UnitStatus
} from '../../types/index.ts';
import {
  canUserAccessContacts,
  canUserVerifyUnits,
  maskContact
} from '../../utils/rules.ts';
import * as XLSX from 'xlsx';

interface VolunteerUnitListProps {
  units: VolunteerUnit[];
  regions: Region[];
  userRole: UserRole;
  auditLogs: AuditLog[];
  onAddUnit: (unit: Omit<VolunteerUnit, 'id' | 'created_at' | 'updated_at'>) => any;
  onUpdateUnit: (id: string, updates: Partial<VolunteerUnit>) => any;
  onSetStatus: (id: string, status: UnitStatus) => any;
  onViewOnMap: (unit: VolunteerUnit) => void;
}

export const VolunteerUnitList: React.FC<VolunteerUnitListProps> = ({
  units,
  regions,
  userRole,
  auditLogs,
  onAddUnit,
  onUpdateUnit,
  onSetStatus,
  onViewOnMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('ALL');
  const [filterVillage, setFilterVillage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formUnitType, setFormUnitType] = useState<UnitType>('RW');
  const [formKecamatan, setFormKecamatan] = useState<string>('kec-pasarkemis');
  const [formVillage, setFormVillage] = useState<string>('vil-kutabumi');
  const [formRwNumber, setFormRwNumber] = useState<string>('01');
  const [formRtNumber, setFormRtNumber] = useState<string>('01');
  const [formStatus, setFormStatus] = useState<UnitStatus>('Aktif');
  const [formCoordName, setFormCoordName] = useState<string>('');
  const [formCoordContact, setFormCoordContact] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Audit Log Drawer State
  const [selectedUnitLogs, setSelectedUnitLogs] = useState<AuditLog[] | null>(null);

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const villages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && (filterKecamatan === 'ALL' || r.parent_id === filterKecamatan)
  );

  const formAvailableVillages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && r.parent_id === formKecamatan
  );

  const canSeeContacts = canUserAccessContacts(userRole);
  const canVerify = canUserVerifyUnits(userRole);

  // Filter units
  const filteredUnits = units.filter((unit) => {
    if (filterType !== 'ALL' && unit.unit_type !== filterType) return false;
    if (filterKecamatan !== 'ALL' && unit.region_id !== filterKecamatan) return false;
    if (filterVillage !== 'ALL' && unit.village_id !== filterVillage) return false;
    if (filterStatus !== 'ALL' && unit.status !== filterStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const villageName = regions.find((r) => r.id === unit.village_id)?.name.toLowerCase() || '';
      const coord = (unit.coordinator_name || '').toLowerCase();
      const rwMatch = `rw ${unit.rw_number}`.includes(term);
      const rtMatch = unit.rt_number ? `rt ${unit.rt_number}`.includes(term) : false;
      return villageName.includes(term) || coord.includes(term) || rwMatch || rtMatch;
    }
    return true;
  });

  const handleOpenCreateModal = (type: UnitType = 'RW') => {
    setModalMode('create');
    setEditingId(null);
    setFormUnitType(type);
    setFormKecamatan('kec-pasarkemis');
    setFormVillage('vil-kutabumi');
    setFormRwNumber('01');
    setFormRtNumber('01');
    setFormStatus('Aktif');
    setFormCoordName('');
    setFormCoordContact('');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit: VolunteerUnit) => {
    setModalMode('edit');
    setEditingId(unit.id);
    setFormUnitType(unit.unit_type);
    setFormKecamatan(unit.region_id);
    setFormVillage(unit.village_id);
    setFormRwNumber(unit.rw_number);
    setFormRtNumber(unit.rt_number || '01');
    setFormStatus(unit.status);
    setFormCoordName(unit.coordinator_name || '');
    setFormCoordContact(unit.coordinator_contact || '');
    setFormNotes(unit.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Get approximate representative coordinate for village
    const vilObj = regions.find((r) => r.id === formVillage);
    const lat = vilObj ? vilObj.latitude + (Math.random() - 0.5) * 0.005 : -6.1685;
    const lng = vilObj ? vilObj.longitude + (Math.random() - 0.5) * 0.005 : 106.5562;

    if (modalMode === 'create') {
      const res = onAddUnit({
        unit_type: formUnitType,
        region_id: formKecamatan,
        village_id: formVillage,
        rw_number: formRwNumber.padStart(2, '0'),
        rt_number: formUnitType === 'RT' ? formRtNumber.padStart(2, '0') : undefined,
        status: formStatus,
        coordinator_name: formCoordName.trim() || undefined,
        coordinator_contact: formCoordContact.trim() || undefined,
        notes: formNotes.trim() || undefined,
        registered_at: new Date().toISOString().split('T')[0],
        verified_at: formStatus === 'Aktif' ? new Date().toISOString().split('T')[0] : undefined,
        latitude: lat,
        longitude: lng
      });

      if (!res.success) {
        setFormError(res.error || 'Terjadi kesalahan validasi.');
        return;
      }
    } else if (editingId) {
      const res = onUpdateUnit(editingId, {
        region_id: formKecamatan,
        village_id: formVillage,
        rw_number: formRwNumber.padStart(2, '0'),
        rt_number: formUnitType === 'RT' ? formRtNumber.padStart(2, '0') : undefined,
        status: formStatus,
        coordinator_name: formCoordName.trim() || undefined,
        coordinator_contact: formCoordContact.trim() || undefined,
        notes: formNotes.trim() || undefined
      });

      if (!res.success) {
        setFormError(res.error || 'Terjadi kesalahan saat menyimpan perubahan.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredUnits.map((u) => {
      const kecName = regions.find((r) => r.id === u.region_id)?.name || u.region_id;
      const vilName = regions.find((r) => r.id === u.village_id)?.name || u.village_id;
      return {
        'Tipe Unit': u.unit_type,
        'Nomor RW': `RW ${u.rw_number}`,
        'Nomor RT': u.rt_number ? `RT ${u.rt_number}` : '-',
        Kecamatan: kecName,
        'Desa / Kelurahan': vilName,
        Status: u.status,
        'Tanggal Daftar': u.registered_at,
        'Tanggal Verifikasi': u.verified_at || '-',
        'Nama Koordinator': u.coordinator_name || '-',
        'Kontak Koordinator': canSeeContacts ? u.coordinator_contact || '-' : '[DIRAHASIAKAN]',
        Catatan: u.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Unit Relawan Sahabat ADU');
    XLSX.writeFile(workbook, `Sahabat_ADU_Unit_Relawan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const openAuditLogs = (unit: VolunteerUnit) => {
    const logs = auditLogs.filter((l) => l.entity_id === unit.id);
    setSelectedUnitLogs(logs.length > 0 ? logs : [
      {
        id: 'initial',
        entity_type: 'volunteer_unit',
        entity_id: unit.id,
        action: 'CREATE',
        actor_name: 'Sistem Registrasi',
        actor_role: 'Admin',
        summary: `Pendaftaran ${unit.unit_type} ${unit.rw_number} pada ${unit.registered_at}`,
        timestamp: unit.created_at
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            Manajemen Unit Relawan (RT & RW)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit relawan resmi yang terdaftar sebagai basis pergerakan pelayanan Dapil Tangerang 4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          {canVerify && (
            <>
              <button
                onClick={() => handleOpenCreateModal('RW')}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Daftarkan Unit RW</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('RT')}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Daftarkan Unit RT</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari RW/RT, Desa, Koordinator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Tipe Unit */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Tipe (RW & RT)</option>
              <option value="RW">Hanya Unit RW</option>
              <option value="RT">Hanya Unit RT</option>
            </select>
          </div>

          {/* Filter Kecamatan */}
          <div>
            <select
              value={filterKecamatan}
              onChange={(e) => {
                setFilterKecamatan(e.target.value);
                setFilterVillage('ALL');
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Kecamatan</option>
              {kecamatans.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Desa / Kelurahan */}
          <div>
            <select
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Desa/Kelurahan</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Terdaftar">Terdaftar</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredUnits.length}</strong> unit relawan terfilter
          </span>
          {!canSeeContacts && (
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Kontak koordinator disamarkan untuk peran {userRole}
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tipe & Identitas</th>
                <th className="py-3.5 px-4">Wilayah Administratif</th>
                <th className="py-3.5 px-4">Status Unit</th>
                <th className="py-3.5 px-4">Koordinator</th>
                <th className="py-3.5 px-4">Kontak (Resmi)</th>
                <th className="py-3.5 px-4">Catatan / Posko</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Tidak ada unit relawan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const village = regions.find((r) => r.id === unit.village_id);
                  const kecamatan = regions.find((r) => r.id === unit.region_id);
                  return (
                    <tr key={unit.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Tipe & Identitas */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              unit.unit_type === 'RW'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            UNIT {unit.unit_type}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {unit.unit_type === 'RT' ? `RT ${unit.rt_number} / RW ${unit.rw_number}` : `RW ${unit.rw_number}`}
                          </span>
                        </div>
                      </td>

                      {/* Wilayah */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {village?.name || unit.village_id}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {kecamatan?.name || unit.region_id}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            unit.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : unit.status === 'Menunggu Verifikasi'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : unit.status === 'Terdaftar'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              unit.status === 'Aktif'
                                ? 'bg-emerald-500'
                                : unit.status === 'Menunggu Verifikasi'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          ></span>
                          {unit.status}
                        </span>
                      </td>

                      {/* Koordinator */}
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {unit.coordinator_name || (
                          <span className="text-slate-400 italic">Belum dicatat</span>
                        )}
                      </td>

                      {/* Kontak Koordinator (RBAC Protected) */}
                      <td className="py-3 px-4">
                        {canSeeContacts ? (
                          unit.coordinator_contact ? (
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                              {unit.coordinator_contact}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">
                            {maskContact(unit.coordinator_contact)}
                          </span>
                        )}
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                        {unit.notes || '-'}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Map Pin View */}
                          <button
                            onClick={() => onViewOnMap(unit)}
                            title="Tampilkan di Peta"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Audit Logs */}
                          <button
                            onClick={() => openAuditLogs(unit)}
                            title="Riwayat Perubahan"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit Unit */}
                          {canVerify && (
                            <button
                              onClick={() => handleOpenEditModal(unit)}
                              title="Edit Data Unit"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Verify Unit Button */}
                          {canVerify && unit.status === 'Menunggu Verifikasi' && (
                            <button
                              onClick={() => onSetStatus(unit.id, 'Aktif')}
                              title="Verifikasi Unit Menjadi Aktif"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </button>
                          )}

                          {/* Deactivate Button */}
                          {canVerify && unit.status === 'Aktif' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Nonaktifkan ${unit.unit_type} ${unit.rw_number}?`)) {
                                  onSetStatus(unit.id, 'Tidak Aktif');
                                }
                              }}
                              title="Nonaktifkan Unit"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DAFTARKAN / EDIT UNIT RELAWAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users2 className="w-5 h-5 text-blue-600" />
                {modalMode === 'create' ? `Daftarkan Unit Relawan ${formUnitType}` : `Edit Data Unit Relawan`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4 text-xs">
              {/* Tipe Unit Selector (Hanya saat create) */}
              {modalMode === 'create' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pilih Tipe Unit Relawan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormUnitType('RW')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                        formUnitType === 'RW'
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Unit RW (Basis Utama)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormUnitType('RT')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                        formUnitType === 'RT'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Unit RT (Terhubung ke RW)
                    </button>
                  </div>
                </div>
              )}

              {/* Kecamatan & Desa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                  <select
                    value={formKecamatan}
                    onChange={(e) => {
                      setFormKecamatan(e.target.value);
                      const available = regions.filter(
                        (r) => r.type === 'desa_kelurahan' && r.parent_id === e.target.value
                      );
                      if (available.length > 0) setFormVillage(available[0].id);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {kecamatans.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desa / Kelurahan</label>
                  <select
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {formAvailableVillages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nomor RW & Nomor RT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor RW (Wajib)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 01, 05"
                    value={formRwNumber}
                    onChange={(e) => setFormRwNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimal 1 unit RW terdaftar per desa</p>
                </div>

                {formUnitType === 'RT' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor RT (Wajib)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 02, 04"
                      value={formRtNumber}
                      onChange={(e) => setFormRtNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Harus berada dalam RW yang sama</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Keanggotaan Unit</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as UnitStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Aktif">Aktif (Telah diverifikasi)</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Terdaftar">Terdaftar</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              {/* Koordinator & Kontak (Opsional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Koordinator (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama perwakilan RT/RW"
                    value={formCoordName}
                    onChange={(e) => setFormCoordName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kontak Koordinator (Privat)
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxx (opsional)"
                    value={formCoordContact}
                    onChange={(e) => setFormCoordContact(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Hanya bisa dilihat oleh Admin/Dewan</p>
                </div>
              </div>

              {/* Catatan Posko / Wilayah */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Unit / Posko
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan posko relawan, nomor SK kepengurusan, atau catatan wilayah..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm"
                >
                  {modalMode === 'create' ? 'Daftarkan Unit' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: RIWAYAT AUDIT LOG UNIT */}
      {selectedUnitLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Riwayat Perubahan & Audit Log</h3>
                </div>
                <button
                  onClick={() => setSelectedUnitLogs(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {selectedUnitLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-blue-700">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="font-medium text-slate-800">{log.summary}</p>
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Oleh:</span>
                      <strong className="text-slate-700">{log.actor_name}</strong>
                      <span>({log.actor_role})</span>
                    </div>
                    {log.old_value && log.new_value && (
                      <div className="mt-2 text-[10px] bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400">Dari: </span>
                        <span className="font-semibold text-slate-600">{log.old_value}</span>
                        <span className="text-slate-400"> → Menjadi: </span>
                        <span className="font-semibold text-emerald-700">{log.new_value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedUnitLogs(null)}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Tutup Riwayat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
