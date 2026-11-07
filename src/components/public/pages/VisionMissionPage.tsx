import React from 'react';
import {
  Compass,
  Target,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  Users2,
  HeartHandshake,
  Sparkles,
  MessageSquareText,
  FileText
} from 'lucide-react';

interface VisionMissionPageProps {
  onBackToHome: () => void;
  onOpenSubmitAspiration: () => void;
  onNavigateTo: (page: string) => void;
}

export const VisionMissionPage: React.FC<VisionMissionPageProps> = ({
  onBackToHome,
  onOpenSubmitAspiration,
  onNavigateTo
}) => {
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
            <span className="text-amber-300 font-bold">Visi & Misi</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Arah Kebijakan & Komitmen 2024 - 2029</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Visi & Misi Pelayanan
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Komitmen strategis AW Maulana & Uju dalam mewujudkan Kabupaten Tangerang yang adil, maju, transparan, dan sejahtera.
              </p>
            </div>

            <button
              onClick={onOpenSubmitAspiration}
              className="self-start md:self-center px-6 py-3 bg-[#E5A93C] hover:bg-[#d99b26] text-[#002b66] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Suarakan Aspirasi</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Visi Utama Card */}
        <div className="relative bg-gradient-to-br from-blue-900 via-[#1b255a] to-[#0f173f] rounded-3xl p-8 sm:p-12 text-white shadow-xl overflow-hidden border border-blue-800">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visi Besar Kepemimpinan</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black leading-snug tracking-tight text-white">
              "Terwujudnya Masyarakat Pasarkemis, Sindang Jaya, dan Rajeg yang Sejahtera, Berdaya Saing, dan Bermartabat Melalui Pelayanan Aspirasi Bersih, Transparan, dan Berkelanjutan."
            </h2>

            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed pt-2">
              Visi ini menegaskan komitmen kuat bahwa jabatan legislatif adalah mandat suci rakyat untuk menghadirkan perubahan nyata di tingkat akar rumput (RT dan RW) tanpa diskriminasi.
            </p>
          </div>
        </div>

        {/* 5 Pilar Misi Strategis */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Agenda Implementasi
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              5 Pilar Misi Pelayanan Masyarakat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Langkah terstruktur untuk merealisasikan visi kesejahteraan bersama di Kabupaten Tangerang
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Misi 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047AB] flex items-center justify-center font-black text-lg border border-blue-200">
                01
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Infrastruktur Lingkungan & Anti-Banjir
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengawal pembangunan fisik drainase primer-sekunder, penataan saluran permukiman, dan pengaspalan/betonisasi jalan lingkungan yang ramah iklim dan tahan lama.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pengawalan Pokir Komisi IV</span>
              </div>
            </div>

            {/* Misi 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg border border-amber-200">
                02
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Serap Aspirasi Cepat & Digital
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menyediakan saluran pengaduan daring dengan tracking resi dan dialog tatap muka berkala ke tingkat RT/RW untuk menyerap kebutuhan mendesak warga secara langsung.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Respon Maksimal 2x24 Jam</span>
              </div>
            </div>

            {/* Misi 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-200">
                03
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Kesehatan Keluarga & Pengentasan Stunting
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penguatan sarana alat ukur antropometri posyandu, bantuan makanan bergizi bagi balita dan ibu hamil, serta advokasi BPJS bagi warga kurang mampu.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Generasi Sehat Bebas Stunting</span>
              </div>
            </div>

            {/* Misi 4 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-lg border border-purple-200">
                04
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Pemberdayaan Pemuda & Ekonomi Kreatif
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membuka akses pelatihan kerja digital, sertifikasi profesi, dan dukungan permodalan alat usaha untuk kelompok kepemudaan dan UMKM di Dapil 4.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kemandirian Wirausaha Warga</span>
              </div>
            </div>

            {/* Misi 5 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-4 md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg border border-indigo-200">
                05
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Pendidikan Inklusif & Beasiswa Pelajar Berprestasi
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memastikan tidak ada anak putus sekolah di Kabupaten Tangerang karena kendala biaya dengan memfasilitasi beasiswa pendidikan dari jenjang sekolah dasar hingga perguruan tinggi melalui program kemitraan daerah.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Masa Depan Generasi Emas Tangerang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wilayah Kerja & Target Layanan */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase">Cakupan Wilayah Tugas</span>
              <h4 className="text-xl font-black text-slate-900">Dapil 4 Kabupaten Tangerang</h4>
            </div>
            <div className="text-xs font-bold text-slate-500">
              Kecamatan: Pasarkemis • Sindang Jaya • Rajeg
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-sm text-slate-900 mb-1">Kecamatan Pasarkemis</h5>
              <p className="text-xs text-slate-500 mb-2">Pusat permukiman padat dan industri</p>
              <span className="text-xs font-semibold text-blue-700">Kutabumi, Gelam Jaya, Kutajaya, Pasarkemis</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-sm text-slate-900 mb-1">Kecamatan Sindang Jaya</h5>
              <p className="text-xs text-slate-500 mb-2">Kawasan aglomerasi permukiman baru</p>
              <span className="text-xs font-semibold text-blue-700">Sindang Sono, Sindang Panon, Wanakerta</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-sm text-slate-900 mb-1">Kecamatan Rajeg</h5>
              <p className="text-xs text-slate-500 mb-2">Kawasan perkembangan hunian asri</p>
              <span className="text-xs font-semibold text-blue-700">Sukamulya, Rajeg Mulya, Tanjakan</span>
            </div>
          </div>
        </div>

        {/* Page Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={() => onNavigateTo('profil')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Profil AW Maulana & Uju</span>
          </button>

          <button
            onClick={() => onNavigateTo('program')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0047AB] text-white hover:bg-blue-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Selanjutnya: Program Kerja</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
