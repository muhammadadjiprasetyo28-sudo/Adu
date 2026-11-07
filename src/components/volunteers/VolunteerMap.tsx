import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Map as MapIcon,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Info,
  Maximize2,
  Users2,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { VolunteerUnit, Region, UserRole } from '../../types/index.ts';
import { canUserAccessContacts, maskContact } from '../../utils/rules.ts';

interface VolunteerMapProps {
  units: VolunteerUnit[];
  regions: Region[];
  userRole: UserRole;
  selectedUnitFromParent?: VolunteerUnit | null;
  onClearSelectedUnit?: () => void;
}

export const VolunteerMap: React.FC<VolunteerMapProps> = ({
  units,
  regions,
  userRole,
  selectedUnitFromParent,
  onClearSelectedUnit
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('kec-pasarkemis');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected Unit / Region Inspection Drawer
  const [inspectedUnit, setInspectedUnit] = useState<VolunteerUnit | null>(selectedUnitFromParent || null);
  const [inspectedVillage, setInspectedVillage] = useState<Region | null>(null);

  const canSeeContacts = canUserAccessContacts(userRole);

  const kecamatans = regions.filter((r) => r.type === 'kecamatan');
  const villages = regions.filter(
    (r) => r.type === 'desa_kelurahan' && (selectedKecamatan === 'ALL' || r.parent_id === selectedKecamatan)
  );

  // Filtered volunteer units for map
  const mapUnits = units.filter((u) => {
    if (selectedKecamatan !== 'ALL' && u.region_id !== selectedKecamatan) return false;
    if (selectedVillage !== 'ALL' && u.village_id !== selectedVillage) return false;
    if (selectedType !== 'ALL' && u.unit_type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && u.status !== selectedStatus) return false;
    return true;
  });

  // Calculate Region Unit Stats (Aktif vs Belum Bergabung)
  const activeRwCount = mapUnits.filter((u) => u.unit_type === 'RW' && u.status === 'Aktif').length;
  const activeRtCount = mapUnits.filter((u) => u.unit_type === 'RT' && u.status === 'Aktif').length;

  // Estimated potential in Pasarkemis
  const currentKec = regions.find((r) => r.id === selectedKecamatan);
  const estRw = currentKec?.total_rw_estimate || 88;
  const estRt = currentKec?.total_rt_estimate || 420;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Pasarkemis default coordinates: -6.1685, 106.5562
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

  // Sync selected unit from parent
  useEffect(() => {
    if (selectedUnitFromParent) {
      setInspectedUnit(selectedUnitFromParent);
      if (selectedUnitFromParent.latitude && selectedUnitFromParent.longitude && mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [selectedUnitFromParent.latitude, selectedUnitFromParent.longitude],
          15
        );
      }
    }
  }, [selectedUnitFromParent]);

  // Update Markers on Map when units or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot village administrative centers as polygon/circles
    villages.forEach((vil) => {
      if (!vil.latitude || !vil.longitude || isNaN(vil.latitude) || isNaN(vil.longitude)) return;
      const villageUnits = units.filter((u) => u.village_id === vil.id);
      const activeUnitsCount = villageUnits.filter((u) => u.status === 'Aktif').length;

      const circle = L.circleMarker([vil.latitude, vil.longitude], {
        radius: 14 + Math.min(activeUnitsCount * 2, 12),
        fillColor: activeUnitsCount > 0 ? '#1d4ed8' : '#94a3b8',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.65
      });

      circle.bindTooltip(
        `<strong>${vil.name}</strong><br/>Unit Bergabung: ${villageUnits.length} (${activeUnitsCount} Aktif)`,
        { direction: 'top' }
      );

      circle.on('click', () => {
        setInspectedVillage(vil);
        setInspectedUnit(null);
      });

      circle.addTo(markersLayerRef.current!);
    });

    // 2. Plot representative unit markers (RW & RT)
    mapUnits.forEach((unit) => {
      if (!unit.latitude || !unit.longitude || isNaN(unit.latitude) || isNaN(unit.longitude)) return;

      const isRW = unit.unit_type === 'RW';
      const isActive = unit.status === 'Aktif';

      // Custom HTML Marker Icon
      const markerHtml = `
        <div style="
          background-color: ${isRW ? (isActive ? '#1e40af' : '#d97706') : (isActive ? '#0284c7' : '#f59e0b')};
          color: white;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 6px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          <span>${isRW ? 'RW' : 'RT'} ${isRW ? unit.rw_number : `${unit.rt_number}/${unit.rw_number}`}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-unit-marker',
        html: markerHtml,
        iconSize: [46, 20],
        iconAnchor: [23, 10]
      });

      const marker = L.marker([unit.latitude, unit.longitude], { icon: customIcon });

      marker.on('click', () => {
        setInspectedUnit(unit);
        setInspectedVillage(null);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [mapUnits, villages, units]);

  return (
    <div className="space-y-4">
      {/* Top Banner / Description */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-600" />
            Peta Geografis Relawan Wilayah (RT & RW)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Titik representatif sebaran unit RW dan unit RT yang telah bergabung di Pasarkemis & Tangerang
          </p>
        </div>

        {/* Quick Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-800 border border-white"></span>
            <span className="text-slate-700 font-medium">Unit RW Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-600 border border-white"></span>
            <span className="text-slate-700 font-medium">Unit RT Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 border border-white"></span>
            <span className="text-slate-700 font-medium">Menunggu Verifikasi</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
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
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Desa / Kelurahan</label>
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
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipe Unit</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Tipe (RW & RT)</option>
            <option value="RW">Hanya RW</option>
            <option value="RT">Hanya RT</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Keanggotaan</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          </select>
        </div>
      </div>

      {/* Map + Detail Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
          <div ref={mapContainerRef} className="w-full h-[520px] z-10" />

          {/* Floating Stats Badge on Map */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs pointer-events-none">
            <span className="font-bold text-slate-800">Cakupan Relawan: </span>
            <span className="text-blue-700 font-bold">{activeRwCount} RW</span> &bull;{' '}
            <span className="text-indigo-700 font-bold">{activeRtCount} RT Aktif</span>
          </div>
        </div>

        {/* Inspection Sidebar Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Informasi Wilayah
              </h3>
              {(inspectedUnit || inspectedVillage) && (
                <button
                  onClick={() => {
                    setInspectedUnit(null);
                    setInspectedVillage(null);
                    if (onClearSelectedUnit) onClearSelectedUnit();
                  }}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {inspectedUnit ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-700 text-white font-bold text-[10px]">
                      UNIT {inspectedUnit.unit_type}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {inspectedUnit.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                    {inspectedUnit.unit_type === 'RT'
                      ? `RT ${inspectedUnit.rt_number} / RW ${inspectedUnit.rw_number}`
                      : `RW ${inspectedUnit.rw_number}`}
                  </h4>
                  <p className="text-slate-600 font-medium">
                    {regions.find((r) => r.id === inspectedUnit.village_id)?.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {regions.find((r) => r.id === inspectedUnit.region_id)?.name}
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Terdaftar</span>
                    <strong className="text-slate-800">{inspectedUnit.registered_at}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Koordinator Unit</span>
                    <strong className="text-slate-800">
                      {inspectedUnit.coordinator_name || 'Belum dicatat'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Kontak Koordinator</span>
                    <strong className="text-slate-800 font-mono">
                      {canSeeContacts
                        ? inspectedUnit.coordinator_contact || '-'
                        : maskContact(inspectedUnit.coordinator_contact)}
                    </strong>
                    {!canSeeContacts && (
                      <p className="text-[10px] text-slate-400 italic">Disamarkan demi privasi</p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Catatan Posko / Wilayah</span>
                    <p className="text-slate-600 text-[11px]">{inspectedUnit.notes || '-'}</p>
                  </div>
                </div>
              </div>
            ) : inspectedVillage ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Desa / Kelurahan</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{inspectedVillage.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Estimasi Potensi: {inspectedVillage.total_rw_estimate || 10} RW • {inspectedVillage.total_rt_estimate || 45} RT
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-[11px]">Unit Relawan Terdaftar di Desa Ini:</h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {units
                      .filter((u) => u.village_id === inspectedVillage.id)
                      .map((u) => (
                        <div
                          key={u.id}
                          onClick={() => setInspectedUnit(u)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 cursor-pointer border border-slate-100 flex items-center justify-between transition-colors"
                        >
                          <span className="font-semibold text-slate-800">
                            {u.unit_type} {u.unit_type === 'RT' ? `${u.rt_number}/${u.rw_number}` : u.rw_number}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">{u.status}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-600" />
                Klik salah satu marker pada peta untuk melihat data rincian unit relawan atau wilayah.
              </div>
            )}
          </div>

          {/* Aggregated Potensi Info */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Potensi Pasarkemis</span>
              <span>88 RW &bull; 420 RT</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Unit relawan RT dan RW dihimpun secara mandiri melalui persetujuan warga dan pengurus lingkungan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
