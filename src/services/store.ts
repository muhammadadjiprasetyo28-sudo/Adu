import type {
  Region,
  VolunteerUnit,
  AspirationCategory,
  Aspiration,
  FollowUpRecord,
  RealizationRecord,
  User,
  AuditLog,
  DashboardStats,
  UserRole
} from '../types/index.ts';
import {
  INITIAL_REGIONS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_VOLUNTEER_UNITS,
  INITIAL_ASPIRATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_REALIZATIONS,
  INITIAL_AUDIT_LOGS
} from './seedData.ts';
import type { AppDatabase } from './seedData.ts';

const TOKEN_KEY = 'sahabat_adu_jwt_token';
const CURRENT_USER_KEY = 'sahabat_adu_current_user';

export {
  INITIAL_REGIONS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_VOLUNTEER_UNITS,
  INITIAL_ASPIRATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_REALIZATIONS,
  INITIAL_AUDIT_LOGS
};
export type { AppDatabase };

class AppStore {
  private db: AppDatabase;
  private currentUser: User;
  private token: string | null = null;
  private isOnlineApi: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.token = this.loadToken();
    this.currentUser = this.loadCurrentUser();
    this.db = {
      regions: INITIAL_REGIONS,
      volunteerUnits: INITIAL_VOLUNTEER_UNITS,
      categories: INITIAL_CATEGORIES,
      aspirations: INITIAL_ASPIRATIONS,
      followUps: INITIAL_FOLLOW_UPS,
      realizations: INITIAL_REALIZATIONS,
      users: INITIAL_USERS,
      auditLogs: INITIAL_AUDIT_LOGS
    };

