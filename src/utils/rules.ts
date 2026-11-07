import type {
  VolunteerUnit,
  Aspiration,
  RealizationRecord,
  DashboardStats,
  UserRole,
  AspirationStatus
} from '../types/index.ts';

/**
 * Validates that an RW unit is unique within its village.
 * Unit RW hanya boleh memiliki satu identitas untuk nomor RW yang sama dalam desa/kelurahan yang sama.
 */
export function validateRwUniqueness(
  existingUnits: VolunteerUnit[],
  villageId: string,
  rwNumber: string,
  excludeId?: string
): { valid: boolean; error?: string } {
  const normalizedRw = rwNumber.trim().padStart(2, '0');
  const duplicate = existingUnits.find(
    (u) =>
      u.unit_type === 'RW' &&
      u.village_id === villageId &&
      u.rw_number.trim().padStart(2, '0') === normalizedRw &&
      u.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      error: `Unit RW ${normalizedRw} sudah terdaftar pada desa/kelurahan ini. Setiap RW hanya boleh memiliki 1 unit terdaftar.`
    };
  }

  return { valid: true };
}

/**
 * Validates that an RT unit is unique within its RW and village.
 * Unit RT harus terhubung dengan RW dan desa/kelurahan yang benar.
 */
export function validateRtUniqueness(
  existingUnits: VolunteerUnit[],
  villageId: string,
  rwNumber: string,
  rtNumber: string,
  excludeId?: string
): { valid: boolean; error?: string } {
  const normalizedRw = rwNumber.trim().padStart(2, '0');
  const normalizedRt = rtNumber.trim().padStart(2, '0');

  const duplicate = existingUnits.find(
    (u) =>
      u.unit_type === 'RT' &&
      u.village_id === villageId &&
      u.rw_number.trim().padStart(2, '0') === normalizedRw &&
      (u.rt_number || '').trim().padStart(2, '0') === normalizedRt &&
      u.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      error: `Unit RT ${normalizedRt} pada RW ${normalizedRw} sudah terdaftar pada desa/kelurahan ini.`
    };
  }

  return { valid: true };
}

/**
 * Calculates strictly decoupled statistics.
 * RW aktif dan RT aktif dihitung terpisah, tanpa menghitung RT sebagai RW atau sebaliknya.
 */
export function calculateDashboardStats(
  units: VolunteerUnit[],
  aspirations: Aspiration[],
  realizations: RealizationRecord[]
): DashboardStats {
  const rwUnits = units.filter((u) => u.unit_type === 'RW');
  const rtUnits = units.filter((u) => u.unit_type === 'RT');

  const totalRwRegistered = rwUnits.length;
  const totalRwActive = rwUnits.filter((u) => u.status === 'Aktif').length;

  const totalRtRegistered = rtUnits.length;
  const totalRtActive = rtUnits.filter((u) => u.status === 'Aktif').length;

  // Desa terjangkau: village_ids with at least one RW or RT unit
  const uniqueVillages = new Set(units.map((u) => u.village_id));
  const coveredVillagesCount = uniqueVillages.size;

  const totalAspirations = aspirations.length;

  const inProgressStatuses: AspirationStatus[] = [
    'Verifikasi',
    'Terverifikasi',
    'Ditelaah',
    'Diteruskan kepada Pihak Terkait',
    'Dalam Proses'
  ];
  const inProgressAspirations = aspirations.filter((a) =>
    inProgressStatuses.includes(a.current_status)
  ).length;

  const waitingResponseAspirations = aspirations.filter(
    (a) => a.current_status === 'Menunggu Tanggapan'
  ).length;

  const receivedResponsesCount = aspirations.filter(
    (a) => a.current_status === 'Tanggapan Diterima'
  ).length;

  // Verified realizations from verified status or realization records
  const verifiedRealizationsCount = aspirations.filter(
    (a) =>
      a.current_status === 'Realisasi Terverifikasi' ||
      realizations.some(
        (r) => r.aspiration_id === a.id && r.verification_status === 'Terverifikasi'
      )
  ).length;

  return {
    totalRwRegistered,
    totalRwActive,
    totalRtRegistered,
    totalRtActive,
    coveredVillagesCount,
    totalAspirations,
    inProgressAspirations,
    waitingResponseAspirations,
    receivedResponsesCount,
    verifiedRealizationsCount
  };
}

/**
 * Generates official formatted Aspiration number e.g. ASP/2026/PKM-001
 */
export function generateAspirationNumber(
  sequenceNumber: number,
  subdistrictCode: string = 'PKM',
  year: number = 2026
): string {
  const seqPadded = String(sequenceNumber).padStart(3, '0');
  return `ASP/${year}/${subdistrictCode.toUpperCase()}-${seqPadded}`;
}

/**
 * Security/RBAC check: coordinator contacts must only be accessible to permitted roles
 */
export function canUserAccessContacts(role: UserRole): boolean {
  return role === 'Admin Utama' || role === 'Admin Operasional' || role === 'Koordinator Wilayah';
}

/**
 * Security/RBAC check: can user verify volunteer units
 */
export function canUserVerifyUnits(role: UserRole): boolean {
  return role === 'Admin Utama' || role === 'Admin Operasional';
}

/**
 * Security/RBAC check: can user verify realization
 */
export function canUserVerifyRealization(role: UserRole): boolean {
  return role === 'Admin Utama' || role === 'Admin Operasional';
}

/**
 * Mask sensitive coordinator phone number for public/viewer privacy
 */
export function maskContact(contact?: string): string {
  if (!contact) return '-';
  const clean = contact.trim();
  if (clean.length <= 4) return '****';
  return clean.slice(0, 4) + '****' + clean.slice(-2);
}
