export type UnitType = 'RW' | 'RT';

export type UnitStatus = 'Terdaftar' | 'Menunggu Verifikasi' | 'Aktif' | 'Tidak Aktif';

export type UserRole =
  | 'Admin Utama'
  | 'Admin Operasional'
  | 'Koordinator Wilayah'
  | 'Operator RT/RW'
  | 'Viewer';

export type AspirationPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';

export type AspirationSource =
  | 'Masyarakat'
  | 'Unit RT'
  | 'Unit RW'
  | 'Kegiatan Lapangan'
  | 'Pertemuan / Reses';

export type AspirationStatus =
  | 'Diajukan'
  | 'Verifikasi'
  | 'Terverifikasi'
  | 'Ditelaah'
  | 'Diteruskan kepada Pihak Terkait'
  | 'Dalam Proses'
  | 'Menunggu Tanggapan'
  | 'Tanggapan Diterima'
  | 'Realisasi Terverifikasi'
  | 'Ditutup'
  | 'Ditolak'
  | 'Duplikat';

export type RealizationType =
  | 'Tanggapan atau Informasi'
  | 'Tindak Lanjut Administratif'
  | 'Proses Pekerjaan atau Program'
  | 'Hasil Fisik yang Telah Diverifikasi'
  | 'Hasil Lainnya';

export type RealizationVerificationStatus =
  | 'Menunggu Verifikasi'
  | 'Terverifikasi'
  | 'Perlu Perbaikan';

export interface Region {
  id: string;
  name: string;
  type: 'kabupaten' | 'kecamatan' | 'desa_kelurahan';
  parent_id?: string;
  code?: string;
  latitude: number;
  longitude: number;
  total_rw_estimate?: number;
  total_rt_estimate?: number;
}

export interface VolunteerUnit {
  id: string;
  unit_type: UnitType;
  region_id: string; // Kecamatan ID
  village_id: string; // Desa/Kelurahan ID
  rw_number: string; // e.g. "01", "02"
  rt_number?: string; // e.g. "03" if unit_type === 'RT'
  parent_rw_unit_id?: string; // Links RT to a registered RW unit if existing
  registered_at: string;
  verified_at?: string;
  status: UnitStatus;
  coordinator_name?: string;
  coordinator_contact?: string; // Hidden for Viewer / Public
  notes?: string;
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
}

export interface AspirationCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
}

export interface Aspiration {
  id: string;
  aspiration_number: string;
  title: string;
  description: string;
  category_id: string;
  region_id: string; // Kecamatan
  village_id: string; // Desa/Kelurahan
  rw_unit_id?: string;
  rt_unit_id?: string;
  rw_number?: string;
  rt_number?: string;
  source_type: AspirationSource;
  submitted_at: string;
  location_description: string;
  latitude?: number;
  longitude?: number;
  attachment_urls: string[];
  priority: AspirationPriority;
  current_status: AspirationStatus;
  assigned_user_id?: string;
  created_by: string;
  reporter_name?: string; // Confidential
  reporter_contact?: string; // Confidential
  updated_at: string;
}

export interface FollowUpRecord {
  id: string;
  aspiration_id: string;
  status_change?: AspirationStatus;
  action_type: string; // 'Verifikasi', 'Surat Diteruskan', 'Rapat Koordinasi', 'Tinjauan Lapangan', 'Tanggapan Diterima'
  target_agency?: string; // e.g. "Dinas Bina Marga & SDA Kab. Tangerang"
  notes: string;
  meeting_notes?: string;
  documents?: string[];
  performed_by: string;
  follow_up_date: string;
  created_at: string;
}

export interface RealizationRecord {
  id: string;
  aspiration_id: string;
  description: string;
  realization_type: RealizationType;
  reported_at: string;
  before_image_url?: string;
  evidence_urls: string[];
  verification_status: RealizationVerificationStatus;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  assigned_region_id?: string; // For Koordinator Wilayah
  assigned_village_id?: string;
  assigned_unit_id?: string; // For Operator RT/RW
  active: boolean;
  avatar?: string;
  password?: string;
  password_hash?: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'volunteer_unit' | 'aspiration' | 'follow_up' | 'realization' | 'user' | 'region';
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'VERIFY' | 'STATUS_CHANGE' | 'DELETE';
  actor_name: string;
  actor_role: string;
  summary: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalRwRegistered: number;
  totalRwActive: number;
  totalRtRegistered: number;
  totalRtActive: number;
  coveredVillagesCount: number;
  totalAspirations: number;
  inProgressAspirations: number;
  waitingResponseAspirations: number;
  receivedResponsesCount: number;
  verifiedRealizationsCount: number;
}
