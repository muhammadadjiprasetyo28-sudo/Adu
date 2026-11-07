import React, { useState } from 'react';
import {
  MessageSquareText,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Aspiration,
  Region,
  AspirationCategory,
  UserRole,
  AspirationStatus,
  AspirationPriority,
  AspirationSource,
  VolunteerUnit
} from '../../types/index.ts';
import { canUserAccessContacts, maskContact } from '../../utils/rules.ts';
import * as XLSX from 'xlsx';

interface AspirationListProps {
  aspirations: Aspiration[];
  regions: Region[];
  categories: AspirationCategory[];
  volunteerUnits: VolunteerUnit[];
  userRole: UserRole;
  onSelectAspiration: (id: string) => void;
  onAddAspiration: (
    data: Omit<Aspiration, 'id' | 'aspiration_number' | 'updated_at'>
  ) => any;
}

export const AspirationList: React.FC<AspirationListProps> = ({
  aspirations,
  regions,
  categories,
  volunteerUnits,
  userRole,
  onSelectAspiration,
  onAddAspiration
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('ALL');
  const [filterVillage, setFilterVillage] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // New Aspiration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'cat-infra');
  const [formKecamatan, setFormKecamatan] = useState('kec-pasarkemis');
  const [formVillage, setFormVillage] = useState('vil-kutabumi');
  const [formRwNumber, setFormRwNumber] = useState('');
  const [formRtNumber, setFormRtNumber] = useState('');
  const [formSource, setFormSource] = useState<AspirationSource>('Masyarakat');
  const [formPriority, setFormPriority] = useState<AspirationPriority>('Sedang');
  const [formLocation, setFormLocation] = useState('');
  const [formReporterName, setFormReporterName] = useState('');
  const [formReporterContact, setFormReporterContact] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canSeeReporterContacts = canUserAccessContacts(userRole);
  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const villages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && (filterKecamatan === 'ALL' || r.parent_id === filterKecamatan)
  );
  const formVillages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && r.parent_id === formKecamatan
  );

  // Status Filter Options
  const allStatuses: AspirationStatus[] = [
    'Diajukan',
    'Verifikasi',
    'Terverifikasi',
    'Ditelaah',
    'Diteruskan kepada Pihak Terkait',
    'Dalam Proses',
    'Menunggu Tanggapan',
    'Tanggapan Diterima',
    'Realisasi Terverifikasi',
    'Ditutup',
    'Ditolak'
  ];

  // Filtered Aspirations
  const filtered = aspirations.filter((asp) => {
    if (filterCategory !== 'ALL' && asp.category_id !== filterCategory) return false;
    if (filterStatus !== 'ALL' && asp.current_status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && asp.priority !== filterPriority) return false;
    if (filterKecamatan !== 'ALL' && asp.region_id !== filterKecamatan) return false;
    if (filterVillage !== 'ALL' && asp.village_id !== filterVillage) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const numMatch = asp.aspiration_number.toLowerCase().includes(term);
      const titleMatch = asp.title.toLowerCase().includes(term);
      const descMatch = asp.description.toLowerCase().includes(term);
      const locMatch = asp.location_description.toLowerCase().includes(term);
      const repMatch = (asp.reporter_name || '').toLowerCase().includes(term);
      return numMatch || titleMatch || descMatch || locMatch || repMatch;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory(categories[0]?.id || 'cat-infra');
    setFormKecamatan('kec-pasarkemis');
    setFormVillage('vil-kutabumi');
    setFormRwNumber('');
    setFormRtNumber('');
    setFormSource('Masyarakat');
    setFormPriority('Sedang');
    setFormLocation('');
    setFormReporterName('');
    setFormReporterContact('');
    setFormPhotoUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitAspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formLocation.trim()) {
      setFormError('Judul, deskripsi, dan lokasi wajib diisi.');
      return;
    }

    const vilObj = regions.find((r) => r.id === formVillage);
    const lat = vilObj ? vilObj.latitude + (Math.random() - 0.5) * 0.006 : -6.1685;
    const lng = vilObj ? vilObj.longitude + (Math.random() - 0.5) * 0.006 : 106.5562;

    const res = onAddAspiration({
      title: formTitle.trim(),
      description: formDesc.trim(),
      category_id: formCategory,
      region_id: formKecamatan,
      village_id: formVillage,
      rw_number: formRwNumber.trim() ? formRwNumber.trim().padStart(2, '0') : undefined,
      rt_number: formRtNumber.trim() ? formRtNumber.trim().padStart(2, '0') : undefined,
      source_type: formSource,
      submitted_at: new Date().toISOString().split('T')[0],
      location_description: formLocation.trim(),
      latitude: lat,
      longitude: lng,
      attachment_urls: formPhotoUrl.trim() ? [formPhotoUrl.trim()] : [],
      priority: formPriority,
      current_status: 'Diajukan',
      created_by: 'Operator Sahabat ADU',
      reporter_name: formReporterName.trim() || undefined,
      reporter_contact: formReporterContact.trim() || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan aspirasi.');
      return;
    }

    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((a) => {
      const cat = categories.find((c) => c.id === a.category_id)?.name || a.category_id;
      const kec = regions.find((r) => r.id === a.region_id)?.name || a.region_id;
      const vil = regions.find((r) => r.id === a.village_id)?.name || a.village_id;

      return {
        'No. Registrasi': a.aspiration_number,
        'Judul Aspirasi': a.title,
        Kategori: cat,
        Prioritas: a.priority,
        Status: a.current_status,
        Sumber: a.source_type,
        Kecamatan: kec,
        'Desa/Kelurahan': vil,
        RW: a.rw_number ? `RW ${a.rw_number}` : '-',
        RT: a.rt_number ? `RT ${a.rt_number}` : '-',
        'Lokasi Detail': a.location_description,
        'Tanggal Masuk': a.submitted_at,
        'Nama Pelapor': a.reporter_name || '-',
        'Kontak Pelapor': canSeeReporterContacts ? a.reporter_contact || '-' : '[DIRAHASIAKAN]'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aspirasi Warga');
    XLSX.writeFile(workbook, `Aspirasi_Sahabat_ADU_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-blue-600" />
            Aspirasi & Pengaduan Masyarakat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar komprehensif usulan dari warga dan unit RT/RW Dapil Tangerang 4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Aspirasi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor, judul, lokasi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Kategori */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Prioritas */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Darurat">Darurat</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          {/* Desa / Kelurahan */}
          <div>
            <select
              value={filterVillage}
              onChange={(e) => {
                setFilterVillage(e.target.value);
                setCurrentPage(1);
              }}
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
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Ditemukan <strong className="text-slate-800">{filtered.length}</strong> aspirasi
          </span>
          <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            Warga wilayah non-relawan tetap berhak menyampaikan aspirasi
          </span>
        </div>
      </div>

      {/* Aspirations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">No. & Tanggal</th>
                <th className="py-3.5 px-4">Judul & Kategori</th>
                <th className="py-3.5 px-4">Wilayah & Lokasi</th>
                <th className="py-3.5 px-4">Sumber Laporan</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Status Progres</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <MessageSquareText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Belum ada aspirasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((asp) => {
                  const cat = categories.find((c) => c.id === asp.category_id);
                  const village = regions.find((r) => r.id === asp.village_id);
                  return (
                    <tr
                      key={asp.id}
                      onClick={() => onSelectAspiration(asp.id)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      {/* No. Registrasi & Tanggal */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-blue-800 text-xs">
                          {asp.aspiration_number}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{asp.submitted_at}</span>
                        </div>
                      </td>

                      {/* Judul & Kategori */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {asp.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#2563eb' }}
                          ></span>
                          <span className="text-[11px] font-medium text-slate-600">
                            {cat?.name || 'Infrastruktur'}
                          </span>
                        </div>
                      </td>

                      {/* Wilayah & Lokasi */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {village?.name || asp.village_id}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {asp.rw_number ? `RW ${asp.rw_number}` : ''}
                          {asp.rt_number ? ` / RT ${asp.rt_number}` : ''}
                          {asp.rw_number ? ' • ' : ''}
                          {asp.location_description}
                        </div>
                      </td>

                      {/* Sumber */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {asp.source_type}
                        </span>
                      </td>

                      {/* Prioritas */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            asp.priority === 'Darurat'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : asp.priority === 'Tinggi'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : asp.priority === 'Sedang'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asp.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            asp.current_status === 'Realisasi Terverifikasi'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : asp.current_status === 'Dalam Proses'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : asp.current_status === 'Menunggu Tanggapan'
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : asp.current_status === 'Tanggapan Diterima'
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {asp.current_status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAspiration(asp.id);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CATAT ASPIRASI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-blue-600" />
                  Pencatatan Aspirasi Masyarakat
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nomor registrasi unik akan otomatis diterbitkan oleh sistem
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAspiration} className="mt-4 space-y-4 text-xs">
              {/* Judul */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Ringkas Aspirasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perbaikan Gorong-gorong Rusak dan Banjir di Jl. Swadaya"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              {/* Kategori, Prioritas & Sumber */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AspirationPriority)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Darurat">Darurat (Mendesak)</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sumber Aspirasi</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as AspirationSource)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Masyarakat">Masyarakat Umum</option>
                    <option value="Unit RT">Unit RT</option>
                    <option value="Unit RW">Unit RW</option>
                    <option value="Kegiatan Lapangan">Kegiatan Lapangan</option>
                    <option value="Pertemuan / Reses">Pertemuan / Reses</option>
                  </select>
                </div>
              </div>

              {/* Wilayah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {formVillages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RW & RT Wilayah */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor RW (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 02"
                    value={formRwNumber}
                    onChange={(e) => setFormRwNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor RT (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 04"
                    value={formRtNumber}
                    onChange={(e) => setFormRtNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>

              {/* Lokasi Detail */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Lokasi / Titik Acuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Depan Masjid Baiturrahman Jl. Swadaya RT 03/02"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Deskripsi Lengkap */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Lengkap Aspirasi / Kondisi Terkini <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan secara rinci permasalahan, dampak terhadap warga, dan usulan solusi yang diharapkan..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              {/* Data Pelapor (Privat / Opsional) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Data Pelapor (Dijamin Kerahasiaannya)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama Pelapor / Perwakilan"
                      value={formReporterName}
                      onChange={(e) => setFormReporterName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="No. WhatsApp / HP (Opsional)"
                      value={formReporterContact}
                      onChange={(e) => setFormReporterContact(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Foto Bukti Awal (URL) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Foto Bukti Kondisi Awal (URL Dokumen / Gambar)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... atau tautan foto dokumentasi"
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Buttons */}
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
                  Simpan & Terbitkan Nomor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
