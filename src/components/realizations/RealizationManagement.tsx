import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  Building,
  Check,
  X,
  ExternalLink,
  MessageSquareText
} from 'lucide-react';
import {
  RealizationRecord,
  Aspiration,
  Region,
  UserRole
} from '../../types/index.ts';
import { canUserVerifyRealization } from '../../utils/rules.ts';
import * as XLSX from 'xlsx';

interface RealizationManagementProps {
  realizations: RealizationRecord[];
  aspirations: Aspiration[];
  regions: Region[];
  userRole: UserRole;
  onVerify: (id: string, status: 'Terverifikasi' | 'Perlu Perbaikan', notes?: string) => void;
  onSelectAspiration: (id: string) => void;
}

export const RealizationManagement: React.FC<RealizationManagementProps> = ({
  realizations,
  aspirations,
  regions,
  userRole,
  onVerify,
  onSelectAspiration
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Verify modal state
  const [selectedRealization, setSelectedRealization] = useState<RealizationRecord | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  const canVerify = canUserVerifyRealization(userRole);

  const filtered = realizations.filter((r) => {
    if (filterType !== 'ALL' && r.realization_type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.verification_status !== filterStatus) return false;
    return true;
  });

  const handleExportExcel = () => {
    const data = filtered.map((r) => {
      const asp = aspirations.find((a) => a.id === r.aspiration_id);
      const vil = regions.find((rg) => rg.id === asp?.village_id)?.name || '-';
      return {
        'ID Realisasi': r.id,
        'No. Aspirasi': asp?.aspiration_number || '-',
        'Judul Aspirasi': asp?.title || '-',
        Wilayah: vil,
        'Tipe Hasil': r.realization_type,
        'Deskripsi Realisasi': r.description,
        'Tanggal Lapor': r.reported_at,
        'Status Verifikasi': r.verification_status,
        'Diverifikasi Oleh': r.verified_by || '-',
        'Tanggal Verifikasi': r.verified_at ? r.verified_at.split('T')[0] : '-',
        'Catatan Verifikasi': r.notes || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Realisasi Aspirasi Sahabat ADU');
    XLSX.writeFile(wb, `Realisasi_Sahabat_ADU_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleOpenVerifyModal = (r: RealizationRecord) => {
    setSelectedRealization(r);
    setVerificationNotes(r.notes || '');
  };

  const handleConfirmVerify = (status: 'Terverifikasi' | 'Perlu Perbaikan') => {
    if (!selectedRealization) return;
    onVerify(selectedRealization.id, status, verificationNotes.trim() || undefined);
    setSelectedRealization(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Dokumentasi & Verifikasi Realisasi Kerja Nyata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemisahan tegas antara tanggapan administratif dengan realisasi fisik yang tuntas terverifikasi
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Laporan Realisasi</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipe Realisasi</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Jenis Hasil</option>
            <option value="Hasil Fisik yang Telah Diverifikasi">Hasil Fisik yang Telah Diverifikasi</option>
            <option value="Tindak Lanjut Administratif">Tindak Lanjut Administratif</option>
            <option value="Proses Pekerjaan atau Program">Proses Pekerjaan atau Program</option>
            <option value="Tanggapan atau Informasi">Tanggapan atau Informasi</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Verifikasi</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Status Verifikasi</option>
            <option value="Terverifikasi">Terverifikasi (Sah)</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
          </select>
        </div>
      </div>

      {/* Realizations Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
            Tidak ada data realisasi yang cocok dengan filter.
          </div>
        ) : (
          filtered.map((rel) => {
            const asp = aspirations.find((a) => a.id === rel.aspiration_id);
            const village = regions.find((r) => r.id === asp?.village_id);
            const isVerified = rel.verification_status === 'Terverifikasi';

            return (
              <div
                key={rel.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-mono font-bold text-[11px]">
                      {asp?.aspiration_number || 'ASP'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : rel.verification_status === 'Menunggu Verifikasi'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {rel.verification_status}
                    </span>
                  </div>

                  {/* Title & Region */}
                  <h3
                    onClick={() => onSelectAspiration(rel.aspiration_id)}
                    className="text-sm font-bold text-slate-900 mt-2.5 hover:text-blue-700 cursor-pointer line-clamp-2"
                  >
                    {asp?.title || 'Aspirasi Warga'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Wilayah: <strong className="text-slate-700">{village?.name}</strong> • Dilaporkan: {rel.reported_at}
                  </p>

                  <div className="mt-2.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {rel.realization_type}
                  </div>

                  <p className="mt-2 text-xs text-slate-700 leading-relaxed font-medium">
                    {rel.description}
                  </p>

                  {/* Before / After Photo Showcase */}
                  {(rel.before_image_url || rel.evidence_urls.length > 0) && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                      {rel.before_image_url && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                            Kondisi Awal
                          </span>
                          <img
                            src={rel.before_image_url}
                            alt="Before"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                      {rel.evidence_urls[0] && (
                        <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50">
                          <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                            Hasil Tuntas
                          </span>
                          <img
                            src={rel.evidence_urls[0]}
                            alt="After"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes / Berita Acara */}
                  {rel.notes && (
                    <p className="mt-2.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <strong className="text-slate-700">Catatan: </strong>
                      {rel.notes}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectAspiration(rel.aspiration_id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Lihat Kronologi Lengkap</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {canVerify && rel.verification_status !== 'Terverifikasi' && (
                    <button
                      onClick={() => handleOpenVerifyModal(rel)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verifikasi Bukti</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: VERIFIKASI REALISASI */}
      {selectedRealization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verifikasi Hasil Realisasi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pastikan pekerjaan fisik atau hasil administratif telah sesuai dengan usulan warga.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Verifikasi Tim Dewan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Telah ditinjau langsung bersama Ketua RW/RT pada tanggal..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRealization(null)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVerify('Perlu Perbaikan')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Perlu Perbaikan
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVerify('Terverifikasi')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Setujui & Terverifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
