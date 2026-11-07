import React, { useState } from 'react';
import {
  User,
  Award,
  BookOpen,
  Briefcase,
  Heart,
  ChevronRight,
  Shield,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  MessageSquareText,
  Building2,
  GraduationCap,
  Users,
  Home,
  CheckCheck,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import heroLeadersImg from '../../../assets/images/aw.webp';

interface ProfilePageProps {
  onBackToHome: () => void;
  onOpenSubmitAspiration: () => void;
  onNavigateTo: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBackToHome,
  onOpenSubmitAspiration,
  onNavigateTo
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'aw' | 'uju'>('both');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-in fade-in duration-300">
      {/* 1. Breadcrumb & Header Banner */}
      <section className="bg-gradient-to-r from-[#1e2468] via-[#262c76] to-[#2D307D] text-white py-10 sm:py-14 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-blue-200/80 mb-4">
            <button
              onClick={onBackToHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <ChevronRight className="w-3 h-3 text-blue-300/60" />
            <span className="text-amber-300 font-bold">Profil Tokoh</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Data & Informasi Resmi Berdasarkan Rekam Jejak Publik</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Profil AW Maulana, S.Sos. & Uju
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Mengenal rekam jejak, pengabdian 4 periode di legislatif, riwayat pendidikan, dan dedikasi kemasyarakatan mengawal aspirasi warga Pasar Kemis, Sindang Jaya, dan Rajeg (Kabupaten Tangerang).
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

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Leadership Overview Card with Photo */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden bg-[#2D307D] shadow-xl max-w-md w-full border border-blue-900/20">
              <img
                src={heroLeadersImg}
                alt="AW Maulana, S.Sos. & Uju"
                className="w-full h-auto object-cover object-top select-none"
              />
              <div className="p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent absolute bottom-0 inset-x-0 text-white text-center">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-[#002b66] font-black text-[10px] uppercase tracking-wider mb-1">
                  Sahabat ADU
                </div>
                <p className="text-base sm:text-lg font-black text-amber-300">AW Maulana, S.Sos. & Uju</p>
                <p className="text-xs text-blue-200">Kuta Baru, Kec. Pasar Kemis • Kab. Tangerang</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Rekam Jejak Teruji & Terpercaya</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              Pengabdian Berkelanjutan untuk Kesejahteraan Warga Kabupaten Tangerang
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>AW Maulana, S.Sos.</strong> bersama istri tercinta <strong>Ibu Uju</strong> hadir sebagai representasi kepemimpinan yang merakyat dan senantiasa hadir di tengah denyut kehidupan warga. Bertempat tinggal di Kelurahan Kuta Baru, Pasar Kemis, keduanya menjadi jembatan langsung antara kebutuhan akar rumput dengan kebijakan parlemen dan program sosial kemasyarakatan.
            </p>

            {/* Quick Metrics from Official Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#0047AB] font-mono block whitespace-nowrap">4 Periode</span>
                <span className="text-[11px] font-bold text-slate-600 block mt-0.5">DPRD Tangerang</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#0047AB] font-mono block whitespace-nowrap">25 Tahun</span>
                <span className="text-[11px] font-bold text-slate-600 block mt-0.5">PT Angkasa Pura</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-amber-600 font-mono block whitespace-nowrap">Fraksi PAN</span>
                <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Partai Politik</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-600 font-mono block whitespace-nowrap">Dapil 4</span>
                <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Pasar Kemis & Sekitar</span>
              </div>
            </div>

            {/* Domicile info badge */}
            <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Domisili:</strong> Jl. Gelatik Rt. 04/09, Kelurahan Kuta Baru, Kecamatan Pasar Kemis, Kabupaten Tangerang, Banten.
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Profil
            </button>
            <button
              onClick={() => setActiveTab('aw')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'aw'
                  ? 'bg-[#0047AB] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AW Maulana, S.Sos.
            </button>
            <button
              onClick={() => setActiveTab('uju')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'uju'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uju (Ibu Hj. Uju)
            </button>
          </div>
        </div>

        {/* Detailed Profile of Each Leader */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. AW Maulana, S.Sos. */}
          {(activeTab === 'both' || activeTab === 'aw') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 tracking-wider">
                      Anggota DPRD Kab. Tangerang
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Fraksi PAN
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">AW Maulana, S.Sos.</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Sekretaris Komisi III (2019–2024) • Terpilih Kembali Periode 2024–2029
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                  AWM
                </div>
              </div>

              {/* Bio summary */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>AW Maulana, S.Sos.</strong> (lahir di Jakarta, 4 Juli 1963) adalah tokoh politik senior dan wakil rakyat terpercaya dari Partai Amanat Nasional (PAN). Beliau dipercaya warga Kabupaten Tangerang mengabdi selama <strong>4 periode berturut-turut</strong> di DPRD Kabupaten Tangerang (2009–2014, 2014–2019, 2019–2024, dan 2024–2029).
                </p>

                {/* Riwayat Pendidikan */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <GraduationCap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Riwayat Pendidikan</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>S1 Ilmu Sosial (S.Sos.):</strong> Universitas Islam Syekh Yusuf (UNIS) Tangerang (Lulus 2004)
                        </li>
                        <li>
                          <strong>Pendidikan Menengah:</strong> STM Negeri 7 Jakarta (Lulus 1983)
                        </li>
                        <li>
                          <strong>Pendidikan Dasar & Lanjutan:</strong> SMPN 1 Tigaraksa & SDN Pasir Nangka
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Riwayat Pekerjaan & Karier */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <Briefcase className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Riwayat Pekerjaan & Pengabdian</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>Anggota DPRD Kab. Tangerang:</strong> 4 Periode (2009–2014, 2014–2019, 2019–2024, dan 2024–2029)
                        </li>
                        <li>
                          <strong>Sekretaris Komisi III DPRD:</strong> Periode 2019–2024 (Membidangi Keuangan, Aset Daerah, dan Perekonomian)
                        </li>
                        <li>
                          <strong>Karier Profesional:</strong> Karyawan PT Angkasa Pura (Persero) Bandara Soekarno-Hatta (1985–2010, pengabdian 25 tahun)
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Kiprah Organisasi & Dapil */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Organisasi & Daerah Pemilihan</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>Partai Politik:</strong> Pengurus DPD Partai Amanat Nasional (PAN) Kabupaten Tangerang
                        </li>
                        <li>
                          <strong>Dapil:</strong> Mewakili Kecamatan Pasar Kemis, Sindang Jaya, dan Rajeg
                        </li>
                        <li>
                          <strong>Komunitas:</strong> Pendiri & Pembina Utama Jaringan Relawan Sahabat ADU
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Fokus & Komitmen Legislatif */}
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-blue-900 text-xs sm:text-sm">Fokus Perjuangan Nyata di Parlemen</h5>
                      <ul className="list-disc list-inside text-xs text-blue-950/80 space-y-1 mt-1">
                        <li>Pengawalan Pokir (Pokok-Pokok Pikiran) untuk drainase dan penanganan banjir pemukiman di Pasar Kemis</li>
                        <li>Peningkatan alokasi infrastruktur jalan lingkungan dan sarana penerangan jalan umum (PJU)</li>
                        <li>Pendampingan permodalan dan pembinaan UMKM wirausaha pemuda kreatif</li>
                        <li>Pelayanan reses langsung door-to-door dan forum temu warga secara terbuka</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Uju (Ibu Hj. Uju) */}
          {(activeTab === 'both' || activeTab === 'uju') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 tracking-wider">
                      Tokoh Penggerak Masyarakat
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Pemberdayaan Perempuan
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Uju (Ibu Hj. Uju)</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Pendamping Setia Pengabdian AW Maulana, S.Sos. & Pembina Jaringan Perempuan
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                  UJU
                </div>
              </div>

              {/* Bio summary */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>Ibu Hj. Uju</strong> adalah istri tercinta sekaligus mitra perjuangan pengabdian AW Maulana, S.Sos. Bersama membesarkan 3 orang putra/putri di Kuta Baru, Pasar Kemis, Ibu Uju dikenal luas oleh warga sebagai sosok yang ramah, bersahaja, berjiwa sosial tinggi, dan aktif menggerakkan majelis taklim serta kegiatan pemberdayaan kaum ibu.
                </p>

                {/* Peran Sosial Kemasyarakatan */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <Heart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Peran Sosial & Ketahanan Keluarga</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>Pembina Majelis Taklim:</strong> Mengkoordinasikan silaturahmi majelis taklim dan pengajian kaum ibu se-Pasar Kemis dan sekitarnya.
                        </li>
                        <li>
                          <strong>Ibu Rumah Tangga Teladan:</strong> Membina ketahanan keluarga dengan 3 anak yang berpendidikan dan berakhlak mulia.
                        </li>
                        <li>
                          <strong>Pendamping Reses & Kunjungan:</strong> Selalu mendampingi AW Maulana, S.Sos. dalam menyapa warga, lansia, dan kaum dhuafa.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Penggerak Kesehatan & Posyandu */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Aksi Peduli Posyandu & Gizi Balita</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>Pengentasan Stunting:</strong> Mendorong penyediaan antropometri kit terstandar dan Pemberian Makanan Tambahan (PMT) balita di posyandu desa.
                        </li>
                        <li>
                          <strong>Kader Kesehatan Warga:</strong> Menjalin koordinasi aktif dengan bidan desa, puskesmas, dan kader posyandu tingkat RT/RW.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Aksi Kemanusiaan & Bakti Sosial */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <Home className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Rumah Peduli & Santunan Warga</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>
                          <strong>Posko Terbuka:</strong> Menjadikan kediaman di Jl. Gelatik Kuta Baru sebagai posko terbuka untuk silaturahmi warga yang membutuhkan bantuan darurat.
                        </li>
                        <li>
                          <strong>Bakti Sosial Berkala:</strong> Penyelenggaraan santunan rutin untuk ratusan anak yatim piatu dan pembagian paket sembako bagi janda lansia dan dhuafa.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Nilai Pengabdian */}
                  <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
                    <CheckCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900 text-xs sm:text-sm">Komitmen Pendampingan Warga</h5>
                      <p className="text-xs text-amber-950/80 leading-relaxed mt-1">
                        "Melayani dengan ketulusan hati, menguatkan peran ibu dalam membina generasi muda, dan memastikan setiap keluarga prasejahtera mendapatkan perhatian yang layak."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Nilai Utama Kepemimpinan Sahabat ADU */}
        <div className="bg-gradient-to-br from-[#1e2468] to-[#121644] rounded-3xl p-8 sm:p-12 text-white shadow-lg border border-blue-900/30">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Prinsip Kerja Sahabat ADU
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              4 Nilai Dasar Komitmen Pelayanan Warga
            </h3>
            <p className="text-xs sm:text-sm text-blue-200">
              Landasan moral dan operasional AW Maulana, S.Sos. & Ibu Uju dalam mengemban amanah rakyat Kabupaten Tangerang
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs space-y-2">
              <span className="text-amber-400 font-mono text-2xl font-black">01</span>
              <h4 className="font-bold text-base text-white">Merakyat & Turun Langsung</h4>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Menyerap persoalan warga bukan dari balik meja, melainkan berdialog langsung di gang-gang permukiman Kuta Baru, Pasar Kemis, Rajeg, dan Sindang Jaya.
              </p>
            </div>

            <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs space-y-2">
              <span className="text-amber-400 font-mono text-2xl font-black">02</span>
              <h4 className="font-bold text-base text-white">Transparan & Terlacak</h4>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Setiap aspirasi warga diberi nomor resi pelacakan digital melalui portal Sahabat ADU sehingga warga dapat memantau realisasi di lapangan.
              </p>
            </div>

            <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs space-y-2">
              <span className="text-amber-400 font-mono text-2xl font-black">03</span>
              <h4 className="font-bold text-base text-white">Solutif & Berpengalaman</h4>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Dengan pengalaman 4 periode di legislatif dan jejaring kemitraan eksekutif yang kuat, setiap aduan dikawal hingga tuntas.
              </p>
            </div>

            <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs space-y-2">
              <span className="text-amber-400 font-mono text-2xl font-black">04</span>
              <h4 className="font-bold text-base text-white">Inklusif & Mengayomi</h4>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Melayani seluruh lapisan masyarakat secara adil dan merata tanpa membedakan latar belakang sosial maupun pilihan politik.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer for this page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTo('visi-misi')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Lihat Visi & Misi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTo('program')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#0047AB] text-white hover:bg-blue-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Program Kerja</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
