import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRwUniqueness,
  validateRtUniqueness,
  calculateDashboardStats,
  generateAspirationNumber,
  canUserAccessContacts,
  maskContact
} from './rules.ts';
import type { VolunteerUnit, Aspiration, RealizationRecord } from '../types/index.ts';

test('RW Uniqueness: rejects duplicate RW number in the same village', () => {
  const existingUnits: VolunteerUnit[] = [
    {
      id: 'rw-1',
      unit_type: 'RW',
      region_id: 'kec-pasarkemis',
      village_id: 'vil-sukaasih',
      rw_number: '05',
      registered_at: '2026-01-10',
      status: 'Aktif',
      created_at: '2026-01-10',
      updated_at: '2026-01-10'
    }
  ];

  // Try duplicate RW 05 in same village
  const resDuplicate = validateRwUniqueness(existingUnits, 'vil-sukaasih', '5');
  assert.equal(resDuplicate.valid, false);
  assert.match(resDuplicate.error || '', /sudah terdaftar/i);

  // Different village is allowed
  const resDiffVillage = validateRwUniqueness(existingUnits, 'vil-kutabumi', '05');
  assert.equal(resDiffVillage.valid, true);

  // Different RW number in same village is allowed
  const resDiffRw = validateRwUniqueness(existingUnits, 'vil-sukaasih', '06');
  assert.equal(resDiffRw.valid, true);
});

test('RT Uniqueness: validates RT within designated RW and village', () => {
  const existingUnits: VolunteerUnit[] = [
    {
      id: 'rt-1',
      unit_type: 'RT',
      region_id: 'kec-pasarkemis',
      village_id: 'vil-kutabumi',
      rw_number: '02',
      rt_number: '04',
      registered_at: '2026-01-15',
      status: 'Aktif',
      created_at: '2026-01-15',
      updated_at: '2026-01-15'
    }
  ];

  // Duplicate RT 04 in RW 02 same village
  const resDuplicate = validateRtUniqueness(existingUnits, 'vil-kutabumi', '02', '4');
  assert.equal(resDuplicate.valid, false);

  // Different RT in same RW is allowed
  const resDiffRt = validateRtUniqueness(existingUnits, 'vil-kutabumi', '02', '05');
  assert.equal(resDiffRt.valid, true);

  // Same RT number but different RW is allowed
  const resDiffRw = validateRtUniqueness(existingUnits, 'vil-kutabumi', '03', '04');
  assert.equal(resDiffRw.valid, true);
});

test('Decoupled Stats Calculation: strictly distinguishes RW and RT statistics', () => {
  const units: VolunteerUnit[] = [
    {
      id: 'u1',
      unit_type: 'RW',
      region_id: 'kec-pasarkemis',
      village_id: 'v1',
      rw_number: '01',
      status: 'Aktif',
      registered_at: '2026-01-01',
      created_at: '',
      updated_at: ''
    },
    {
      id: 'u2',
      unit_type: 'RW',
      region_id: 'kec-pasarkemis',
      village_id: 'v1',
      rw_number: '02',
      status: 'Menunggu Verifikasi',
      registered_at: '2026-01-01',
      created_at: '',
      updated_at: ''
    },
    {
      id: 'u3',
      unit_type: 'RT',
      region_id: 'kec-pasarkemis',
      village_id: 'v1',
      rw_number: '01',
      rt_number: '01',
      status: 'Aktif',
      registered_at: '2026-01-01',
      created_at: '',
      updated_at: ''
    },
    {
      id: 'u4',
      unit_type: 'RT',
      region_id: 'kec-pasarkemis',
      village_id: 'v2',
      rw_number: '01',
      rt_number: '02',
      status: 'Tidak Aktif',
      registered_at: '2026-01-01',
      created_at: '',
      updated_at: ''
    }
  ];

  const aspirations: Aspiration[] = [
    {
      id: 'a1',
      aspiration_number: 'ASP/2026/PKM-001',
      title: 'Perbaikan Jalan',
      description: 'Jalan berlubang',
      category_id: 'cat-infra',
      region_id: 'kec-pasarkemis',
      village_id: 'v1',
      source_type: 'Masyarakat',
      submitted_at: '2026-02-01',
      location_description: 'Jl. Utama',
      attachment_urls: [],
      priority: 'Tinggi',
      current_status: 'Dalam Proses',
      created_by: 'Warga',
      updated_at: '2026-02-01'
    },
    {
      id: 'a2',
      aspiration_number: 'ASP/2026/PKM-002',
      title: 'Penerangan Jalan',
      description: 'Lampu mati',
      category_id: 'cat-infra',
      region_id: 'kec-pasarkemis',
      village_id: 'v2',
      source_type: 'Unit RT',
      submitted_at: '2026-02-02',
      location_description: 'Gang 3',
      attachment_urls: [],
      priority: 'Sedang',
      current_status: 'Menunggu Tanggapan',
      created_by: 'RT 01',
      updated_at: '2026-02-02'
    },
    {
      id: 'a3',
      aspiration_number: 'ASP/2026/PKM-003',
      title: 'Saluran Air',
      description: 'Got tersumbat',
      category_id: 'cat-lingkungan',
      region_id: 'kec-pasarkemis',
      village_id: 'v1',
      source_type: 'Unit RW',
      submitted_at: '2026-02-03',
      location_description: 'RW 01',
      attachment_urls: [],
      priority: 'Tinggi',
      current_status: 'Realisasi Terverifikasi',
      created_by: 'RW 01',
      updated_at: '2026-02-03'
    }
  ];

  const stats = calculateDashboardStats(units, aspirations, []);

  assert.equal(stats.totalRwRegistered, 2);
  assert.equal(stats.totalRwActive, 1);
  assert.equal(stats.totalRtRegistered, 2);
  assert.equal(stats.totalRtActive, 1);
  assert.equal(stats.coveredVillagesCount, 2);
  assert.equal(stats.totalAspirations, 3);
  assert.equal(stats.inProgressAspirations, 1);
  assert.equal(stats.waitingResponseAspirations, 1);
  assert.equal(stats.verifiedRealizationsCount, 1);
});

test('Aspiration Number Generator: generates standard sequence code', () => {
  const code = generateAspirationNumber(7, 'PKM', 2026);
  assert.equal(code, 'ASP/2026/PKM-007');
});

test('RBAC Contact Masking: preserves coordinator privacy for unauthorized viewers', () => {
  assert.equal(canUserAccessContacts('Admin Utama'), true);
  assert.equal(canUserAccessContacts('Admin Operasional'), true);
  assert.equal(canUserAccessContacts('Koordinator Wilayah'), true);
  assert.equal(canUserAccessContacts('Viewer'), false);
  assert.equal(canUserAccessContacts('Operator RT/RW'), false);

  const masked = maskContact('081234567890');
  assert.equal(masked, '0812****90');
});
