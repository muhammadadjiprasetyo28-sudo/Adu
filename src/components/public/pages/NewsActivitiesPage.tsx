import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  MapPin,
  Search,
  ArrowLeft,
  ChevronRight,
  Eye,
  Clock,
  Sparkles,
  Share2,
  X,
  MessageSquareText,
  Building,
  UserCheck
} from 'lucide-react';
import dialogWargaImg from '../../../assets/images/dialog_warga_1792041066839.jpg';
import pemudaKreatifImg from '../../../assets/images/pemuda_kreatif_1792041119636.jpg';

interface NewsItem {
  id: string;
  title: string;
  category: 'dialog' | 'infra' | 'sosial' | 'pemuda';
  categoryLabel: string;
  date: string;
  location: string;
  summary: string;
  content: string[];
  imageUrl: string;
  author: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 'news-1',
    title: 'AW Maulana & Uju Gelar Dialog Aspirasi Warga di Desa Makmur Pasarkemis',
    category: 'dialog',
    categoryLabel: 'Dialog Aspirasi',
    date: '12 Oktober 2026',
    location: 'Desa Makmur, Kec. Pasarkemis',
    summary: 'Ratusan warga dan perwakilan pengurus RT/RW berkumpul membahas percepatan normalisasi drainase pencegah genangan serta peningkatan penerangan jalan lingkungan.',
    content: [
      'Kegiatan serap aspirasi tatap muka ini dipimpin langsung oleh AW Maulana, S.Sos. bersama Ibu Hj. Uju. Warga menyampaikan langsung keluhan terkait pendangkalan saluran sekunder yang kerap meluap saat hujan berintensitas tinggi.',
      'AW Maulana menegaskan bahwa usulan perbaikan drainase telah dicatat ke dalam sistem tracking Sahabat ADU dan akan segera dimasukkan ke dalam usulan Pokir DPRD Kabupaten Tangerang untuk penganggaran dinas terkait.',
      'Ibu Uju juga berdialog dengan para ibu-ibu kader Posyandu untuk mendata kebutuhan timbangan digital antropometri serta paket nutrisi balita.'
    ],
    imageUrl: dialogWargaImg,
    author: 'Tim Media Sahabat ADU'
  },
  {
    id: 'news-2',
    title: 'Pemberdayaan Pemuda Kreatif: Penyerahan Bantuan Alat Produksi & Workshop Digital',
    category: 'pemuda',
    categoryLabel: 'Pemberdayaan Pemuda',
    date: '8 Oktober 2026',
    location: 'Sindang Jaya & Rajeg',
    summary: 'Mendorong kemandirian ekonomi generasi muda melalui fasilitasi pelatihan pemasaran digital dan penyerahan bantuan alat usaha bagi wirausaha pemula.',
    content: [
      'Inisiatif Sahabat ADU melalui program kerja berkelanjutan memfasilitasi 120 pemuda dari berbagai komunitas kreatif di Kecamatan Sindang Jaya dan Rajeg.',
      'Dalam sambutannya, AW Maulana & Uju menekankan pentingnya penguasaan keterampilan digital dan keberanian memulai usaha mandiri untuk memperkuat perekonomian daerah.',
      'Peserta workshop mendapatkan pendampingan sertifikasi serta jejaring kemitraan UMKM binaan Sahabat ADU.'
    ],
    imageUrl: pemudaKreatifImg,
    author: 'Koordinator Pemuda Dapil 4'
  },
  {
    id: 'news-3',
    title: 'Tinjauan Lapangan Proyek Betonisasi Jalan Lingkungan RW 06 Kelurahan Kutabumi',
    category: 'infra',
    categoryLabel: 'Pembangunan Fisik',
    date: '3 Oktober 2026',
    location: 'Kutabumi, Pasarkemis',
    summary: 'Memastikan kualitas pengerjaan betonisasi jalan poros perumahan memenuhi spesifikasi teknis tinggi dan bebas hambatan saluran air.',
    content: [
      'Peninjauan lapangan dilakukan bersama pengurus RT/RW setempat guna mengawasi langsung realisasi betonisasi jalan gang sepanjang 450 meter.',
      'Jalan yang sebelumnya berlubang dan becek kini dapat dilalui dengan nyaman dan aman oleh kendaraan warga, anak sekolah, dan pedagang keliling.',
      'Ketua RW menyampaikan apresiasi tinggi atas gerak cepat tim Sahabat ADU dalam memperjuangkan aspirasi warga hingga tuntas.'
    ],
    imageUrl: dialogWargaImg,
    author: 'Divisi Pengawasan Infrastruktur'
  },
  {
    id: 'news-4',
    title: 'Penyaluran Bantuan Sarana Antropometri Posyandu & Edukasi Gizi Anak Balita',
    category: 'sosial',
    categoryLabel: 'Kesehatan & Posyandu',
    date: '28 September 2026',
    location: 'Kecamatan Rajeg',
    summary: 'Distribusi alat ukur tinggi dan berat badan digital berstandar Kemenkes RI untuk 15 Posyandu dalam rangka pencegahan stunting terpadu.',
    content: [
      'Sebagai bentuk komitmen terhadap kesehatan anak balita, Ibu Hj. Uju menyerahkan secara simbolis alat antropometri kit presisi tinggi kepada perwakilan bidan desa dan kader posyandu.',
      'Program ini bertujuan mempercepat deteksi dini gangguan tumbuh kembang anak sehingga penanganan nutrisi dapat segera diintervensi oleh dinas kesehatan setempat.',
      'Kader posyandu mengapresiasi perhatian nyata terhadap fasilitas kesehatan tingkat akar rumput.'
    ],
    imageUrl: pemudaKreatifImg,
    author: 'Tim Sosial & Kemasyarakatan'
  }
];

