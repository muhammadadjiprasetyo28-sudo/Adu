import React, { useState } from 'react';
import {
  MessageSquareText,
  AlertCircle,
  Building,
  User,
  MapPin,
  Sparkles,
  Send
} from 'lucide-react';
import {
  Aspiration,
  Region,
  AspirationCategory,
  AspirationPriority,
  AspirationSource
} from '../../types/index.ts';

interface SubmitAspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  regions: Region[];
  categories: AspirationCategory[];
  onAddAspiration: (
    data: Omit<Aspiration, 'id' | 'aspiration_number' | 'updated_at'>
  ) => any;
}

export const SubmitAspirationModal: React.FC<SubmitAspirationModalProps> = ({
  isOpen,
  onClose,
  regions,
  categories,
  onAddAspiration
}) => {
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
  const [formLatitude, setFormLatitude] = useState<number | null>(null);
  const [formLongitude, setFormLongitude] = useState<number | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  if (!isOpen) return null;

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const formVillages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && r.parent_id === formKecamatan
  );

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Perangkat tidak mendukung deteksi lokasi otomatis GPS.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLatitude(Number(pos.coords.latitude.toFixed(6)));
        setFormLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingGps(false);
        const vilObj = regions.find((r) => r.id === formVillage);
        if (vilObj) {
          setFormLatitude(Number(vilObj.latitude.toFixed(6)));
          setFormLongitude(Number(vilObj.longitude.toFixed(6)));
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formLocation.trim()) {
      setFormError('Judul, lokasi, dan penjelasan aspirasi wajib diisi.');
      return;
    }

    const vilObj = regions.find((r) => r.id === formVillage);
    const finalLat = formLatitude !== null ? formLatitude : (vilObj ? vilObj.latitude : -6.1685);
    const finalLng = formLongitude !== null ? formLongitude : (vilObj ? vilObj.longitude : 106.5562);

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
      latitude: finalLat,
      longitude: finalLng,
      attachment_urls: formPhotoUrl.trim() ? [formPhotoUrl.trim()] : [],
      priority: formPriority,
      current_status: 'Diajukan',
      created_by: formReporterName.trim() || 'Warga Masyarakat',
      reporter_name: formReporterName.trim() || undefined,
      reporter_contact: formReporterContact.trim() || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal mengirim aspirasi.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Layanan Aspirasi Warga Dapil 4
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Sampaikan Aspirasi / Usulan Warga
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaduan dan usulan perbaikan akan ditindaklanjuti oleh tim dewan Aw Maulana & Uju
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Judul */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Judul Aspirasi / Permasalahan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Perbaikan Gorong-gorong Mampet di Jl. Swadaya Pasarkemis"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Kategori & Prioritas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Bidang Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tingkat Urgensi</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as AspirationPriority)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Sedang">Sedang (Prioritas Standar)</option>
                  <option value="Tinggi">Tinggi (Sangat Dibutuhkan)</option>
                  <option value="Darurat">Darurat (Berbahaya / Mendesak)</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>
            </div>

            {/* Wilayah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kecamatan</label>
                <select
                  value={formKecamatan}
                  onChange={(e) => {
                    setFormKecamatan(e.target.value);
                    const available = regions.filter(
                      (r) => r.type === 'desa_kelurahan' && r.parent_id === e.target.value
                    );
                    if (available.length > 0) setFormVillage(available[0].id);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {kecamatans.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Desa / Kelurahan</label>
                <select
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {formVillages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RW & RT */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor RW (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 03"
                  value={formRwNumber}
                  onChange={(e) => setFormRwNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor RT (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 01"
                  value={formRtNumber}
                  onChange={(e) => setFormRtNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                />
              </div>
            </div>

            {/* Lokasi Acuan & Geotagging GPS Akurat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800">
                  Lokasi Spesifik / Patokan <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingGps}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isDetectingGps ? 'Mendeteksi GPS...' : 'Gunakan Koordinat GPS Akurat'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Contoh: Depan Balai Warga RW 03 Jl. Cempaka Putih"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
              {formLatitude !== null && formLongitude !== null && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-800">
                  <span>
                    📍 <strong>Titik GPS Terpasang:</strong> {formLatitude.toFixed(5)}, {formLongitude.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormLatitude(null);
                      setFormLongitude(null);
                    }}
                    className="text-emerald-700 hover:underline font-bold text-[10px]"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Uraian */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Penjelasan Lengkap Aspirasi / Kondisi Terkini <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan kondisi kerusakan, panjang/volume, dampak banjir/kerugian bagi warga sekitar..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              ></textarea>
            </div>

            {/* Identitas Pelapor (Aman / Privat) */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
              <span className="font-bold text-blue-900 block text-xs">
                Data Kontak Pelapor (Kerahasiaan Terjamin)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Nama Pelapor / Perwakilan Warga"
                  value={formReporterName}
                  onChange={(e) => setFormReporterName(e.target.value)}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="No. WhatsApp / HP (untuk konfirmasi)"
                  value={formReporterContact}
                  onChange={(e) => setFormReporterContact(e.target.value)}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Foto Bukti URL */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Foto Bukti Dokumentasi (URL Gambar / Dokumen)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formPhotoUrl}
                onChange={(e) => setFormPhotoUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md shadow-blue-700/25 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Kirimkan Aspirasi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
