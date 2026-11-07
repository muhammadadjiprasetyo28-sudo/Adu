import React, { useState } from 'react';
import {
  Briefcase,
  MessageSquareText,
  Building2,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  GraduationCap,
  Heart,
  Droplets,
  Lightbulb,
  ShieldCheck,
  Send
} from 'lucide-react';
import dialogWargaImg from '../../../assets/images/dialog_warga_1792041066839.jpg';
import pemudaKreatifImg from '../../../assets/images/pemuda_kreatif_1792041119636.jpg';

interface WorkProgramsPageProps {
  onBackToHome: () => void;
  onOpenSubmitAspiration: () => void;
  onNavigateTo: (page: string) => void;
}

export const WorkProgramsPage: React.FC<WorkProgramsPageProps> = ({
  onBackToHome,
  onOpenSubmitAspiration,
  onNavigateTo
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'dialog' | 'infra' | 'sosial' | 'pemuda'>('all');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#1e2468] via-[#262c76] to-[#2D307D] text-white py-10 sm:py-14 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-blue-200/80 mb-4">
            <button
              onClick={onBackToHome}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <ChevronRight className="w-3 h-3 text-blue-300/60" />
            <span className="text-amber-300 font-bold">Program Kerja</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Rencana Kerja Nyata & Pokir DPRD</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Program Kerja Unggulan
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Fokus utama: <strong>Dialog Aspirasi dan Pembangunan Berkelanjutan</strong> untuk kemaslahatan warga Dapil 4 Tangerang.
              </p>
            </div>

            <button
              onClick={onOpenSubmitAspiration}
              className="self-start md:self-center px-6 py-3 bg-[#E5A93C] hover:bg-[#d99b26] text-[#002b66] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Ajukan Usulan Program</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Spotlight Program Unggulan Header */}
        <div className="bg-gradient-to-br from-blue-900 via-[#1b255a] to-[#0f173f] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-blue-800">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Program Induk Prioritas</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Dialog Aspirasi dan Pembangunan Berkelanjutan
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Sebuah gagasan transformasi pelayanan publik di mana setiap kebijakan pembangunan berangkat dari suara nyata warga di tingkat RT/RW dan diwujudkan dengan standar konstruksi bermutu tinggi serta berorientasi jangka panjang.
            </p>
          </div>
        </div>

        {/* 2 Pilar Utama Program Unggulan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pilar 1: Dialog Aspirasi */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0047AB] text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageSquareText className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
                  Pilar Pertama
                </span>
                <h3 className="text-2xl font-black text-slate-900">Dialog Aspirasi Warga</h3>
                <p className="text-xs text-slate-500 font-medium">Penyerapan aspirasi bottom-up tanpa sekat birokrasi</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={dialogWargaImg}
                alt="Dokumentasi Dialog Aspirasi Warga"
                className="w-full h-48 object-cover"
              />
              <div className="p-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Dokumentasi: Dialog Warga Desa Makmur, Pasarkemis</span>
                <span className="font-bold text-blue-700">Terbuka untuk Umum</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
                <h5 className="font-bold text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Forum Rembug Warga Rutin</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Kunjungan langsung berkala ke posko RW, majelis taklim, dan balai warga untuk mendengarkan problem riil lingkungan secara tatap muka.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
                <h5 className="font-bold text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Digital Tracking Resi Aspirasi</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Aspirasi yang masuk secara online atau offline dicatat dalam sistem dan diberi nomor registrasi publik sehingga progresnya transparan.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
                <h5 className="font-bold text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Pengawalan Pokok Pikiran (Pokir) DPRD</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Usulan krusial dimasukkan dalam penyusunan APBD Kabupaten Tangerang melalui instrumen Pokir Komisi IV.
                </p>
              </div>
            </div>
          </div>

          {/* Pilar 2: Pembangunan Berkelanjutan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">
                  Pilar Kedua
                </span>
                <h3 className="text-2xl font-black text-slate-900">Pembangunan Berkelanjutan</h3>
                <p className="text-xs text-slate-500 font-medium">Infrastruktur kuat, hijau, dan berdaya guna jangka panjang</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={pemudaKreatifImg}
                alt="Dokumentasi Fasilitas & Pembangunan"
                className="w-full h-48 object-cover"
              />
              <div className="p-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Dokumentasi: Perencanaan Pembangunan Berkelanjutan</span>
                <span className="font-bold text-amber-700">Tahan Puluhan Tahun</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 space-y-1">
                <h5 className="font-bold text-xs text-amber-900 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span>Normalisasi & Revitalisasi Drainase</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Pengerukan endapan lumpur, pembangunan u-ditch beton pracetak, dan pelebaran saluran buang pencegah genangan air saat curah hujan tinggi.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 space-y-1">
                <h5 className="font-bold text-xs text-amber-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Peningkatan Mutu Jalan Lingkungan</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Betonisasi bertulang di gang-gang padat pemukiman warga agar mobilitas masyarakat lancar dan terbebas dari kubangan becek.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 space-y-1">
                <h5 className="font-bold text-xs text-amber-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Penerangan Jalan Tenaga Surya (Solar Cell)</span>
                </h5>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Pemasangan PJU ramah lingkungan dan hemat energi pada titik-titik rawan kriminalitas dan gang sempit pemukiman.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Aksi Tambahan Berbasis Kategori */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase">Portofolio Realisasi</span>
              <h3 className="text-2xl font-black text-slate-900">Daftar Program Kerja Tematik</h3>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Program
              </button>
              <button
                onClick={() => setSelectedFilter('infra')}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  selectedFilter === 'infra'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Infrastruktur
              </button>
              <button
                onClick={() => setSelectedFilter('sosial')}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  selectedFilter === 'sosial'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sosial & Posyandu
              </button>
              <button
                onClick={() => setSelectedFilter('pemuda')}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  selectedFilter === 'pemuda'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pemuda & UMKM
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(selectedFilter === 'all' || selectedFilter === 'infra') && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Infrastruktur Lingkungan
                </span>
                <h4 className="font-extrabold text-base text-slate-900">
                  Drainase Saluran Utama Kutabumi & Gelam Jaya
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Penyelesaian sumbatan saluran air sepanjang 1.200 meter di area perbatasan perumahan untuk meminimalkan genangan air saat hujan lebat.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Telah Berjalan
                  </span>
                  <span>Kab. Tangerang</span>
                </div>
              </div>
            )}

            {(selectedFilter === 'all' || selectedFilter === 'sosial') && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                  Kesehatan & Posyandu
                </span>
                <h4 className="font-extrabold text-base text-slate-900">
                  Sarana Ukur & Nutrisi Tambahan Balita Sehat
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pemberian bantuan alat antropometri digital akurat untuk 18 Posyandu serta paket makanan tambahan gizi tinggi untuk pencegahan stunting.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3.5 h-3.5" /> Tahap Distribusi
                  </span>
                  <span>18 Unit Posyandu</span>
                </div>
              </div>
            )}

            {(selectedFilter === 'all' || selectedFilter === 'pemuda') && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold">
                  Kewirausahaan Pemuda
                </span>
                <h4 className="font-extrabold text-base text-slate-900">
                  Pelatihan Digital Marketing & Modal Alat Usaha
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Workshop pemasaran produk online bagi 150 wirausaha muda dan bantuan stimulan alat produksi kerajinan serta kuliner rumahan.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Berkesinambungan
                  </span>
                  <span>Sindang Jaya & Rajeg</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Ajukan Aspirasi untuk Program Kerja */}
        <div className="bg-gradient-to-r from-[#003882] to-[#0047AB] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Punya Usulan untuk Program di Lingkungan Anda?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Sampaikan usulan jalan, drainase, lampu penerangan, atau bantuan sosial langsung ke AW Maulana & Uju sekarang.
            </p>
          </div>

          <button
            onClick={onOpenSubmitAspiration}
            className="px-8 py-3.5 bg-[#E5A93C] hover:bg-[#d99b26] text-[#002b66] font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            Kirim Usulan Aspirasi
          </button>
        </div>

        {/* Page Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={() => onNavigateTo('visi-misi')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Visi & Misi</span>
          </button>

          <button
            onClick={() => onNavigateTo('berita')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0047AB] text-white hover:bg-blue-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Selanjutnya: Berita & Kegiatan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