    // Auto-fetch fresh data from Backend API on initialization
    this.initFromApi();
  }

  private loadToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private setToken(tok: string | null) {
    this.token = tok;
    try {
      if (tok) {
        localStorage.setItem(TOKEN_KEY, tok);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }

  private loadCurrentUser(): User {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_USERS[0];
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public async initFromApi() {
    try {
      // 1. If we have a token, fetch authorized internal state
      if (this.token) {
        const res = await fetch('/api/internal/state', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            this.db = json.data;
            this.currentUser = json.currentUser || this.currentUser;
            this.isOnlineApi = true;
            this.notify();
            return;
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token expired, clear it
          this.setToken(null);
        }
      }

      // 2. Fallback to public data from server
      const pubRes = await fetch('/api/public/data');
      if (pubRes.ok) {
        const pubJson = await pubRes.json();
        if (pubJson.success) {
          this.db.regions = pubJson.regions || this.db.regions;
          this.db.categories = pubJson.categories || this.db.categories;
          this.db.aspirations = pubJson.aspirations || this.db.aspirations;
          this.db.realizations = pubJson.realizations || this.db.realizations;
          this.isOnlineApi = true;
          this.notify();
        }
      }
    } catch (e) {
      console.warn('[Store] Backend API call failed, running with local seed memory cache:', e);
    }
  }

  public getIsOnlineApi(): boolean {
    return this.isOnlineApi;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch {}
    this.notify();
  }

  public async loginWithApi(
    payload: { email?: string; password?: string; userId?: string }
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
        await this.initFromApi();
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Gagal masuk ke sistem.' };
    } catch (err: any) {
      // Local fallback
      const found = payload.userId
        ? this.db.users.find((u) => u.id === payload.userId)
        : this.db.users.find((u) => u.email.toLowerCase() === (payload.email || '').trim().toLowerCase());
      if (found) {
        this.setCurrentUser(found);
        return { success: true, user: found };
      }
      return { success: false, error: 'Koneksi API bermasalah dan pengguna tidak ditemukan.' };
    }
  }

  public logout() {
    this.setToken(null);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    this.currentUser = INITIAL_USERS[0];
    this.notify();
  }

  public getDatabase(): AppDatabase {
    return this.db;
  }

  // --- CRUD OPERATIONS WITH API SYNC ---

  public getRegions(): Region[] {
    return this.db.regions;
  }

  public getCategories(): AspirationCategory[] {
    return this.db.categories;
  }

  public getVolunteerUnits(): VolunteerUnit[] {
    return this.db.volunteerUnits;
  }

  public getAspirations(): Aspiration[] {
    return this.db.aspirations;
  }

  public getRealizations(): RealizationRecord[] {
    return this.db.realizations;
  }

  public getUsers(): User[] {
    return this.db.users;
  }

  public getAuditLogs(): AuditLog[] {
    return this.db.auditLogs;
  }

  public async addVolunteerUnit(
    data: Omit<VolunteerUnit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; data?: VolunteerUnit; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch('/api/internal/volunteers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (resData.success) {
          this.db.volunteerUnits.unshift(resData.data);
          this.notify();
          return { success: true, data: resData.data };
        }
        return { success: false, error: resData.error };
      }
    } catch (e: any) {
      console.warn('API error, falling back locally', e);
    }

    // Local fallback
    const newUnit: VolunteerUnit = {
      ...data,
      id: `unit-${data.unit_type.toLowerCase()}-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.db.volunteerUnits.unshift(newUnit);
    this.notify();
    return { success: true, data: newUnit };
  }

  public async updateVolunteerUnit(
    id: string,
    updates: Partial<VolunteerUnit>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch(`/api/internal/volunteers/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(updates)
        });
        const resData = await res.json();
        if (resData.success) {
          const idx = this.db.volunteerUnits.findIndex((u) => u.id === id);
          if (idx !== -1) this.db.volunteerUnits[idx] = resData.data;
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API update failed, applying locally', e);
    }

    const idx = this.db.volunteerUnits.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.db.volunteerUnits[idx] = {
        ...this.db.volunteerUnits[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.notify();
      return { success: true };
    }
    return { success: false, error: 'Unit relawan tidak ditemukan.' };
  }

  public async setVolunteerUnitStatus(
    id: string,
    status: VolunteerUnit['status']
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateVolunteerUnit(id, {
      status,
      verified_at: status === 'Aktif' ? new Date().toISOString().split('T')[0] : undefined
    });
  }

  public async addAspiration(
    data: Omit<Aspiration, 'id' | 'aspiration_number' | 'updated_at'>
  ): Promise<{ success: boolean; data?: Aspiration; error?: string }> {
    try {
      const endpoint = this.token ? '/api/internal/aspirations' : '/api/public/aspirations';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        this.db.aspirations.unshift(resData.data);
        this.notify();
        return { success: true, data: resData.data };
      }
      return { success: false, error: resData.error };
    } catch (e) {
      console.warn('API error, falling back locally', e);
    }

    // Local fallback
    const count = this.db.aspirations.length + 1;
    const year = new Date().getFullYear();
    const newAsp: Aspiration = {
      ...data,
      id: `asp-${Date.now()}`,
      aspiration_number: `ASP/${year}/PKM-${String(count).padStart(3, '0')}`,
      updated_at: new Date().toISOString()
    };
    this.db.aspirations.unshift(newAsp);
    this.notify();
    return { success: true, data: newAsp };
  }

  public async updateAspirationStatus(
    id: string,
    newStatus: Aspiration['current_status'],
    notes?: string,
    target_agency?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch(`/api/internal/aspirations/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ status: newStatus, notes, target_agency })
        });
        const resData = await res.json();
        if (resData.success) {
          const idx = this.db.aspirations.findIndex((a) => a.id === id);
          if (idx !== -1) this.db.aspirations[idx] = resData.data;
          if (resData.followUp) this.db.followUps.unshift(resData.followUp);
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const asp = this.db.aspirations.find((a) => a.id === id);
    if (asp) {
      asp.current_status = newStatus;
      asp.updated_at = new Date().toISOString();
      this.db.followUps.unshift({
        id: `flw-${Date.now()}`,
        aspiration_id: id,
        status_change: newStatus,
        action_type: `Status diubah ke ${newStatus}`,
        notes: notes || '-',
        performed_by: this.currentUser.name,
        follow_up_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });
      this.notify();
      return { success: true };
    }
    return { success: false, error: 'Aspirasi tidak ditemukan.' };
  }

  public async addFollowUp(
    record: Omit<FollowUpRecord, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch('/api/internal/follow-ups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(record)
        });
        const resData = await res.json();
        if (resData.success) {
          this.db.followUps.unshift(resData.data);
          if (record.status_change) {
            const asp = this.db.aspirations.find((a) => a.id === record.aspiration_id);
            if (asp) asp.current_status = record.status_change;
          }
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const newFlw: FollowUpRecord = {
      ...record,
      id: `flw-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.db.followUps.unshift(newFlw);
    if (record.status_change) {
      const asp = this.db.aspirations.find((a) => a.id === record.aspiration_id);
      if (asp) asp.current_status = record.status_change;
    }
    this.notify();
    return { success: true };
  }

  public async addRealization(
    data: Omit<RealizationRecord, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch('/api/internal/realizations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (resData.success) {
          this.db.realizations.unshift(resData.data);
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const newRel: RealizationRecord = {
      ...data,
      id: `rel-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.db.realizations.unshift(newRel);
    this.notify();
    return { success: true };
  }

  public async verifyRealization(
    realizationId: string,
    status: 'Terverifikasi' | 'Perlu Perbaikan',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch(`/api/internal/realizations/${realizationId}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ status, notes })
        });
        const resData = await res.json();
        if (resData.success) {
          const idx = this.db.realizations.findIndex((r) => r.id === realizationId);
          if (idx !== -1) this.db.realizations[idx] = resData.data;
          if (status === 'Terverifikasi') {
            const asp = this.db.aspirations.find((a) => a.id === resData.data.aspiration_id);
            if (asp) asp.current_status = 'Realisasi Terverifikasi';
          }
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const rel = this.db.realizations.find((r) => r.id === realizationId);
    if (rel) {
      rel.verification_status = status;
      rel.verified_by = this.currentUser.name;
      rel.verified_at = new Date().toISOString();
      if (notes) rel.notes = notes;
      if (status === 'Terverifikasi') {
        const asp = this.db.aspirations.find((a) => a.id === rel.aspiration_id);
        if (asp) asp.current_status = 'Realisasi Terverifikasi';
      }
      this.notify();
      return { success: true };
    }
    return { success: false, error: 'Realisasi tidak ditemukan.' };
  }

  public async addUser(user: Omit<User, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch('/api/internal/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(user)
        });
        const resData = await res.json();
        if (resData.success) {
          this.db.users.push(resData.data);
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`
    };
    this.db.users.push(newUser);
    this.notify();
    return { success: true };
  }

  public async updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.token) {
        const res = await fetch(`/api/internal/users/${userId}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ role: newRole })
        });
        const resData = await res.json();
        if (resData.success) {
          const idx = this.db.users.findIndex((u) => u.id === userId);
          if (idx !== -1) this.db.users[idx].role = newRole;
          this.notify();
          return { success: true };
        }
        return { success: false, error: resData.error };
      }
    } catch (e) {
      console.warn('API error, applying locally', e);
    }

    const u = this.db.users.find((user) => user.id === userId);
    if (u) {
      u.role = newRole;
      this.notify();
      return { success: true };
    }
    return { success: false, error: 'User tidak ditemukan.' };
  }

  public getDashboardStats(): DashboardStats {
    const rwUnits = this.db.volunteerUnits.filter((u) => u.unit_type === 'RW');
    const rtUnits = this.db.volunteerUnits.filter((u) => u.unit_type === 'RT');
    const uniqueVillages = new Set(this.db.volunteerUnits.map((u) => u.village_id));

    const inProgressCount = this.db.aspirations.filter((a) =>
      ['Verifikasi', 'Terverifikasi', 'Ditelaah', 'Diteruskan kepada Pihak Terkait', 'Dalam Proses'].includes(a.current_status)
    ).length;
    const waitingResponseCount = this.db.aspirations.filter((a) => a.current_status === 'Menunggu Tanggapan').length;
    const receivedResponsesCount = this.db.aspirations.filter((a) => a.current_status === 'Tanggapan Diterima').length;
    const verifiedRealizationsCount = this.db.aspirations.filter(
      (a) =>
        a.current_status === 'Realisasi Terverifikasi' ||
        this.db.realizations.some((r) => r.aspiration_id === a.id && r.verification_status === 'Terverifikasi')
    ).length;

    return {
      totalRwRegistered: rwUnits.length,
      totalRwActive: rwUnits.filter((u) => u.status === 'Aktif').length,
      totalRtRegistered: rtUnits.length,
      totalRtActive: rtUnits.filter((u) => u.status === 'Aktif').length,
      coveredVillagesCount: uniqueVillages.size,
      totalAspirations: this.db.aspirations.length,
      inProgressAspirations: inProgressCount,
      waitingResponseAspirations: waitingResponseCount,
      receivedResponsesCount,
      verifiedRealizationsCount
    };
  }

  public addRegion(data: Omit<Region, 'id'>): { success: boolean; data?: Region } {
    const newReg: Region = {
      ...data,
      id: `reg-${Date.now()}`
    };
    this.db.regions.push(newReg);
    this.notify();
    return { success: true, data: newReg };
  }

  public getKecamatanList(): Region[] {
    return this.db.regions.filter((r) => r.type === 'kecamatan');
  }

  public getVillagesByKecamatan(kecamatanId: string): Region[] {
    return this.db.regions.filter((r) => r.type === 'desa_kelurahan' && r.parent_id === kecamatanId);
  }

  public async resetToDefault(): Promise<void> {
    try {
      if (this.token) {
        await fetch('/api/internal/reset-data', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` }
        });
      }
    } catch {}

    this.db = {
      regions: INITIAL_REGIONS,
      volunteerUnits: INITIAL_VOLUNTEER_UNITS,
      categories: INITIAL_CATEGORIES,
      aspirations: INITIAL_ASPIRATIONS,
      followUps: INITIAL_FOLLOW_UPS,
      realizations: INITIAL_REALIZATIONS,
      users: INITIAL_USERS,
      auditLogs: INITIAL_AUDIT_LOGS
    };
    this.notify();
  }
}

export const store = new AppStore();
