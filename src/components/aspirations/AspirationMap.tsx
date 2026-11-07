import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Info,
  Maximize2,
  MessageSquareText,
  AlertCircle
} from 'lucide-react';
import {
  Aspiration,
  Region,
  AspirationCategory,
  UserRole
} from '../../types/index.ts';

interface AspirationMapProps {
  aspirations: Aspiration[];
  regions: Region[];
  categories: AspirationCategory[];
  userRole: UserRole;
  onSelectAspiration: (id: string) => void;
}

export const AspirationMap: React.FC<AspirationMapProps> = ({
  aspirations,
  regions,
  categories,
  userRole,
  onSelectAspiration
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('kec-pasarkemis');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Inspected village or aspiration
  const [inspectedVillage, setInspectedVillage] = useState<Region | null>(null);
  const [inspectedAspiration, setInspectedAspiration] = useState<Aspiration | null>(null);

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const villages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && (selectedKecamatan === 'ALL' || r.parent_id === selectedKecamatan)
  );

  // Filtered aspirations for map
  const filteredAspirations = aspirations.filter((asp) => {
    if (selectedKecamatan !== 'ALL' && asp.region_id !== selectedKecamatan) return false;
    if (selectedVillage !== 'ALL' && asp.village_id !== selectedVillage) return false;
    if (selectedCategory !== 'ALL' && asp.category_id !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && asp.current_status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && asp.priority !== selectedPriority) return false;
    if (selectedSource !== 'ALL' && asp.source_type !== selectedSource) return false;
    return true;
  });

  // Calculate stats for current active region view
  const currentRegionVillages = inspectedVillage ? [inspectedVillage] : villages;
  const regionAspirations = inspectedVillage
    ? aspirations.filter((a) => a.village_id === inspectedVillage.id)
    : filteredAspirations;

  const totalAsp = regionAspirations.length;
  const inProgressAsp = regionAspirations.filter((a) =>
    ['Verifikasi', 'Terverifikasi', 'Ditelaah', 'Diteruskan kepada Pihak Terkait', 'Dalam Proses'].includes(a.current_status)
  ).length;
  const waitingResponseAsp = regionAspirations.filter(
    (a) => a.current_status === 'Menunggu Tanggapan'
  ).length;
  const verifiedRealizationAsp = regionAspirations.filter(
    (a) => a.current_status === 'Realisasi Terverifikasi'
  ).length;

  // Most frequent category
  const categoryCounts: Record<string, number> = {};
  regionAspirations.forEach((a) => {
    categoryCounts[a.category_id] = (categoryCounts[a.category_id] || 0) + 1;
  });
  let topCategoryId = '';
  let topCount = 0;
  Object.entries(categoryCounts).forEach(([catId, count]) => {
    if (count > topCount) {
      topCount = count;
      topCategoryId = catId;
    }
  });
  const topCategoryName = categories.find((c) => c.id === topCategoryId)?.name || '-';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-6.1685, 106.5562],
        zoom: 13,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap kontributor'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot villages as aggregations
    villages.forEach((vil) => {
      if (!vil.latitude || !vil.longitude || isNaN(vil.latitude) || isNaN(vil.longitude)) return;
      const villageAsps = aspirations.filter((a) => a.village_id === vil.id);
      const count = villageAsps.length;

      const circle = L.circleMarker([vil.latitude, vil.longitude], {
        radius: 14 + Math.min(count * 2.5, 15),
        fillColor: count > 0 ? '#2563eb' : '#94a3b8',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.55
      });

      circle.bindTooltip(
        `<strong>${vil.name}</strong><br/>Total Aspirasi: ${count}`,
        { direction: 'top' }
      );

      circle.on('click', () => {
        setInspectedVillage(vil);
        setInspectedAspiration(null);
      });

      circle.addTo(markersLayerRef.current!);
    });

    // 2. Plot individual aspiration markers
    filteredAspirations.forEach((asp) => {
      if (!asp.latitude || !asp.longitude || isNaN(asp.latitude) || isNaN(asp.longitude)) return;

      const isDone = asp.current_status === 'Realisasi Terverifikasi';
      const isInProgress = ['Dalam Proses', 'Diteruskan kepada Pihak Terkait', 'Ditelaah'].includes(asp.current_status);
      const isUrgent = asp.priority === 'Darurat' || asp.priority === 'Tinggi';

      const color = isDone ? '#059669' : isInProgress ? '#2563eb' : isUrgent ? '#dc2626' : '#d97706';

      const markerHtml = `
        <div style="
          background-color: ${color};
          color: white;
          font-weight: 700;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          <span>${asp.aspiration_number.split('-')[1] || 'ASP'}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-aspiration-marker',
        html: markerHtml,
        iconSize: [44, 20],
        iconAnchor: [22, 10]
      });

      const marker = L.marker([asp.latitude, asp.longitude], { icon: customIcon });

      marker.on('click', () => {
        setInspectedAspiration(asp);
        setInspectedVillage(null);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredAspirations, villages, aspirations]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Peta Sebaran Aspirasi Warga
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring persebaran wilayah usulan aspirasi masyarakat di Pasarkemis & Tangerang
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
            <span className="text-slate-700 font-medium">Realisasi Tuntas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span className="text-slate-700 font-medium">Dalam Proses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
            <span className="text-slate-700 font-medium">Menunggu Tanggapan</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Kecamatan</label>
          <select
            value={selectedKecamatan}
            onChange={(e) => {
              setSelectedKecamatan(e.target.value);
              setSelectedVillage('ALL');
            }}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Kecamatan</option>
            {kecamatans.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Desa/Kelurahan</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Desa/Kelurahan</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Progres</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Menunggu Tanggapan">Menunggu Tanggapan</option>
            <option value="Tanggapan Diterima">Tanggapan Diterima</option>
            <option value="Realisasi Terverifikasi">Realisasi Terverifikasi</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Prioritas</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="Darurat">Darurat</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Sumber Aspirasi</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Sumber</option>
            <option value="Masyarakat">Masyarakat</option>
            <option value="Unit RT">Unit RT</option>
            <option value="Unit RW">Unit RW</option>
            <option value="Pertemuan / Reses">Reses</option>
          </select>
        </div>
      </div>

      {/* Map & Aggregated Region Summary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
          <div ref={mapContainerRef} className="w-full h-[520px] z-10" />

          {/* Floating Pill on Map */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs pointer-events-none">
            <span className="font-bold text-slate-800">Menampilkan: </span>
            <span className="text-blue-700 font-bold">{filteredAspirations.length} Titik Aspirasi</span>
          </div>
        </div>

        {/* Regional Aggregation & Inspection Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Ringkasan Wilayah
              </h3>
              {(inspectedAspiration || inspectedVillage) && (
                <button
                  onClick={() => {
                    setInspectedAspiration(null);
                    setInspectedVillage(null);
                  }}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* When Aspiration is Selected */}
            {inspectedAspiration ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-800">
                      {inspectedAspiration.aspiration_number}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-700 text-white">
                      {inspectedAspiration.current_status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                    {inspectedAspiration.title}
                  </h4>
                  <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                    {inspectedAspiration.location_description}
                  </p>
                </div>

                <div className="space-y-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kategori</span>
                    <strong className="text-slate-800">
                      {categories.find((c) => c.id === inspectedAspiration.category_id)?.name}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Prioritas</span>
                    <span className="font-bold text-amber-700">{inspectedAspiration.priority}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Masuk</span>
                    <span>{inspectedAspiration.submitted_at}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectAspiration(inspectedAspiration.id)}
                  className="w-full mt-2 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Buka Rincian & Tindak Lanjut
                </button>
              </div>
            ) : (
              /* When Region / General is inspected */
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Wilayah Terpilih</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {inspectedVillage ? inspectedVillage.name : regions.find((r) => r.id === selectedKecamatan)?.name || 'Seluruh Dapil'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {inspectedVillage ? 'Klik marker aspirasi untuk detail per titik' : 'Klik lingkaran desa untuk zoom ringkasan'}
                  </p>
                </div>

                {/* 5 Wajib Metrik Sesuai Spesifikasi Prompt */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-slate-600 font-medium">Total Aspirasi:</span>
                    <strong className="text-blue-900 font-extrabold">{totalAsp}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Kategori Terbanyak:</span>
                    <strong className="text-slate-900 font-bold">{topCategoryName}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-amber-800 font-medium">Dalam Proses:</span>
                    <strong className="text-amber-900 font-extrabold">{inProgressAsp}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100">
                    <span className="text-orange-800 font-medium">Menunggu Tanggapan:</span>
                    <strong className="text-orange-900 font-extrabold">{waitingResponseAsp}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-emerald-800 font-medium">Realisasi Terverifikasi:</span>
                    <strong className="text-emerald-900 font-extrabold">{verifiedRealizationAsp}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Privasi terlindungi: Informasi pribadi pelapor tidak dipublikasikan secara terbuka pada peta.
          </div>
        </div>
      </div>
    </div>
  );
};
