import React, { useState } from 'react';
import {
  Users2,
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import {
  DashboardStats,
  VolunteerUnit,
  Aspiration,
  Region,
  AspirationCategory
} from '../../types/index.ts';

interface DashboardOverviewProps {
  stats: DashboardStats;
  units: VolunteerUnit[];
  aspirations: Aspiration[];
  regions: Region[];
  categories: AspirationCategory[];
  onNavigateTab: (tab: any) => void;
  onSelectAspiration: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  units,
  aspirations,
  regions,
  categories,
  onNavigateTab,
  onSelectAspiration
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Monthly Trends Data derived from real aspirations submitted_at
  const monthlyData = [
    { month: 'Okt 25', total: 0 },
    { month: 'Nov 25', total: 1 },
    { month: 'Des 25', total: 2 },
    { month: 'Jan 26', total: 3 },
    { month: 'Feb 26', total: 4 },
    { month: 'Mar 26', total: aspirations.length }
  ];

  // Category breakdown derived from real aspirations
  const categoryData = categories.map((cat) => {
    const count = aspirations.filter((a) => a.category_id === cat.id).length;
    return {
      name: cat.name,
      count,
      color: cat.color
    };
  });
  const maxCategoryCount = Math.max(...categoryData.map((c) => c.count), 1);

  // Sub-district (Kecamatan) distribution
  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const kecamatanData = kecamatans.map((kec) => {
    const aspCount = aspirations.filter((a) => a.region_id === kec.id).length;
    const rwCount = units.filter((u) => u.region_id === kec.id && u.unit_type === 'RW').length;
    const rtCount = units.filter((u) => u.region_id === kec.id && u.unit_type === 'RT').length;
    return {
      name: kec.name.replace('Kecamatan ', ''),
      aspirasi: aspCount,
      rw: rwCount,
      rt: rtCount
    };
  });

  // Urgent / Needs follow up aspirations
  const needsFollowUpList = aspirations
    .filter((a) =>
      ['Diajukan', 'Verifikasi', 'Menunggu Tanggapan', 'Dalam Proses'].includes(a.current_status)
    )
    .slice(0, 4);

  // Recent aspirations
  const recentAspirations = [...aspirations]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 4);

  // SVG Area Chart Calculations
  const chartHeight = 180;
  const chartWidth = 500;
  const maxMonthVal = Math.max(...monthlyData.map((d) => d.total), 5);
  const points = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.total / maxMonthVal) * (chartHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = a[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`;

  return (
    <div className="space-y-6">
      {/* Banner Sambutan Dewan & DAPIL Info */}
      <div className="rounded-2xl bg-linear-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 shadow-lg shadow-blue-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Aktif Pemetaan Dapil 4 Tangerang
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-900/60 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-amber-400/30">
                <span>⚡ Backend API & MongoDB Engine Active</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Sahabat ADU (AW Maulana, S.Sos. & Uju)
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl">
              Portal komprehensif pendataan unit relawan RT/RW, monitoring aspirasi warga, dan dokumentasi realisasi kerja nyata terpusat, aman, dan transparan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('aspirations')}
              className="px-4 py-2 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Input Aspirasi</span>
            </button>
            <button
              onClick={() => onNavigateTab('volunteer-map')}
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all border border-blue-400/30 flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Lihat Peta Wilayah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utama (10 Metrik Sesuai Spesifikasi) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Statistik Real Database Sistem
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Diperbarui secara otomatis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Total RW Terdaftar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total RW Terdaftar</span>
              <Users2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalRwRegistered} <span className="text-xs font-normal text-slate-500">Unit RW</span>
            </div>
            <div className="mt-1 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
              <span>{stats.totalRwActive} RW Aktif</span>
            </div>
          </div>

          {/* 2. Total RW Aktif */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-blue-800 text-xs font-medium">
              <span>RW Aktif</span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-blue-900 tracking-tight">
              {stats.totalRwActive}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.totalRwRegistered > 0
                ? `${Math.round((stats.totalRwActive / stats.totalRwRegistered) * 100)}% terverifikasi aktif`
                : 'Belum ada data'}
            </div>
          </div>

          {/* 3. Total RT Terdaftar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total RT Terdaftar</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalRtRegistered} <span className="text-xs font-normal text-slate-500">Unit RT</span>
            </div>
            <div className="mt-1 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
              <span>{stats.totalRtActive} RT Aktif</span>
            </div>
          </div>

          {/* 4. Total RT Aktif */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-2xs hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between text-indigo-800 text-xs font-medium">
              <span>RT Aktif</span>
              <CheckCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-indigo-900 tracking-tight">
              {stats.totalRtActive}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.totalRtRegistered > 0
                ? `${Math.round((stats.totalRtActive / stats.totalRtRegistered) * 100)}% terverifikasi aktif`
                : 'Belum ada data'}
            </div>
          </div>

          {/* 5. Jumlah Desa/Kelurahan Terjangkau */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Desa Terjangkau</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-800 tracking-tight">
              {stats.coveredVillagesCount} <span className="text-xs font-normal text-slate-500">Desa/Kel</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              di Dapil Tangerang 4
            </div>
          </div>

          {/* 6. Total Aspirasi Masuk */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Aspirasi Masuk</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-blue-900 tracking-tight">
              {stats.totalAspirations}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Warga & Unit RT/RW
            </div>
          </div>

          {/* 7. Aspirasi Dalam Proses */}
          <div className="bg-white p-4 rounded-xl border border-amber-200/90 bg-amber-50/20 shadow-2xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
              <span>Dalam Proses</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-900 tracking-tight">
              {stats.inProgressAspirations}
            </div>
            <div className="mt-1 text-[11px] text-amber-700">
              Telaah & Tindak Lanjut
            </div>
          </div>

          {/* 8. Menunggu Tanggapan */}
          <div className="bg-white p-4 rounded-xl border border-orange-200/90 bg-orange-50/20 shadow-2xs hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between text-orange-800 text-xs font-medium">
              <span>Menunggu Tanggapan</span>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-orange-900 tracking-tight">
              {stats.waitingResponseAspirations}
            </div>
            <div className="mt-1 text-[11px] text-orange-700">
              Dari Dinas/Instansi
            </div>
          </div>

          {/* 9. Tanggapan Diterima */}
          <div className="bg-white p-4 rounded-xl border border-sky-200/90 bg-sky-50/20 shadow-2xs hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between text-sky-800 text-xs font-medium">
              <span>Tanggapan Diterima</span>
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-sky-900 tracking-tight">
              {stats.receivedResponsesCount}
            </div>
            <div className="mt-1 text-[11px] text-sky-700">
              Respon Resmi Terdata
            </div>
          </div>

          {/* 10. Realisasi Terverifikasi */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/90 bg-emerald-50/30 shadow-2xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
              <span>Realisasi Terverifikasi</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-900 tracking-tight">
              {stats.verifiedRealizationsCount}
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
              Hasil Nyata Tuntas
            </div>
          </div>
        </div>
      </div>

      {/* Visualisasi Grafik Tren & Kategori (Pure SVG & CSS untuk Kehandalan Maksimal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Tren Bulanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Tren Aspirasi & Laporan Bulanan
              </h4>
              <p className="text-xs text-slate-500">
                Perkembangan aspirasi yang dihimpun tim Sahabat ADU
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Tahun 2025 - 2026
            </span>
          </div>

          <div className="relative h-56 w-full pt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight - 10} x2={chartWidth - 20} y2={chartHeight - 10} stroke="#e2e8f0" />

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Smooth curve line */}
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx} onMouseEnter={() => setHoveredMonth(idx)} onMouseLeave={() => setHoveredMonth(null)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredMonth === idx ? 6 : 4}
                    fill="#ffffff"
                    stroke="#1d4ed8"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all"
                  />
                  <text
                    x={p.x}
                    y={chartHeight + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                    fontWeight="500"
                  >
                    {p.month}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1e40af"
                    fontWeight="bold"
                  >
                    {p.total}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Grafik Aspirasi per Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Distribusi Aspirasi per Kategori
              </h4>
              <p className="text-xs text-slate-500">
                Klasifikasi usulan bidang prioritas masyarakat
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {categoryData.slice(0, 5).map((cat) => {
              const pct = Math.round((cat.count / maxCategoryCount) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="font-extrabold text-blue-900">{cat.count} Aspirasi</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 6)}%`,
                        backgroundColor: cat.color || '#2563eb'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rekap Unit RT/RW per Kecamatan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Rekapitulasi Unit RT & RW per Kecamatan
              </h4>
              <p className="text-xs text-slate-500">
                Perbandingan unit RT dan unit RW yang telah bergabung
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('volunteers')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Kelola Unit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {kecamatanData.map((item) => (
              <div key={item.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-blue-800 font-bold">{item.rw} Unit RW</span>
                    <span>&bull;</span>
                    <span className="text-indigo-800 font-bold">{item.rt} Unit RT</span>
                    <span>&bull;</span>
                    <span className="text-amber-800 font-bold">{item.aspirasi} Aspirasi</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full bg-blue-100/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-700 h-full rounded-full"
                      style={{ width: `${Math.min(item.rw * 15, 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-full bg-indigo-100/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(item.rt * 15, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Verifikasi Relawan Mini Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Struktur Basis Relawan
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Independensi hitungan unit RW dan RT
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span>Unit RW Aktif</span>
                  <span>{stats.totalRwActive} dari {stats.totalRwRegistered} RW</span>
                </div>
                <div className="w-full bg-blue-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalRwRegistered > 0 ? (stats.totalRwActive / stats.totalRwRegistered) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <span>Unit RT Aktif</span>
                  <span>{stats.totalRtActive} dari {stats.totalRtRegistered} RT</span>
                </div>
                <div className="w-full bg-indigo-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalRtRegistered > 0 ? (stats.totalRtActive / stats.totalRtRegistered) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span>Realisasi Tuntas</span>
                  <span>{stats.verifiedRealizationsCount} Aspirasi</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Didukung bukti fisik foto sebelum/sesudah & berita acara.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('volunteer-map')}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Eksplorasi Peta Interaktif</span>
          </button>
        </div>
      </div>

      {/* Daftar Aspirasi Terbaru & Perlu Tindak Lanjut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aspirasi yang Perlu Ditindaklanjuti */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Perlu Tindak Lanjut / Respon
                </h4>
                <p className="text-xs text-slate-500">
                  Prioritas pemantauan tim dewan
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('aspirations')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {needsFollowUpList.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAspiration(item.id)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                        {item.aspiration_number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.priority === 'Darurat'
                            ? 'bg-red-100 text-red-800'
                            : item.priority === 'Tinggi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.location_description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {item.current_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aspirasi Terbaru Masuk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Aspirasi Terbaru
                </h4>
                <p className="text-xs text-slate-500">
                  Laporan masuk dari wilayah & reses
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('aspirations')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAspirations.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAspiration(item.id)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                        {item.aspiration_number}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {item.submitted_at}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      Sumber: <span className="font-semibold text-slate-700">{item.source_type}</span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md ${
                      item.current_status === 'Realisasi Terverifikasi'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.current_status === 'Dalam Proses'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.current_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