interface NewsActivitiesPageProps {
  onBackToHome: () => void;
  onOpenSubmitAspiration: () => void;
  onNavigateTo: (page: string) => void;
}

export const NewsActivitiesPage: React.FC<NewsActivitiesPageProps> = ({
  onBackToHome,
  onOpenSubmitAspiration,
  onNavigateTo
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-amber-300 font-bold">Berita & Kegiatan</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-3">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Dokumentasi Lapangan & Publikasi Resmi</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Berita & Kegiatan Lapangan
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Liputan kegiatan silaturahmi, serap aspirasi, progres pembangunan fisik, dan pengabdian sosial AW Maulana & Uju di tengah masyarakat.
              </p>
            </div>

            <button
              onClick={onOpenSubmitAspiration}
              className="self-start md:self-center px-6 py-3 bg-[#E5A93C] hover:bg-[#d99b26] text-[#002b66] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Undang ke Wilayah Anda</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#0047AB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Berita
            </button>
            <button
              onClick={() => setSelectedCategory('dialog')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedCategory === 'dialog'
                  ? 'bg-[#0047AB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Dialog Aspirasi
            </button>
            <button
              onClick={() => setSelectedCategory('infra')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedCategory === 'infra'
                  ? 'bg-[#0047AB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pembangunan Fisik
            </button>
            <button
              onClick={() => setSelectedCategory('sosial')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedCategory === 'sosial'
                  ? 'bg-[#0047AB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sosial & Posyandu
            </button>
            <button
              onClick={() => setSelectedCategory('pemuda')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedCategory === 'pemuda'
                  ? 'bg-[#0047AB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pemuda & UMKM
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berita atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col group"
            >
              <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                    {item.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {item.location}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Baca Selengkapnya
                    <ChevronRight className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] text-slate-400">{item.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty Search Result */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-700">Tidak ada berita yang cocok</h4>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
          </div>
        )}

        {/* Jadwal Agenda Kegiatan Mendatang */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase">Jadwal Lapangan</span>
              <h3 className="text-xl font-black text-slate-900">Agenda Kegiatan Mendatang</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Bulan Berjalan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-blue-700 font-bold">
                <span>18 Oktober 2026</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900 text-[10px]">19:30 WIB</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Rembug Warga RW 08 Kutajaya</h4>
              <p className="text-xs text-slate-600">Diskusi perbaikan sarana jalan poros dan pengusulan gorong-gorong baru.</p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-700 font-bold">
                <span>21 Oktober 2026</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px]">09:00 WIB</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Kunjungan Posyandu Cempaka Sindang Jaya</h4>
              <p className="text-xs text-slate-600">Pemberian makanan tambahan balita dan edukasi pencegahan stunting.</p>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-purple-700 font-bold">
                <span>25 Oktober 2026</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-900 text-[10px]">14:00 WIB</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Temu Wicara Karang Taruna Rajeg</h4>
              <p className="text-xs text-slate-600">Fasilitasi program pelatihan keterampilan kerja dan peralatan digital.</p>
            </div>
          </div>
        </div>

        {/* Page Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={() => onNavigateTo('program')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Program Kerja</span>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0047AB] text-white hover:bg-blue-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Kembali ke Beranda</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Article Detail Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {activeArticle.categoryLabel}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeArticle.date}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {activeArticle.location}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {activeArticle.title}
              </h2>

              <div className="rounded-2xl overflow-hidden max-h-80 bg-slate-900">
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Penulis: {activeArticle.author}</span>
              <button
                onClick={() => {
                  setActiveArticle(null);
                  onOpenSubmitAspiration();
                }}
                className="px-4 py-2 bg-[#E5A93C] text-[#002b66] font-extrabold text-xs rounded-xl hover:bg-[#d99b26] transition-colors"
              >
                Suarakan Aspirasi Terkait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
