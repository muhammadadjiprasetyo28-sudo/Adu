import React, { useState } from 'react';
import {
  MessageSquareText,
  Search,
  CheckCircle2,
  Store,
  GraduationCap,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  Send,
  X,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Info,
  Check,
  Menu,
  Shield,
  UserCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  KeyRound,
  LogIn,
  AlertCircle,
  Building2,
  Users2
} from 'lucide-react';
import {
  Aspiration,
  RealizationRecord,
  Region,
  AspirationCategory,
  DashboardStats,
  User
} from '../../types/index.ts';
import { store } from '../../services/store.ts';

// Official leadership photo & documentation assets
import heroLeadersImg from '../../assets/images/aw.webp';
import newsDialogImg from '../../assets/images/dialog_warga_1792041066839.jpg';
import newsYouthImg from '../../assets/images/pemuda_kreatif_1792041119636.jpg';

// Dedicated Standalone Public Pages
import { ProfilePage } from './pages/ProfilePage';
import { VisionMissionPage } from './pages/VisionMissionPage';
import { WorkProgramsPage } from './pages/WorkProgramsPage';
import { NewsActivitiesPage } from './pages/NewsActivitiesPage';

interface LandingWebsiteProps {
  stats: DashboardStats;
  aspirations: Aspiration[];
  realizations: RealizationRecord[];
  regions: Region[];
  categories: AspirationCategory[];
  users: User[];
  onLogin: (user: User) => void;
  onOpenDashboard: () => void;
  onOpenSubmitAspiration: () => void;
  onSelectAspiration: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  onQuickSubmitAspiration: (data: {
    name: string;
    contact: string;
    village_id?: string;
    category_id?: string;
    message: string;
  }) => any;
}

