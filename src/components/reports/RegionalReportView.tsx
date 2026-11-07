import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Building,
  CheckCircle2,
  Clock,
  Users2,
  TrendingUp,
  Download
} from 'lucide-react';
import {
  Region,
  VolunteerUnit,
  Aspiration,
  RealizationRecord,
  AspirationCategory
} from '../../types/index.ts';
import * as XLSX from 'xlsx';

interface RegionalReportViewProps {
  regions: Region[];
  units: VolunteerUnit[];
  aspirations: Aspiration[];
  realizations: RealizationRecord[];
  categories: AspirationCategory[];
}

export const RegionalReportView: React.FC<RegionalReportViewProps> = ({
  regions,
  units,
  aspirations,
  realizations,
  categories
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('kec-pasarkemis');
  const [reportType, setReportType] = useState<'desa' | 'kategori' | 'status'>('desa');

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const currentKec = regions.find((r) => r.id === selectedKecamatan);

  // Villages in selected kecamatan
  const villages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && (selectedKecamatan === 'ALL' || r.parent_id === selectedKecamatan)
  );

  // Matrix data per desa
  const villageReportData = villages.map((vil) => {
    const vilAsps = aspirations.filter((a) => a.village_id === vil.id);
    const rwJoined = units.filter((u) => u.village_id === vil.id && u.unit_type === 'RW');
    const rtJoined = units.filter((u) => u.village_id === vil.id && u.unit_type === 'RT');

    const totalAsp = vilAsps.length;
    const inProgress = vilAsps.filter((a) =>
      ['Verifikasi', 'Terverifikasi', 'Ditelaah', 'Diteruskan kepada Pihak Terkait', 'Dalam Proses'].includes(a.current_status)
    ).length;
    const waitingResponse = vilAsps.filter((a) => a.current_status === 'Menunggu Tanggapan').length;
    const receivedResponse = vilAsps.filter((a) => a.current_status === 'Tanggapan Diterima').length;
    const verifiedRealization = vilAsps.filter(
      (a) =>
        a.current_status === 'Realisasi Terverifikasi' ||
        realizations.some((r) => r.aspiration_id === a.id && r.verification_status === 'Terverifikasi')
    ).length;

    return {
      villageId: vil.id,
      villageName: vil.name,
      rwActiveCount: rwJoined.filter((u) => u.status === 'Aktif').length,
      rwTotalCount: rwJoined.length,
      rtActiveCount: rtJoined.filter((u) => u.status === 'Aktif').length,
      rtTotalCount: rtJoined.length,
      totalAspirations: totalAsp,
      inProgressCount: inProgress,
      waitingResponseCount: waitingResponse,
      receivedResponseCount: receivedResponse,
      verifiedRealizationCount: verifiedRealization,
      successRate: totalAsp > 0 ? Math.round((verifiedRealization / totalAsp) * 100) : 0
    };
  });

  // Totals for all villages in current view
  const totals = villageReportData.reduce(
    (acc, row) => ({
      rwTotal: acc.rwTotal + row.rwTotalCount,
      rwActive: acc.rwActive + row.rwActiveCount,
      rtTotal: acc.rtTotal + row.rtTotalCount,
      rtActive: acc.rtActive + row.rtActiveCount,
      totalAspirations: acc.totalAspirations + row.totalAspirations,
      inProgress: acc.inProgress + row.inProgressCount,
      waitingResponse: acc.waitingResponse + row.waitingResponseCount,
      receivedResponse: acc.receivedResponse + row.receivedResponseCount,
      verifiedRealization: acc.verifiedRealization + row.verifiedRealizationCount
    }),
    {
      rwTotal: 0,
      rwActive: 0,
      rtTotal: 0,
      rtActive: 0,
      totalAspirations: 0,
      inProgress: 0,
      waitingResponse: 0,
      receivedResponse: 0,
      verifiedRealization: 0
    }
  );

  const handleExportExcel = () => {
    const data = villageReportData.map((row) => ({
      'Desa / Kelurahan': row.villageName,
      'Unit RW Terdaftar': row.rwTotalCount,
      'Unit RW Aktif': row.rwActiveCount,
      'Unit RT Terdaftar': row.rtTotalCount,
      'Unit RT Aktif': row.rtActiveCount,
      'Total Aspirasi': row.totalAspirations,
      'Dalam Proses': row.inProgressCount,
      'Menunggu Tanggapan': row.waitingResponseCount,
      'Tanggapan Diterima': row.receivedResponseCount,
      'Realisasi Terverifikasi': row.verifiedRealizationCount,
      'Tingkat Keberhasilan (%)': `${row.successRate}%`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Wilayah');
    XLSX.writeFile(
      wb,
      `Laporan_Wilayah_Sahabat_ADU_${currentKec?.code || 'PKM'}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Laporan Rekapitulasi per Wilayah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriks akurat aspirasi, respon dinas, hasil realisasi, dan basis unit relawan RT/RW
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-700">Filter Kecamatan:</label>
          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Kecamatan (Dapil 4)</option>
            {kecamatans.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Periode: <strong className="text-slate-800">Tahun Sidang 2025/2026</strong> &bull; Dapil 4 Kabupaten Tangerang
        </div>
      </div>

      {/* Report Sheet Presentation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 print:border-none print:shadow-none">
        {/* Printable Official Header */}
        <div className="border-b-2 border-blue-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-blue-950 tracking-tight uppercase">
                SAHABAT ADU &bull; LAPORAN PELAYANAN ASPIRASI MASYARAKAT
              </h1>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                Anggota DPRD Kabupaten Tangerang: AW Maulana, S.Sos. & Uju
              </p>
              <p className="text-[11px] text-slate-500">
                Wilayah Operasional: {currentKec ? currentKec.name : 'Dapil 4 Kabupaten Tangerang (Pasarkemis, Sindang Jaya, Rajeg)'}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-1 rounded-sm border border-blue-200">
                Dokumen Resmi Dapil
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-950 text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 rounded-tl-lg">Desa / Kelurahan</th>
                <th className="py-3 px-3 text-center bg-blue-900">RW Gabung</th>
                <th className="py-3 px-3 text-center bg-blue-800">RT Gabung</th>
                <th className="py-3 px-3 text-center">Total Aspirasi</th>
                <th className="py-3 px-3 text-center">Dalam Proses</th>
                <th className="py-3 px-3 text-center">Menunggu Tanggapan</th>
                <th className="py-3 px-3 text-center">Tanggapan Diterima</th>
                <th className="py-3 px-3 text-center bg-emerald-900 text-white">Realisasi Tuntas</th>
                <th className="py-3 px-3 text-center rounded-tr-lg">% Realisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {villageReportData.map((row) => (
                <tr key={row.villageId} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {row.villageName}
                  </td>
                  <td className="py-3 px-3 text-center font-medium bg-blue-50/40">
                    <span className="font-bold text-blue-900">{row.rwActiveCount}</span>
                    <span className="text-[10px] text-slate-400"> / {row.rwTotalCount}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium bg-blue-50/20">
                    <span className="font-bold text-indigo-900">{row.rtActiveCount}</span>
                    <span className="text-[10px] text-slate-400"> / {row.rtTotalCount}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-900">
                    {row.totalAspirations}
                  </td>
                  <td className="py-3 px-3 text-center text-amber-800 font-semibold">
                    {row.inProgressCount}
                  </td>
                  <td className="py-3 px-3 text-center text-orange-800 font-semibold">
                    {row.waitingResponseCount}
                  </td>
                  <td className="py-3 px-3 text-center text-sky-800 font-semibold">
                    {row.receivedResponseCount}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-emerald-800 bg-emerald-50/60">
                    {row.verifiedRealizationCount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800">
                      {row.successRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black text-slate-900 text-xs border-t-2 border-slate-300">
                <td className="py-3 px-3 uppercase">TOTAL KESELURUHAN</td>
                <td className="py-3 px-3 text-center font-black text-blue-900 bg-blue-100/50">
                  {totals.rwActive} / {totals.rwTotal} RW
                </td>
                <td className="py-3 px-3 text-center font-black text-indigo-900 bg-indigo-100/50">
                  {totals.rtActive} / {totals.rtTotal} RT
                </td>
                <td className="py-3 px-3 text-center font-black text-blue-950">
                  {totals.totalAspirations}
                </td>
                <td className="py-3 px-3 text-center text-amber-900">
                  {totals.inProgress}
                </td>
                <td className="py-3 px-3 text-center text-orange-900">
                  {totals.waitingResponse}
                </td>
                <td className="py-3 px-3 text-center text-sky-900">
                  {totals.receivedResponse}
                </td>
                <td className="py-3 px-3 text-center font-black text-emerald-900 bg-emerald-100/60">
                  {totals.verifiedRealization}
                </td>
                <td className="py-3 px-3 text-center font-black text-slate-900">
                  {totals.totalAspirations > 0
                    ? `${Math.round((totals.verifiedRealization / totals.totalAspirations) * 100)}%`
                    : '0%'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Signatures for Printable View */}
        <div className="mt-12 pt-6 border-t border-slate-200 hidden print:grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-16">Mengetahui, Anggota DPRD Fraksi PAN</p>
            <p className="font-bold underline text-slate-900">AW Maulana, S.Sos. & Uju</p>
            <p className="text-[10px] text-slate-500">Dapil 4 Kabupaten Tangerang</p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Koordinator Tim Advokasi Sahabat ADU</p>
            <p className="font-bold underline text-slate-900">H. Budi Santoso</p>
            <p className="text-[10px] text-slate-500">Ketua Harian Sahabat ADU Pasarkemis</p>
          </div>
        </div>
      </div>
    </div>
  );
};
