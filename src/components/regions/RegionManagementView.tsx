import React, { useState } from 'react';
import {
  Network,
  Plus,
  Building,
  MapPin,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Region, UserRole, VolunteerUnit } from '../../types/index.ts';

interface RegionManagementViewProps {
  regions: Region[];
  volunteerUnits: VolunteerUnit[];
  userRole: UserRole;
  onAddRegion: (region: Omit<Region, 'id'>) => { success: boolean; error?: string };
}

export const RegionManagementView: React.FC<RegionManagementViewProps> = ({
  regions,
  volunteerUnits,
  userRole,
  onAddRegion
}) => {
  const [selectedKecId, setSelectedKecId] = useState<string>('kec-pasarkemis');

  // Add region modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'kecamatan' | 'desa_kelurahan'>('desa_kelurahan');
  const [formParentId, setFormParentId] = useState('kec-pasarkemis');
  const [formCode, setFormCode] = useState('');
  const [formLat, setFormLat] = useState('-6.1685');
  const [formLng, setFormLng] = useState('106.5562');
  const [formRwEst, setFormRwEst] = useState('10');
  const [formRtEst, setFormRtEst] = useState('45');
  const [formError, setFormError] = useState<string | null>(null);

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const currentKec = regions.find((r) => r.id === selectedKecId);
  const villagesInKec = regions.filter(
    (r) => r.type === 'desa_kelurahan' && r.parent_id === selectedKecId
  );

  const canManage = userRole === 'Admin Utama';

  const handleOpenAddModal = (type: 'kecamatan' | 'desa_kelurahan' = 'desa_kelurahan') => {
    setFormType(type);
    setFormName('');
    setFormParentId(selectedKecId);
    setFormCode('');
    setFormLat(currentKec ? String(currentKec.latitude) : '-6.1685');
    setFormLng(currentKec ? String(currentKec.longitude) : '106.5562');
    setFormRwEst('10');
    setFormRtEst('45');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama wilayah wajib diisi.');
      return;
    }

    const res = onAddRegion({
      name: formName.trim(),
      type: formType,
      parent_id: formType === 'desa_kelurahan' ? formParentId : 'kab-tangerang',
      code: formCode.trim().toUpperCase() || undefined,
      latitude: parseFloat(formLat) || -6.1685,
      longitude: parseFloat(formLng) || 106.5562,
      total_rw_estimate: parseInt(formRwEst, 10) || 10,
      total_rt_estimate: parseInt(formRtEst, 10) || 45
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menambahkan wilayah.');
      return;
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Manajemen Struktur Wilayah Dinamis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarki: Kabupaten Tangerang &rarr; Kecamatan &rarr; Desa/Kelurahan &rarr; Unit RW &rarr; Unit RT
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal('desa_kelurahan')}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Desa/Kelurahan</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('kecamatan')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kecamatan</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Hierarchy Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Kecamatan Selector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            Daftar Kecamatan Dapil
          </h3>

          <div className="space-y-2">
            {kecamatans.map((k) => {
              const vilCount = regions.filter((r) => r.parent_id === k.id).length;
              const rwCount = volunteerUnits.filter((u) => u.region_id === k.id && u.unit_type === 'RW').length;
              const isSelected = selectedKecId === k.id;

              return (
                <div
                  key={k.id}
                  onClick={() => setSelectedKecId(k.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{k.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {vilCount} Desa/Kel &bull; {rwCount} Unit RW Bergabung
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-slate-300'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Villages in Selected Subdistrict */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Desa / Kelurahan di {currentKec?.name || 'Kecamatan'}
              </h3>
              <p className="text-xs text-slate-500">
                Data resmi administratif dan rincian unit relawan yang telah tercatat
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {villagesInKec.length} Wilayah
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {villagesInKec.map((vil) => {
              const vilRwUnits = volunteerUnits.filter((u) => u.village_id === vil.id && u.unit_type === 'RW');
              const vilRtUnits = volunteerUnits.filter((u) => u.village_id === vil.id && u.unit_type === 'RT');
              const activeRw = vilRwUnits.filter((u) => u.status === 'Aktif').length;
              const activeRt = vilRtUnits.filter((u) => u.status === 'Aktif').length;

              return (
                <div
                  key={vil.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 transition-all bg-slate-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded-sm">
                      {vil.code || 'DES'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {vil.latitude.toFixed(3)}, {vil.longitude.toFixed(3)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{vil.name}</h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Unit RW:</span>
                    <strong className="text-blue-800 font-bold">
                      {activeRw} / {vilRwUnits.length} RW
                    </strong>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Unit RT:</span>
                    <strong className="text-indigo-800 font-bold">
                      {activeRt} / {vilRtUnits.length} RT
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH WILAYAH DINAMIS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              Tambah Wilayah Administratif
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan data wilayah tanpa perlu mengubah kode sumber aplikasi.
            </p>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRegion} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Wilayah</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('desa_kelurahan')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      formType === 'desa_kelurahan'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Desa / Kelurahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('kecamatan')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      formType === 'kecamatan'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Kecamatan
                  </button>
                </div>
              </div>

              {formType === 'desa_kelurahan' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Induk Kecamatan</label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {kecamatans.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Wilayah (Resmi Kemendagri) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desa Tanjakan / Kelurahan Sindang Sari"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Singkatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: TJK"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi RW</label>
                  <input
                    type="number"
                    value={formRwEst}
                    onChange={(e) => setFormRwEst(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  Simpan Wilayah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