export const LandingWebsite: React.FC<LandingWebsiteProps> = ({
  stats,
  aspirations,
  realizations,
  regions,
  categories,
  users,
  onLogin,
  onOpenDashboard,
  onOpenSubmitAspiration,
  onSelectAspiration,
  onNavigateTab,
  onQuickSubmitAspiration
}) => {
  const [currentPage, setCurrentPage] = useState<
    'beranda' | 'profil' | 'visi-misi' | 'program' | 'berita'
  >('beranda');
  const [activeNav, setActiveNav] = useState<string>('BERANDA');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick Kirim Aspirasi form state
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [senderVillage, setSenderVillage] = useState('vil-pasarkemis');
  const [senderCategory, setSenderCategory] = useState('cat-infra');
  const [senderMessage, setSenderMessage] = useState('');
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Public Aspirations Tracker State
  const [searchTrackingCode, setSearchTrackingCode] = useState('');
  const [trackedAspiration, setTrackedAspiration] = useState<Aspiration | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Content Modals (Login modal retained for access)
  const [activeModal, setActiveModal] = useState<'login' | null>(null);

  // Login Modal State
  const [loginTab, setLoginTab] = useState<'quick' | 'manual'>('quick');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const pasarkemisVillages = regions.filter((r) => r.type === 'desa_kelurahan' && r.parent_id === 'kec-pasarkemis');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!senderName.trim() || !senderMessage.trim()) {
      setFormError('Nama dan uraian pesan aspirasi wajib diisi.');
      return;
    }

    const res = onQuickSubmitAspiration({
      name: senderName.trim(),
      contact: senderContact.trim(),
      village_id: senderVillage,
      category_id: senderCategory,
      message: senderMessage.trim()
    });

    if (res.success && res.data) {
      setSubmitSuccessCode(res.data.aspiration_number);
      setSenderName('');
      setSenderContact('');
      setSenderMessage('');
    } else {
      setFormError(res.error || 'Gagal mengirim aspirasi.');
    }
  };

  const handleTrackAspiration = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchTrackingCode).trim();
    setTrackingSearched(true);
    if (!code) {
      setTrackedAspiration(null);
      return;
    }
    const found = aspirations.find(
      (a) =>
        a.aspiration_number.toLowerCase() === code.toLowerCase() ||
        a.title.toLowerCase().includes(code.toLowerCase()) ||
        a.id.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setTrackedAspiration(found);
      return;
    }
    try {
      const res = await fetch(`/api/public/track/${encodeURIComponent(code)}`);
      const resData = await res.json();
      if (resData.success && (resData.aspiration || resData.data)) {
        setTrackedAspiration(resData.aspiration || resData.data);
      } else {
        setTrackedAspiration(null);
      }
    } catch {
      setTrackedAspiration(null);
    }
  };

  const handleSelectQuickUser = async (user: User) => {
    setLoginError(null);
    const res = await store.loginWithApi({ userId: user.id });
    if (res.success && res.user) {
      setActiveModal(null);
      onLogin(res.user);
    } else {
      setLoginError(res.error || 'Gagal masuk akun tim.');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Silakan masukkan email / username petugas.');
      return;
    }
    const res = await store.loginWithApi({
      email: loginEmail.trim(),
      password: loginPassword.trim()
    });
    if (res.success && res.user) {
      setActiveModal(null);
      onLogin(res.user);
    } else {
      setLoginError(res.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi.');
    }
  };

  const navigateToPage = (
    page: 'beranda' | 'profil' | 'visi-misi' | 'program' | 'berita'
  ) => {
    setCurrentPage(page);
    setActiveNav(
      page === 'beranda'
        ? 'BERANDA'
        : page === 'profil'
        ? 'PROFIL'
        : page === 'visi-misi'
        ? 'VISI & MISI'
        : page === 'program'
        ? 'PROGRAM KERJA'
        : 'BERITA & KEGIATAN'
    );
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (currentPage !== 'beranda') {
      setCurrentPage('beranda');
      setActiveNav(id === 'section-cek-status' ? 'CEK STATUS' : 'ASPIRASI');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setActiveNav(id === 'section-cek-status' ? 'CEK STATUS' : 'ASPIRASI');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Helper status color badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Realisasi Terverifikasi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Tanggapan Diterima':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Dalam Proses':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Menunggu Tanggapan':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Ditolak/Duplikat':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. TOP NAVBAR SEBELUM LOGIN (BERSIH, MODERN, SATU HEADER) */}
      {/* 1. TOP NAVBAR SEBELUM LOGIN (BERSIH, MODERN, MENARIK, & RESPONSIVE) */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Brand Sisi Kiri */}
            <div
              onClick={() => navigateToPage('beranda')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-start leading-none">
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 inline-block -mt-1 shadow-xs animate-pulse"></span>
                    <span className="text-xl sm:text-2xl font-black text-[#003882] tracking-tight group-hover:text-[#0047AB] transition-colors">
                      Sahabat
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-[#003882] -mt-1 tracking-tight">
                    <span className="text-[#003882]">A</span>
                    <span className="text-[#003882]">D</span>
                    <span className="text-[#E5A93C]">U</span>
                  </span>
                </div>

                {/* Blue square with PAN Sun Emblem */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#0047AB] to-[#002b66] rounded-xl flex flex-col items-center justify-center text-white shadow-sm p-1 border border-blue-400/40 group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[8.5px] font-black tracking-widest leading-none mt-0.5 text-amber-300">
                    PAN
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Navigasi Tengah Desktop */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-extrabold tracking-wide uppercase">
              <button
                onClick={() => navigateToPage('beranda')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'beranda' && activeNav === 'BERANDA'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <span>BERANDA</span>
              </button>

              <button
                onClick={() => navigateToPage('profil')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'profil'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <span>PROFIL</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${currentPage === 'profil' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  AW & Uju
                </span>
              </button>

              <button
                onClick={() => navigateToPage('visi-misi')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'visi-misi'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <span>VISI & MISI</span>
              </button>

              <button
                onClick={() => navigateToPage('program')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'program'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <span>PROGRAM KERJA</span>
              </button>

              <button
                onClick={() => navigateToPage('berita')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'berita'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <span>BERITA & KEGIATAN</span>
              </button>

              <button
                onClick={() => scrollToSection('section-cek-status')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'beranda' && activeNav === 'CEK STATUS'
                    ? 'bg-blue-100 text-blue-900 font-black'
                    : 'text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/80'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>CEK STATUS</span>
              </button>

              <button
                onClick={() => scrollToSection('section-kirim-aspirasi')}
                className="px-3.5 py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center gap-1.5 cursor-pointer font-black"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-amber-600" />
                <span>ASPIRASI</span>
              </button>
            </div>

            {/* Tombol Masuk / Login Portal Tim Dewan */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveModal('login')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#003882] to-[#0047AB] hover:from-[#002b66] hover:to-[#003882] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md border border-blue-400/30 flex items-center gap-1.5 cursor-pointer"
                title="Buka Portal Internal Kerja Tim & Pemetaan RT/RW"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Portal Tim & Dewan</span>
                <span className="sm:hidden">Login</span>
              </button>

              {/* Mobile menu hamburger toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 text-xs font-bold uppercase tracking-wider shadow-lg">
            <button
              onClick={() => navigateToPage('beranda')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between ${
                currentPage === 'beranda'
                  ? 'bg-[#0047AB] text-white font-black'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>BERANDA</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => navigateToPage('profil')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between ${
                currentPage === 'profil'
                  ? 'bg-[#0047AB] text-white font-black'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>PROFIL (AW MAULANA & UJU)</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => navigateToPage('visi-misi')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between ${
                currentPage === 'visi-misi'
                  ? 'bg-[#0047AB] text-white font-black'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>VISI & MISI</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => navigateToPage('program')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between ${
                currentPage === 'program'
                  ? 'bg-[#0047AB] text-white font-black'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>PROGRAM KERJA</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => navigateToPage('berita')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between ${
                currentPage === 'berita'
                  ? 'bg-[#0047AB] text-white font-black'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>BERITA & KEGIATAN</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => scrollToSection('section-cek-status')}
              className="w-full text-left py-2.5 px-3.5 rounded-xl text-blue-700 bg-blue-50/80 flex items-center justify-between font-extrabold"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                CEK STATUS ASPIRASI
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('section-kirim-aspirasi')}
              className="w-full text-left py-2.5 px-3.5 rounded-xl text-amber-800 bg-amber-50 border border-amber-200 flex items-center justify-between font-extrabold"
            >
              <span className="flex items-center gap-2">
                <MessageSquareText className="w-3.5 h-3.5 text-amber-600" />
                SUARAKAN ASPIRASI ANDA
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveModal('login');
                }}
                className="w-full py-3 bg-gradient-to-r from-[#003882] to-[#0047AB] text-white font-black rounded-xl text-center flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Masuk ke Portal Internal Tim & RT/RW</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* RENDER KONTEN BERDASARKAN HALAMAN AKTIF */}
      {currentPage === 'profil' && (
        <ProfilePage
          onBackToHome={() => navigateToPage('beranda')}
          onOpenSubmitAspiration={() => scrollToSection('section-kirim-aspirasi')}
          onNavigateTo={(p: any) => navigateToPage(p)}
        />
      )}

      {currentPage === 'visi-misi' && (
        <VisionMissionPage
          onBackToHome={() => navigateToPage('beranda')}
          onOpenSubmitAspiration={() => scrollToSection('section-kirim-aspirasi')}
          onNavigateTo={(p: any) => navigateToPage(p)}
        />
      )}

      {currentPage === 'program' && (
        <WorkProgramsPage
          onBackToHome={() => navigateToPage('beranda')}
          onOpenSubmitAspiration={() => scrollToSection('section-kirim-aspirasi')}
          onNavigateTo={(p: any) => navigateToPage(p)}
        />
      )}

      {currentPage === 'berita' && (
        <NewsActivitiesPage
          onBackToHome={() => navigateToPage('beranda')}
          onOpenSubmitAspiration={() => scrollToSection('section-kirim-aspirasi')}
          onNavigateTo={(p: any) => navigateToPage(p)}
        />
      )}

      {/* JIKA BERADA DI BERANDA: TAMPILKAN HERO DAN SECTION UTAMA */}
      {currentPage === 'beranda' && (
        <>
          {/* 2. HERO SECTION DENGAN WARNA BACKGROUND PERSIS MENYATU DENGAN FOTO, FOTO FULL PROFESSIONAL & BADGE AW MAULANA & UJU */}
          <section className="relative overflow-hidden bg-[#2D2F7C] text-white pt-8 pb-10 sm:pt-14 sm:pb-16 border-b border-blue-900/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sisi Kiri: Teks & Headline Sesuai Gambar */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-sm">
                    <span className="text-white">SAHABAT </span>
                    <span className="text-[#E5A93C]">ADU</span>
                  </h1>

                  <div className="space-y-1 sm:space-y-2">
                    <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
                      Bersama <span className="text-[#E5A93C]">AW Maulana & Uju</span>,
                      <br />
                      Mewujudkan Aspirasi Rakyat
                    </h2>
                    <p className="text-sm sm:text-lg text-blue-100/90 font-medium tracking-wide">
                      Menuju Masa Depan Sejahtera
                    </p>
                  </div>

                  {/* Tombol Gold/Amber Pill Persis Referensi */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <button
                      onClick={() => scrollToSection('section-kirim-aspirasi')}
                      className="px-7 py-3 bg-[#E5A93C] hover:bg-[#d99b26] active:bg-[#c48718] text-[#002b66] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                    >
                      SUARAKAN ASPIRASI ANDA
                    </button>

                    <button
                      onClick={() => setActiveModal('login')}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm rounded-full backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Portal Kerja Tim RT/RW</span>
                    </button>
                  </div>
                </div>

                {/* Sisi Kanan: Foto Tokoh AW Maulana & Uju Dibuat FULL Tanpa Kotak / Oval & Background Menyatu 100% */}
                <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center relative">
                  <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl">
                    <img
                      src={heroLeadersImg}
                      alt="AW Maulana & Uju - Sahabat ADU"
                      className="w-full h-auto object-contain object-bottom select-none pointer-events-none"
                    />
                    {/* Soft gradient bottom melt */}
                    <div className="absolute bottom-0 inset-x-0 h-10 sm:h-16 bg-gradient-to-t from-[#2D2F7C] to-transparent pointer-events-none"></div>
                  </div>

                  {/* Floating Official Identity Pill Badge Berisi AW Maulana & Uju */}
                  <div className="mt-3 text-center lg:text-right px-2 pb-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] animate-pulse"></span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#E5A93C] tracking-wide">
                        AW Maulana & Uju
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-100/90 hidden sm:inline">
                        • Dapil 4 Kab. Tangerang
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* 2.1 IMPACT STATS RIBBON (TRANSPARANSI KINERJA PELAYANAN NYATA) */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
              <span className="text-2xl sm:text-3xl font-black text-[#0047AB] font-mono block">
                {stats.totalRwRegistered} RW / {stats.totalRtRegistered} RT
              </span>
              <span className="text-xs font-bold text-slate-700">Unit Relawan Terdaftar</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{stats.totalRwActive} RW & {stats.totalRtActive} RT aktif</p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono block">
                {stats.coveredVillagesCount} Desa / Kel
              </span>
              <span className="text-xs font-bold text-slate-700">Wilayah Pasarkemis</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Dapil 4 Kab. Tangerang</p>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono block">
                {stats.totalAspirations}
              </span>
              <span className="text-xs font-bold text-slate-700">Total Aspirasi Masuk</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{stats.inProgressAspirations} sedang dikawal</p>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono block">
                {stats.verifiedRealizationsCount}
              </span>
              <span className="text-xs font-bold text-slate-700">Realisasi Terverifikasi</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Bukti foto & berita acara resmi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAM UNGGULAN SECTION: DIALOG ASPIRASI DAN PEMBANGUNAN BERKELANJUTAN */}
      <section className="bg-slate-100/90 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          {/* Judul Section */}
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              PROGRAM UNGGULAN
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Fokus Pelayanan Legislatif & Kerja Nyata Sahabat ADU di Dapil 4 Tangerang
            </p>
            <div className="w-20 h-1 bg-amber-500 mx-auto mt-2.5 rounded-full"></div>
          </div>

          {/* 2 Kartu Program Unggulan: Dialog Aspirasi & Pembangunan Berkelanjutan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Card 1: Dialog Aspirasi */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/90 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0047AB]"></div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0047AB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <MessageSquareText className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                      Kemitraan Warga & RT/RW
                    </span>
                    <h3 className="text-xl font-black text-[#0c356a]">
                      Dialog Aspirasi
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                  Mekanisme penyerapan aspirasi langsung secara rutin, transparan, dan terbuka bersama para pengurus unit RW dan RT se-Kecamatan Pasarkemis dan sekitarnya. Setiap keluhan dan kebutuhan masyarakat dicatat resmi tanpa membebani preferensi politik warga.
                </p>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Forum Rembug Warga Berkala:</strong> Silaturahmi tatap muka dan serap masukan langsung di posko unit RW/RT.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Kanal Aspirasi Terbuka 24/7:</strong> Pencatatan digital ber-nomor registrasi unik untuk pengawalan resmi.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Advokasi Pokok Pikiran (Pokir):</strong> Penyaluran langsung ke rapat komisi DPRD dan dinas teknis daerah.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Suara Warga Dikawal Penuh</span>
                <button
                  onClick={() => scrollToSection('section-kirim-aspirasi')}
                  className="px-4 py-2 bg-blue-50 hover:bg-[#0047AB] text-[#0047AB] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Sampaikan Usulan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Pembangunan Berkelanjutan */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/90 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E5A93C]"></div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
                      Infrastruktur & Lingkungan Sehat
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Pembangunan Berkelanjutan
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                  Realisasi pembangunan fisik dan sarana lingkungan yang berdaya tahan lama, ramah lingkungan, dan berdampak nyata bagi kesejahteraan masyarakat Pasarkemis, Sindang Jaya, dan Rajeg secara berkesinambungan.
                </p>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>Normalisasi Saluran Drainase:</strong> Pengerukan dan perbaikan saluran air untuk menuntaskan titik rawan genangan banjir.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>Peningkatan Jalan Lingkungan:</strong> Betonisasi dan pengaspalan gang permukiman warga berkualitas tinggi.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>PJU Solar Cell & Sarana Posyandu:</strong> Penerangan jalan hemat energi dan sarana kesehatan balita/lansia.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Dokumentasi Terverifikasi</span>
                <button
                  onClick={() => scrollToSection('section-cek-status')}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Cek Bukti Realisasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BERITA TERBARU SECTION (PERSIS DENGAN DUA KARTU FOTO REAL PADA GAMBAR) */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          {/* Judul Section */}
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              BERITA TERBARU
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Grid 2 Berita Kegiatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Berita 1: Dialog Warga di Desa Makmur */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-52 overflow-hidden bg-slate-100">
                <img
                  src={newsDialogImg}
                  alt="Dialog Warga di Desa Makmur"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block font-mono">
                  27 Jan 2026
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Dialog Warga di Desa Makmur
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pertemuan silaturahmi dan serap aspirasi warga Pasarkemis bersama Aw Maulana & Uju membahas perbaikan drainase dan jalan lingkungan.
                </p>
              </div>
            </div>

            {/* Berita 2: Pemberdayaan Pemuda Kreatif */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-52 overflow-hidden bg-slate-100">
                <img
                  src={newsYouthImg}
                  alt="Pemberdayaan Pemuda Kreatif"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block font-mono">
                  27 Jan 2026
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Pemberdayaan Pemuda Kreatif
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pelatihan kewirausahaan pemuda dan pembentukan posko Sahabat ADU di tingkat unit RT/RW wilayah Pasarkemis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.1 FITUR KEKINIAN: CEK STATUS & TRANSPARANSI ASPIRASI PUBLIK */}
      <section id="section-cek-status" className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-700 tracking-wider uppercase bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Transparansi Pelayanan Publik
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Cek Progres & Realisasi Aspirasi Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2">
              Masyarakat dapat memantau langsung setiap tahap advokasi dewan, mulai dari pengajuan, telaah teknis, hingga dokumentasi realisasi fisik di lapangan.
            </p>
          </div>

          {/* Search Bar Tracker */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row gap-2.5 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTrackingCode}
                onChange={(e) => setSearchTrackingCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackAspiration()}
                placeholder="Masukkan Nomor Aspirasi, contoh: ASP-2026-0001..."
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0047AB]"
              />
            </div>
            <button
              onClick={() => handleTrackAspiration()}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0047AB] hover:bg-[#003c8f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Lacak Progres</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Coba nomor contoh:</span>
            {aspirations.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSearchTrackingCode(a.aspiration_number);
                  handleTrackAspiration(a.aspiration_number);
                }}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-blue-700 font-mono font-bold transition-colors"
              >
                {a.aspiration_number} ({a.current_status})
              </button>
            ))}
          </div>

          {/* Result Card */}
          {trackingSearched && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
              {trackedAspiration ? (
                <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {trackedAspiration.aspiration_number}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-2">
                        {trackedAspiration.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusBadge(
                        trackedAspiration.current_status
                      )}`}
                    >
                      {trackedAspiration.current_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {trackedAspiration.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Kategori</span>
                      <span className="font-semibold text-slate-800">
                        {categories.find((c) => c.id === trackedAspiration.category_id)?.name || 'Infrastruktur'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Wilayah</span>
                      <span className="font-semibold text-slate-800">
                        {regions.find((r) => r.id === trackedAspiration.village_id)?.name || 'Pasarkemis'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Tanggal Masuk</span>
                      <span className="font-semibold text-slate-800">{trackedAspiration.submitted_at}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Pelapor</span>
                      <span className="font-semibold text-slate-800">
                        {trackedAspiration.reporter_name || 'Warga Pasarkemis'}
                      </span>
                    </div>
                  </div>

                  {/* Realization documentation if available */}
                  {realizations.filter((r) => r.aspiration_id === trackedAspiration.id).length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Bukti Dokumentasi Realisasi di Lapangan
                      </span>
                      {realizations
                        .filter((r) => r.aspiration_id === trackedAspiration.id)
                        .map((rz) => (
                          <div key={rz.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                            <p className="font-bold text-slate-900">{rz.description}</p>
                            <p className="text-slate-600 mt-1">Status: {rz.verification_status} ({rz.realization_type})</p>
                            {rz.evidence_urls.length > 0 && (
                              <div className="mt-2">
                                <img
                                  src={rz.evidence_urls[0]}
                                  alt="Foto Hasil Realisasi"
                                  className="w-full max-h-48 object-cover rounded-lg border border-emerald-300"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">Aspirasi tidak ditemukan</p>
                  <p className="text-slate-500 mt-0.5">
                    Pastikan nomor registrasi yang Anda masukkan tepat (misal: ASP-2026-0001).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. KIRIM ASPIRASI SECTION (PERSIS WARNA BIRU TUA DENGAN FORM PUTIH PADA GAMBAR) */}
      <section id="section-kirim-aspirasi" className="bg-[#003882] text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sisi Kiri: Headline Kirim Aspirasi */}
            <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                KIRIM ASPIRASI
              </h2>
              <p className="text-base sm:text-xl font-bold text-blue-100">
                Suara Anda Berharga
              </p>
              <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                Sampaikan usulan, keluhan fasilitas umum, atau kebutuhan lingkungan di Pasarkemis & sekitarnya. Setiap aspirasi otomatis terdaftar resmi dan diproses langsung oleh tim dewan.
              </p>
              <div className="pt-2 hidden lg:block text-xs text-blue-300 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Bebas biaya & terbuka bagi seluruh warga
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Kerahasiaan data pelapor terjamin aman
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Dilengkapi kode lacak registrasi otomatis
                </p>
              </div>
            </div>

            {/* Sisi Kanan: Form Putih Sesuai Mockup Gambar */}
            <div className="lg:col-span-7 bg-white/95 text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
              {submitSuccessCode ? (
                <div className="text-center py-6 space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Aspirasi Anda Berhasil Terkirim!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Nomor registrasi unik aspirasi Anda telah diterbitkan:
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-mono font-black text-lg inline-block">
                    {submitSuccessCode}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Simpan nomor registrasi ini untuk memantau proses tindak lanjut pada fitur Cek Status.
                  </p>
                  <button
                    onClick={() => setSubmitSuccessCode(null)}
                    className="mt-3 px-5 py-2.5 bg-[#0047AB] hover:bg-[#003c8f] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Kirim Aspirasi Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-3.5 text-xs">
                  {formError && (
                    <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama pelapor / perwakilan warga"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        No. WhatsApp / Kontak <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 08123456789"
                        value={senderContact}
                        onChange={(e) => setSenderContact(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Desa / Kelurahan (Pasarkemis)
                      </label>
                      <select
                        value={senderVillage}
                        onChange={(e) => setSenderVillage(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      >
                        {pasarkemisVillages.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Kategori Aspirasi
                      </label>
                      <select
                        value={senderCategory}
                        onChange={(e) => setSenderCategory(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Pesan / Uraian Aspirasi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan kebutuhan perbaikan jalan lingkungan, drainase banjir, lampu PJU, sarana posyandu, atau bantuan UMKM..."
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      className="w-full p-2.5 sm:p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    ></textarea>
                  </div>

                  {/* Tombol Gold/Amber Pill "KIRIM" Persis Gambar Mockup */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#E5A93C] hover:bg-[#d99b26] active:bg-[#c48718] text-[#002b66] font-extrabold text-sm uppercase tracking-wider rounded-full shadow-md transition-all hover:scale-101 cursor-pointer"
                    >
                      KIRIM ASPIRASI
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* 6. FOOTER RESMI SAHABAT ADU DENGAN NAVIGASI LENGKAP KE SELURUH HALAMAN */}
      <footer className="bg-[#00224f] text-slate-300 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-blue-950 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Brand & Pengabdian */}
          <div className="space-y-3">
            <div
              onClick={() => navigateToPage('beranda')}
              className="flex items-center space-x-2.5 cursor-pointer select-none"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl font-black text-white tracking-tight">
                  Sahabat <span className="text-[#E5A93C]">ADU</span>
                </span>
                <span className="text-[10px] text-blue-200/80 font-bold mt-0.5">
                  AW Maulana & Uju • Dapil 4 Tangerang
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Wadah aspirasi digital dan pengabdian nyata berbasis kemitraan unit RT dan RW di Pasarkemis, Sindang Jaya, dan Rajeg.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-amber-300 text-[10px] font-bold">
                Fraksi PAN DPRD Kab. Tangerang
              </span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Halaman Utama */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide mb-3">Halaman Website</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateToPage('beranda')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  &bull; Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('profil')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  &bull; Profil AW Maulana & Uju
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('visi-misi')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  &bull; Visi & Misi Pelayanan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('program')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  &bull; Program Kerja Unggulan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('berita')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  &bull; Berita & Kegiatan Lapangan
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Warga & Kontak */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-sm tracking-wide mb-3">Layanan Warga</h4>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>0811 9876 543 / 021 590 7799</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>dewan@sahabatadu.id</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300 pt-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Rumah Aspirasi Sahabat ADU, Jl. Raya Pasarkemis No. 45, Kab. Tangerang, Banten
              </span>
            </div>
          </div>

          {/* Kolom 4: Akses Khusus & Social Media */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide mb-3">Akses Tim Internal</h4>
            <p className="text-xs text-slate-400">
              Akses khusus anggota dewan, koordinator dapil, dan relawan unit RT/RW.
            </p>
            <div>
              <button
                onClick={() => setActiveModal('login')}
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#003882] to-[#0047AB] hover:from-[#002b66] hover:to-[#003882] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-400/30 transition-all shadow-md cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Masuk Portal Tim & Dewan</span>
              </button>
            </div>
            <div className="pt-2 flex items-center space-x-3 text-white">
              <span className="w-8 h-8 rounded-full bg-blue-700/80 hover:bg-amber-500 cursor-pointer flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </span>
              <span className="w-8 h-8 rounded-full bg-blue-700/80 hover:bg-amber-500 cursor-pointer flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </span>
              <span className="w-8 h-8 rounded-full bg-blue-700/80 hover:bg-amber-500 cursor-pointer flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </span>
              <span className="w-8 h-8 rounded-full bg-blue-700/80 hover:bg-amber-500 cursor-pointer flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-blue-900/60 text-center text-[11px] text-slate-400">
          Hak Cipta &copy; 2026 Sahabat ADU (AW Maulana & Uju). Didukung oleh Fraksi PAN Dapil 4 Kab. Tangerang.
        </div>
      </footer>

      {/* 7. MODAL LOGIN PORTAL TIM DEWAN & RELAWAN RT/RW */}
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0047AB] text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Masuk Portal Internal Sahabat ADU
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem Pengelolaan Unit RT/RW & Tindak Lanjut Aspirasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Login Tab switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mt-4 text-xs font-bold">
              <button
                onClick={() => setLoginTab('quick')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginTab === 'quick' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Akun Tim (Quick Demo)</span>
              </button>
              <button
                onClick={() => setLoginTab('manual')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginTab === 'manual' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Email & Sandi</span>
              </button>
            </div>

            {loginTab === 'quick' ? (
              <div className="mt-4 space-y-2.5">
                <p className="text-[11px] text-slate-500 mb-2">
                  Pilih profil pengguna untuk langsung menguji fungsi hak akses (Role-Based Access Control):
                </p>

                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectQuickUser(u)}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                          {u.name}
                        </h4>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-800">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleManualLogin} className="mt-4 space-y-3.5 text-xs">
                {loginError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email / ID Petugas</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@sahabatadu.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0047AB] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0047AB] focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0047AB] hover:bg-[#003c8f] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Dashboard Sistem</span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Akses terenkripsi dan terlindungi audit log internal. Seluruh aktivitas terekam.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
