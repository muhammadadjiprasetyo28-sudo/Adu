import React, { useState } from 'react';
import {
  MessageSquareText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Calendar,
  MapPin,
  Send,
  FileText,
  Check,
  ChevronRight,
  ShieldCheck,
  Plus,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import {
  Aspiration,
  FollowUpRecord,
  RealizationRecord,
  Region,
  AspirationCategory,
  UserRole,
  AspirationStatus,
  RealizationType
} from '../../types/index.ts';
import {
  canUserAccessContacts,
  canUserVerifyRealization,
  maskContact
} from '../../utils/rules.ts';

interface AspirationDetailModalProps {
  aspiration: Aspiration;
  regions: Region[];
  categories: AspirationCategory[];
  followUps: FollowUpRecord[];
  realizations: RealizationRecord[];
  userRole: UserRole;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: AspirationStatus, notes?: string) => void;
  onAddFollowUp: (record: Omit<FollowUpRecord, 'id' | 'created_at'>) => void;
  onAddRealization: (data: Omit<RealizationRecord, 'id' | 'created_at'>) => void;
  onVerifyRealization: (realizationId: string, status: 'Terverifikasi' | 'Perlu Perbaikan', notes?: string) => void;
}

export const AspirationDetailModal: React.FC<AspirationDetailModalProps> = ({
  aspiration,
  regions,
  categories,
  followUps,
  realizations,
  userRole,
  onClose,
  onUpdateStatus,
  onAddFollowUp,
  onAddRealization,
  onVerifyRealization
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'followup_form' | 'realization_form'>('timeline');

  // Follow-up form state
  const [flwActionType, setFlwActionType] = useState('Penyampaian Surat Rekomendasi Dewan');
  const [flwStatusChange, setFlwStatusChange] = useState<AspirationStatus>(aspiration.current_status);
  const [flwAgency, setFlwAgency] = useState('Dinas Bina Marga & Sumber Daya Air Kab. Tangerang');
  const [flwNotes, setFlwNotes] = useState('');
  const [flwMeetingNotes, setFlwMeetingNotes] = useState('');

  // Realization form state
  const [relDescription, setRelDescription] = useState('');
  const [relType, setRelType] = useState<RealizationType>('Hasil Fisik yang Telah Diverifikasi');
  const [relBeforePhoto, setRelBeforePhoto] = useState(aspiration.attachment_urls[0] || '');
  const [relEvidencePhoto, setRelEvidencePhoto] = useState('');
  const [relNotes, setRelNotes] = useState('');

  const canEdit = userRole === 'Admin Utama' || userRole === 'Admin Operasional' || userRole === 'Koordinator Wilayah';
  const canVerify = canUserVerifyRealization(userRole);
  const canSeeContacts = canUserAccessContacts(userRole);

  const category = categories.find((c) => c.id === aspiration.category_id);
  const village = regions.find((r) => r.id === aspiration.village_id);
  const subdistrict = regions.find((r) => r.id === aspiration.region_id);

  // Pipeline status steps
  const statusPipeline: AspirationStatus[] = [
    'Diajukan',
    'Verifikasi',
    'Terverifikasi',
    'Ditelaah',
    'Diteruskan kepada Pihak Terkait',
    'Dalam Proses',
    'Menunggu Tanggapan',
    'Tanggapan Diterima',
    'Realisasi Terverifikasi',
    'Ditutup'
  ];

  const currentStatusIndex = statusPipeline.indexOf(aspiration.current_status);

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flwNotes.trim()) return;

    onAddFollowUp({
      aspiration_id: aspiration.id,
      action_type: flwActionType,
      status_change: flwStatusChange !== aspiration.current_status ? flwStatusChange : undefined,
      target_agency: flwAgency.trim() || undefined,
      notes: flwNotes.trim(),
      meeting_notes: flwMeetingNotes.trim() || undefined,
      performed_by: userRole,
      follow_up_date: new Date().toISOString().split('T')[0]
    });

    setFlwNotes('');
    setFlwMeetingNotes('');
    setActiveTab('timeline');
  };

  const handleSaveRealization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relDescription.trim()) return;

    onAddRealization({
      aspiration_id: aspiration.id,
      description: relDescription.trim(),
      realization_type: relType,
      reported_at: new Date().toISOString().split('T')[0],
      before_image_url: relBeforePhoto.trim() || undefined,
      evidence_urls: relEvidencePhoto.trim() ? [relEvidencePhoto.trim()] : [],
      verification_status: canVerify ? 'Terverifikasi' : 'Menunggu Verifikasi',
      verified_by: canVerify ? userRole : undefined,
      verified_at: canVerify ? new Date().toISOString() : undefined,
      notes: relNotes.trim() || undefined
    });

    setRelDescription('');
    setRelEvidencePhoto('');
    setActiveTab('timeline');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {aspiration.aspiration_number}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {aspiration.submitted_at}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    aspiration.priority === 'Darurat'
                      ? 'bg-red-100 text-red-800'
                      : aspiration.priority === 'Tinggi'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Prioritas {aspiration.priority}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-2 tracking-tight">
                {aspiration.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category?.color || '#2563eb' }}
                  ></span>
                  {category?.name}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {village?.name}, {subdistrict?.name}
                </span>
                <span>&bull;</span>
                <span>Sumber: <strong className="text-slate-700">{aspiration.source_type}</strong></span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors self-end sm:self-start"
            >
              ✕
            </button>
          </div>

          {/* Structured Status Pipeline Progress Bar */}
          <div className="py-4 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Alur Penanganan Tindak Lanjut</span>
              <span className="text-blue-700 font-extrabold">{aspiration.current_status}</span>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-[650px] justify-between">
                {statusPipeline.map((st, idx) => {
                  const isPast = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <div key={st} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div
                          className={`absolute top-3 right-1/2 left-[-50%] h-1 -z-0 ${
                            idx <= currentStatusIndex ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        ></div>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                            : isPast
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] text-center mt-1 max-w-[70px] leading-tight font-medium ${
                          isCurrent
                            ? 'text-blue-800 font-bold'
                            : isPast
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-2 pt-4 pb-2 border-b border-slate-100">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Riwayat Tindak Lanjut & Bukti ({followUps.length + realizations.length})
            </button>

            {canEdit && (
              <>
                <button
                  onClick={() => setActiveTab('followup_form')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'followup_form'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Tindak Lanjut</span>
                </button>

                <button
                  onClick={() => setActiveTab('realization_form')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'realization_form'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+ Dokumentasi Realisasi</span>
                </button>
              </>
            )}
          </div>

          {/* TAB 1: TIMELINE & DETAILS */}
          {activeTab === 'timeline' && (
            <div className="py-4 space-y-5">
              {/* Deskripsi & Lokasi */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    Uraian Masalah & Usulan
                  </h4>
                  <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                    {aspiration.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Titik Lokasi</span>
                    <p className="font-semibold text-slate-800">{aspiration.location_description}</p>
                    {aspiration.rw_number && (
                      <span className="text-[11px] text-blue-700">
                        RW {aspiration.rw_number} {aspiration.rt_number ? `/ RT ${aspiration.rt_number}` : ''}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pelapor / Kontak</span>
                    <p className="font-semibold text-slate-800">
                      {aspiration.reporter_name || 'Masyarakat Umum'}
                    </p>
                    <p className="font-mono text-slate-500 text-[11px]">
                      {canSeeContacts
                        ? aspiration.reporter_contact || '-'
                        : maskContact(aspiration.reporter_contact)}
                    </p>
                  </div>
                </div>

                {/* Foto Bukti Awal */}
                {aspiration.attachment_urls.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Dokumentasi Kondisi Awal
                    </span>
                    <div className="flex gap-2">
                      {aspiration.attachment_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative group rounded-xl overflow-hidden border border-slate-200 block w-28 h-20"
                        >
                          <img
                            src={url}
                            alt="Bukti Awal"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Realization Showcase Card (Jika sudah ada realisasi) */}
              {realizations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Dokumentasi Hasil Realisasi Nyata
                  </h4>

                  {realizations.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {rel.realization_type}
                        </span>
                        <span className="font-bold text-[11px] text-emerald-900">
                          Status: {rel.verification_status}
                        </span>
                      </div>

                      <p className="text-slate-800 font-medium leading-relaxed">
                        {rel.description}
                      </p>

                      {/* Before / After Photo Comparison */}
                      {(rel.before_image_url || rel.evidence_urls.length > 0) && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {rel.before_image_url && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2">
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                KONDISI AWAL (BEFORE)
                              </span>
                              <img
                                src={rel.before_image_url}
                                alt="Before"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                                className="w-full h-28 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          {rel.evidence_urls[0] && (
                            <div className="border border-emerald-300 rounded-xl overflow-hidden bg-white p-2">
                              <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                                HASIL REALISASI (AFTER)
                              </span>
                              <img
                                src={rel.evidence_urls[0]}
                                alt="After"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                                className="w-full h-28 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-100">
                        <span>Dilaporkan: {rel.reported_at}</span>
                        {rel.verified_by && (
                          <span className="text-emerald-800 font-semibold">
                            Diverifikasi oleh: {rel.verified_by}
                          </span>
                        )}
                      </div>

                      {/* Verifikasi Tombol jika role berwenang */}
                      {canVerify && rel.verification_status === 'Menunggu Verifikasi' && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={() => onVerifyRealization(rel.id, 'Terverifikasi', 'Hasil fisik telah dicek tim')}
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800"
                          >
                            Setujui & Verifikasi Hasil
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Riwayat Catatan Tindak Lanjut Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Kronologi Koordinasi & Tindak Lanjut
                </h4>

                {followUps.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada catatan tindak lanjut. Gunakan tombol di atas untuk menambahkan.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 border-l-2 border-blue-200">
                    {followUps.map((flw) => (
                      <div key={flw.id} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>
                        <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span className="font-bold text-blue-800">{flw.action_type}</span>
                            <span>{flw.follow_up_date}</span>
                          </div>
                          {flw.target_agency && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mb-1.5">
                              <Building className="w-3 h-3 text-slate-500" />
                              <span>{flw.target_agency}</span>
                            </div>
                          )}
                          <p className="text-slate-800 font-medium leading-relaxed">{flw.notes}</p>
                          {flw.meeting_notes && (
                            <p className="mt-1 text-[11px] text-slate-500 italic">
                              Hasil Pembahasan: {flw.meeting_notes}
                            </p>
                          )}
                          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                            <span>Petugas: {flw.performed_by}</span>
                            {flw.status_change && (
                              <span className="font-semibold text-blue-700">
                                Status: {flw.status_change}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORM TAMBAH TINDAK LANJUT */}
          {activeTab === 'followup_form' && (
            <form onSubmit={handleSaveFollowUp} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Tindakan / Langkah
                </label>
                <select
                  value={flwActionType}
                  onChange={(e) => setFlwActionType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Verifikasi Lapangan">Verifikasi Lapangan Bersama RT/RW</option>
                  <option value="Penyampaian Surat Rekomendasi Dewan">Penyampaian Surat Rekomendasi Dewan</option>
                  <option value="Rapat Koordinasi OPD / Dinas">Rapat Koordinasi OPD / Dinas</option>
                  <option value="Advokasi Program Pokir Dewan">Advokasi Program Pokir Dewan (Aw Maulana / Uju)</option>
                  <option value="Tanggapan Resmi Diterima">Tanggapan Resmi Diterima dari Instansi</option>
                  <option value="Monitoring Progres Lapangan">Monitoring Progres Lapangan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Perbarui Status Aspirasi Menjadi
                </label>
                <select
                  value={flwStatusChange}
                  onChange={(e) => setFlwStatusChange(e.target.value as AspirationStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {statusPipeline.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instansi / Pihak yang Dituju / Terlibat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dinas Bina Marga & Sumber Daya Air Kab. Tangerang"
                  value={flwAgency}
                  onChange={(e) => setFlwAgency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tindak Lanjut & Koordinasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan isi koordinasi, nomor surat penyerahan, komitmen pihak terkait, atau jadwal pelaksanaan..."
                  value={flwNotes}
                  onChange={(e) => setFlwNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hasil Pertemuan / Notula (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Ringkasan poin kesepakatan pertemuan..."
                  value={flwMeetingNotes}
                  onChange={(e) => setFlwMeetingNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  Simpan Tindak Lanjut
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORM DOKUMENTASI REALISASI */}
          {activeTab === 'realization_form' && (
            <form onSubmit={handleSaveRealization} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bentuk / Jenis Hasil Realisasi
                </label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as RealizationType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Hasil Fisik yang Telah Diverifikasi">Hasil Fisik yang Telah Diverifikasi (Betonisasi, PJU, Drainase)</option>
                  <option value="Tindak Lanjut Administratif">Tindak Lanjut Administratif (Pengurusan Dokumen / SK)</option>
                  <option value="Proses Pekerjaan atau Program">Proses Pekerjaan atau Program (Pelatihan UMKM / Bansos)</option>
                  <option value="Tanggapan atau Informasi">Tanggapan atau Informasi Resmi Pemda</option>
                  <option value="Hasil Lainnya">Hasil Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Hasil Nyata yang Telah Terealisasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Uraikan detail pekerjaan yang telah selesai dikerjakan, volume, kondisi sekarang, dan manfaat bagi warga sekitar..."
                  value={relDescription}
                  onChange={(e) => setRelDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Foto Sebelum (Before)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={relBeforePhoto}
                    onChange={(e) => setRelBeforePhoto(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Foto Bukti Sesudah (After / Selesai)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={relEvidencePhoto}
                    onChange={(e) => setRelEvidencePhoto(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Verifikasi / Berita Acara Warga
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Berita acara serah terima pekerjaan ditandatangani Ketua RT/RW..."
                  value={relNotes}
                  onChange={(e) => setRelNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Simpan Bukti Realisasi
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
