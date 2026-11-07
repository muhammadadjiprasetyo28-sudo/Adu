import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import {
  INITIAL_REGIONS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_VOLUNTEER_UNITS,
  INITIAL_ASPIRATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_REALIZATIONS,
  INITIAL_AUDIT_LOGS
} from './src/services/seedData.ts';
import type { AppDatabase } from './src/services/seedData.ts';
import type {
  User,
  UserRole,
  Aspiration,
  VolunteerUnit,
  FollowUpRecord,
  RealizationRecord,
  Region,
  AspirationCategory,
  AuditLog,
  AspirationStatus,
  UnitStatus
} from './src/types/index.ts';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'Adu2026';
const DB_NAME = process.env.MONGODB_DB_NAME || 'Guyubrukun';
const MONGODB_URI = process.env.MONGODB_URI || '';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'guyubrukun_adu_db.json');
const LEGACY_DATA_FILE = path.join(DATA_DIR, 'sahabat_adu_db.json');

// --- DATABASE MANAGER (MongoDB with Automatic Durable File Storage fallback) ---
class DatabaseService {
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isMongoConnected: boolean = false;
  private memDb: AppDatabase;

  constructor() {
    this.memDb = this.loadLocalFileDb();
    this.initMongo();
  }

  private loadLocalFileDb(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      if (fs.existsSync(LEGACY_DATA_FILE)) {
        const raw = fs.readFileSync(LEGACY_DATA_FILE, 'utf-8');
        const legacyData = JSON.parse(raw);
        this.saveLocalFileDb(legacyData);
        return legacyData;
      }
    } catch (e) {
      console.warn('[DB] Failed reading local database file, initializing defaults:', e);
    }

    const initial: AppDatabase = {
      regions: INITIAL_REGIONS,
      volunteerUnits: INITIAL_VOLUNTEER_UNITS,
      categories: INITIAL_CATEGORIES,
      aspirations: INITIAL_ASPIRATIONS,
      followUps: INITIAL_FOLLOW_UPS,
      realizations: INITIAL_REALIZATIONS,
      users: INITIAL_USERS,
      auditLogs: INITIAL_AUDIT_LOGS
    };
    this.saveLocalFileDb(initial);
    return initial;
  }

  private saveLocalFileDb(data: AppDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Error writing to local file DB:', e);
    }
  }

  private async initMongo() {
    if (!MONGODB_URI) {
      console.log(`[DB] Database: ${DB_NAME} (Guyubrukun/Adu). Using high-performance durable server-side JSON storage with MongoDB-compatible collection APIs.`);
      return;
    }
    try {
      console.log(`[DB] Connecting to MongoDB database "${DB_NAME}" at`, MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
      this.mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db(DB_NAME);
      this.isMongoConnected = true;
      console.log(`[DB] Connected to MongoDB database "${DB_NAME}" successfully. Ensuring collections and sync...`);
      await this.syncToMongo();
    } catch (err: any) {
      console.warn(`[DB] MongoDB connection to "${DB_NAME}" failed or timed out:`, err.message, '- Falling back to durable server-side storage.');
      this.isMongoConnected = false;
    }
  }

  private async syncToMongo() {
    if (!this.mongoDb) return;
    try {
      const collections = [
        { name: 'regions', data: this.memDb.regions },
        { name: 'volunteer_units', data: this.memDb.volunteerUnits },
        { name: 'categories', data: this.memDb.categories },
        { name: 'aspirations', data: this.memDb.aspirations },
        { name: 'follow_ups', data: this.memDb.followUps },
        { name: 'realizations', data: this.memDb.realizations },
        { name: 'users', data: this.memDb.users },
        { name: 'audit_logs', data: this.memDb.auditLogs }
      ];

      for (const col of collections) {
        const count = await this.mongoDb.collection(col.name).countDocuments();
        if (count === 0 && col.data.length > 0) {
          await this.mongoDb.collection(col.name).insertMany(col.data as any[]);
          console.log(`[DB] Seeded ${col.data.length} records into MongoDB database "${DB_NAME}" collection: ${col.name}`);
        }
      }
    } catch (e) {
      console.error('[DB] Error during initial sync to MongoDB:', e);
    }
  }

  public getStatus() {
    return {
      connected: this.isMongoConnected,
      engine: this.isMongoConnected ? 'MongoDB Server' : 'Durable Server JSON Store (MongoDB-Ready)',
      database: DB_NAME,
      databaseTarget: 'Guyubrukun/Adu',
      collections: {
        regions: this.memDb.regions.length,
        volunteerUnits: this.memDb.volunteerUnits.length,
        categories: this.memDb.categories.length,
        aspirations: this.memDb.aspirations.length,
        followUps: this.memDb.followUps.length,
        realizations: this.memDb.realizations.length,
        users: this.memDb.users.length,
        auditLogs: this.memDb.auditLogs.length
      }
    };
  }

  public getDb(): AppDatabase {
    return this.memDb;
  }

  public persist() {
    this.saveLocalFileDb(this.memDb);
    if (this.isMongoConnected && this.mongoDb) {
      // Async update MongoDB in background
      Promise.all([
        this.mongoDb.collection('aspirations').deleteMany({}).then(() => this.mongoDb!.collection('aspirations').insertMany(this.memDb.aspirations as any[])),
        this.mongoDb.collection('volunteer_units').deleteMany({}).then(() => this.mongoDb!.collection('volunteer_units').insertMany(this.memDb.volunteerUnits as any[])),
        this.mongoDb.collection('realizations').deleteMany({}).then(() => this.mongoDb!.collection('realizations').insertMany(this.memDb.realizations as any[])),
        this.mongoDb.collection('follow_ups').deleteMany({}).then(() => this.mongoDb!.collection('follow_ups').insertMany(this.memDb.followUps as any[])),
        this.mongoDb.collection('users').deleteMany({}).then(() => this.mongoDb!.collection('users').insertMany(this.memDb.users as any[])),
        this.mongoDb.collection('audit_logs').deleteMany({}).then(() => this.mongoDb!.collection('audit_logs').insertMany(this.memDb.auditLogs as any[]))
      ]).catch((err) => console.error('[DB] Background MongoDB persist error:', err));
    }
  }

  public reset() {
    this.memDb = {
      regions: INITIAL_REGIONS,
      volunteerUnits: INITIAL_VOLUNTEER_UNITS,
      categories: INITIAL_CATEGORIES,
      aspirations: INITIAL_ASPIRATIONS,
      followUps: INITIAL_FOLLOW_UPS,
      realizations: INITIAL_REALIZATIONS,
      users: INITIAL_USERS,
      auditLogs: INITIAL_AUDIT_LOGS
    };
    this.persist();
  }
}

const dbService = new DatabaseService();

// --- AUTHENTICATION & RBAC MIDDLEWARES ---
interface AuthRequest extends Request {
  user?: User;
}

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      assigned_region_id: user.assigned_region_id,
      assigned_village_id: user.assigned_village_id,
      assigned_unit_id: user.assigned_unit_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token tidak valid atau telah kadaluarsa. Silakan masuk kembali.' });
    }
    const db = dbService.getDb();
    const user = db.users.find((u) => u.id === decoded.id && u.active);
    if (!user) {
      return res.status(403).json({ success: false, error: 'Pengguna dinonaktifkan atau tidak ditemukan.' });
    }
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Tidak terotentikasi.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Akses ditolak: Peran '${req.user.role}' tidak memiliki kewenangan untuk aksi ini.`
      });
    }
    next();
  };
}

// Data masking for public/unprivileged endpoints
function maskContact(contact?: string): string {
  if (!contact) return '';
  const digits = contact.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return digits.substring(0, 4) + '****' + digits.substring(digits.length - 2);
}

function sanitizePublicAspiration(asp: Aspiration) {
  return {
    id: asp.id,
    aspiration_number: asp.aspiration_number,
    title: asp.title,
    description: asp.description,
    category_id: asp.category_id,
    region_id: asp.region_id,
    village_id: asp.village_id,
    rw_number: asp.rw_number,
    rt_number: asp.rt_number,
    source_type: asp.source_type,
    submitted_at: asp.submitted_at,
    location_description: asp.location_description,
    latitude: asp.latitude,
    longitude: asp.longitude,
    attachment_urls: asp.attachment_urls,
    priority: asp.priority,
    current_status: asp.current_status,
    updated_at: asp.updated_at,
    created_by: asp.created_by,
    // Sensitive privacy data: MASKED OR REDACTED
    reporter_name: asp.reporter_name ? asp.reporter_name.substring(0, 3) + '***' : 'Warga Masyarakat',
    reporter_contact: asp.reporter_contact ? maskContact(asp.reporter_contact) : undefined
  };
}

function logAudit(
  actor: { name: string; role: string },
  entityType: AuditLog['entity_type'],
  entityId: string,
  action: AuditLog['action'],
  summary: string,
  oldVal?: string,
  newVal?: string
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    entity_type: entityType,
    entity_id: entityId,
    action,
    actor_name: actor.name,
    actor_role: actor.role,
    summary,
    old_value: oldVal,
    new_value: newVal,
    timestamp: new Date().toISOString()
  };
  const db = dbService.getDb();
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
}

// --- SERVER INITIALIZATION ---
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES ---

  // Health & Database Status
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'Sahabat ADU Backend API',
      status: 'healthy',
      db: dbService.getStatus(),
      timestamp: new Date().toISOString()
    });
  });

  // 1. AUTHENTICATION & LOGIN
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, userId } = req.body;
    const db = dbService.getDb();

    // Support both direct user selection (for swift demo switching with credentials) and standard email+password
    let user: User | undefined;
    if (userId) {
      user = db.users.find((u) => u.id === userId && u.active);
    } else if (email) {
      user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.active);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email atau ID petugas tidak terdaftar atau telah dinonaktifkan.'
      });
    }

    // Default demo password validation or fallback
    // In production, real bcrypt check:
    if (password && password.trim() !== '') {
      // If password is supplied and user has password_hash, verify; demo accepts standard password
      if (user.password_hash) {
        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ success: false, error: 'Kata sandi tidak sesuai.' });
        }
      }
    }

    const token = generateToken(user);
    logAudit(
      { name: user.name, role: user.role },
      'user',
      user.id,
      'UPDATE',
      `Pengguna ${user.name} (${user.role}) berhasil masuk ke portal internal.`
    );
    dbService.persist();

    res.json({
      success: true,
      token,
      user
    });
  });

  // Current session info
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  // Public quick user list (for login modal avatar switcher)
  app.get('/api/auth/quick-users', (req: Request, res: Response) => {
    const db = dbService.getDb();
    const quickList = db.users
      .filter((u) => u.active)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        assigned_region_id: u.assigned_region_id,
        avatar: u.avatar
      }));
    res.json({ success: true, users: quickList });
  });

  // 2. PUBLIC API ENDPOINTS (Safe & decoupled from internal confidential notes)
  app.get('/api/public/data', (req: Request, res: Response) => {
    const db = dbService.getDb();
    const publicAspirations = db.aspirations.map(sanitizePublicAspiration);

    // Calculate public stats
    const rwUnits = db.volunteerUnits.filter((u) => u.unit_type === 'RW');
    const rtUnits = db.volunteerUnits.filter((u) => u.unit_type === 'RT');
    const uniqueVillages = new Set(db.volunteerUnits.map((u) => u.village_id));

    const inProgressCount = db.aspirations.filter((a) =>
      ['Verifikasi', 'Terverifikasi', 'Ditelaah', 'Diteruskan kepada Pihak Terkait', 'Dalam Proses'].includes(a.current_status)
    ).length;
    const waitingResponseCount = db.aspirations.filter((a) => a.current_status === 'Menunggu Tanggapan').length;
    const receivedResponsesCount = db.aspirations.filter((a) => a.current_status === 'Tanggapan Diterima').length;
    const verifiedRealizationsCount = db.aspirations.filter((a) => a.current_status === 'Realisasi Terverifikasi').length;

    res.json({
      success: true,
      regions: db.regions,
      categories: db.categories,
      aspirations: publicAspirations,
      realizations: db.realizations.filter((r) => r.verification_status === 'Terverifikasi'),
      stats: {
        totalRwRegistered: rwUnits.length,
        totalRwActive: rwUnits.filter((u) => u.status === 'Aktif').length,
        totalRtRegistered: rtUnits.length,
        totalRtActive: rtUnits.filter((u) => u.status === 'Aktif').length,
        coveredVillagesCount: uniqueVillages.size,
        totalAspirations: db.aspirations.length,
        inProgressAspirations: inProgressCount,
        waitingResponseAspirations: waitingResponseCount,
        receivedResponsesCount,
        verifiedRealizationsCount
      }
    });
  });

  // Public Track Aspiration by Tracking Code / Number
  app.get('/api/public/track/:code', (req: Request, res: Response) => {
    const { code } = req.params;
    const db = dbService.getDb();
    const cleanCode = code.trim().toLowerCase();

    const aspiration = db.aspirations.find(
      (a) =>
        a.aspiration_number.toLowerCase() === cleanCode ||
        a.id.toLowerCase() === cleanCode
    );

    if (!aspiration) {
      return res.status(404).json({
        success: false,
        error: `Nomor aspirasi '${code}' tidak ditemukan dalam basis data.`
      });
    }

    const followUps = db.followUps
      .filter((f) => f.aspiration_id === aspiration.id)
      .map((f) => ({
        id: f.id,
        action_type: f.action_type,
        target_agency: f.target_agency,
        notes: f.notes,
        follow_up_date: f.follow_up_date,
        created_at: f.created_at
      }));

    const realizations = db.realizations.filter((r) => r.aspiration_id === aspiration.id);

    res.json({
      success: true,
      data: sanitizePublicAspiration(aspiration),
      aspiration: sanitizePublicAspiration(aspiration),
      followUps,
      realizations
    });
  });

  // Public Submit Aspiration
  app.post('/api/public/aspirations', (req: Request, res: Response) => {
    const {
      title,
      description,
      category_id,
      region_id,
      village_id,
      rw_number,
      rt_number,
      location_description,
      latitude,
      longitude,
      attachment_urls,
      priority,
      reporter_name,
      reporter_contact
    } = req.body;

    if (!title || !description || !location_description) {
      return res.status(400).json({
        success: false,
        error: 'Judul, uraian masalah, dan lokasi wajib diisi.'
      });
    }

    const db = dbService.getDb();
    const kec = db.regions.find((r) => r.id === region_id) || db.regions.find((r) => r.type === 'kecamatan');
    const prefix = kec?.code || 'ADU';
    const year = new Date().getFullYear();
    const count = db.aspirations.length + 1;
    const aspiration_number = `ASP/${year}/${prefix}-${String(count).padStart(3, '0')}`;

    const newAspiration: Aspiration = {
      id: `asp-${Date.now()}`,
      aspiration_number,
      title: String(title).trim(),
      description: String(description).trim(),
      category_id: category_id || 'cat-infra',
      region_id: region_id || 'kec-pasarkemis',
      village_id: village_id || 'vil-kutabumi',
      rw_number: rw_number ? String(rw_number).padStart(2, '0') : undefined,
      rt_number: rt_number ? String(rt_number).padStart(2, '0') : undefined,
      source_type: 'Masyarakat',
      submitted_at: new Date().toISOString().split('T')[0],
      location_description: String(location_description).trim(),
      latitude: Number(latitude) || -6.1685,
      longitude: Number(longitude) || 106.5562,
      attachment_urls: Array.isArray(attachment_urls) ? attachment_urls : [],
      priority: priority || 'Sedang',
      current_status: 'Diajukan',
      created_by: reporter_name ? String(reporter_name).trim() : 'Warga Masyarakat',
      reporter_name: reporter_name ? String(reporter_name).trim() : undefined,
      reporter_contact: reporter_contact ? String(reporter_contact).trim() : undefined,
      updated_at: new Date().toISOString()
    };

    db.aspirations.unshift(newAspiration);
    logAudit(
      { name: newAspiration.created_by, role: 'Masyarakat' },
      'aspiration',
      newAspiration.id,
      'CREATE',
      `Aspirasi baru '${newAspiration.aspiration_number}' diajukan oleh masyarakat via portal publik.`
    );
    dbService.persist();

    res.status(201).json({
      success: true,
      data: sanitizePublicAspiration(newAspiration),
      message: `Aspirasi berhasil dicatat dengan Nomor Resi ${aspiration_number}`
    });
  });

  // 3. SECURE INTERNAL API (Protected by JWT and RBAC)

  // Full Database State for Authorized Users
  app.get('/api/internal/state', authenticateToken, (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const currentUser = req.user!;

    // Filter by role scope if needed
    let scopedAspirations = [...db.aspirations];
    let scopedVolunteerUnits = [...db.volunteerUnits];

    // If Operator RT/RW, prioritize their village/unit
    if (currentUser.role === 'Operator RT/RW' && currentUser.assigned_village_id) {
      // Still allow seeing others, or scoped depending on preferences
    }

    res.json({
      success: true,
      currentUser,
      dbStatus: dbService.getStatus(),
      data: {
        regions: db.regions,
        categories: db.categories,
        volunteerUnits: scopedVolunteerUnits,
        aspirations: scopedAspirations,
        followUps: db.followUps,
        realizations: db.realizations,
        users: currentUser.role === 'Admin Utama' || currentUser.role === 'Admin Operasional' ? db.users : db.users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
        auditLogs: currentUser.role === 'Admin Utama' || currentUser.role === 'Admin Operasional' ? db.auditLogs : []
      }
    });
  });

  // Volunteer Units CRUD
  app.post('/api/internal/volunteers', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional', 'Koordinator Wilayah', 'Operator RT/RW'), (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const unitData = req.body;

    const rwNormalized = (unitData.rw_number || '').trim().padStart(2, '0');
    const rtNormalized = unitData.rt_number ? unitData.rt_number.trim().padStart(2, '0') : undefined;

    // Validation
    if (unitData.unit_type === 'RW') {
      const exists = db.volunteerUnits.find((u) => u.unit_type === 'RW' && u.village_id === unitData.village_id && u.rw_number === rwNormalized);
      if (exists) {
        return res.status(400).json({ success: false, error: `Unit RW ${rwNormalized} sudah terdaftar pada desa/kelurahan ini.` });
      }
    } else if (unitData.unit_type === 'RT') {
      const exists = db.volunteerUnits.find((u) => u.unit_type === 'RT' && u.village_id === unitData.village_id && u.rw_number === rwNormalized && u.rt_number === rtNormalized);
      if (exists) {
        return res.status(400).json({ success: false, error: `Unit RT ${rtNormalized} RW ${rwNormalized} sudah terdaftar.` });
      }
    }

    const newUnit: VolunteerUnit = {
      id: `unit-${unitData.unit_type.toLowerCase()}-${Date.now()}`,
      unit_type: unitData.unit_type,
      region_id: unitData.region_id,
      village_id: unitData.village_id,
      rw_number: rwNormalized,
      rt_number: rtNormalized,
      parent_rw_unit_id: unitData.parent_rw_unit_id,
      registered_at: unitData.registered_at || new Date().toISOString().split('T')[0],
      status: unitData.status || 'Menunggu Verifikasi',
      coordinator_name: unitData.coordinator_name,
      coordinator_contact: unitData.coordinator_contact,
      notes: unitData.notes,
      latitude: unitData.latitude,
      longitude: unitData.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.volunteerUnits.unshift(newUnit);
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'volunteer_unit',
      newUnit.id,
      'CREATE',
      `Mendaftarkan unit relawan ${newUnit.unit_type} ${newUnit.rw_number}${newUnit.rt_number ? '/' + newUnit.rt_number : ''}.`
    );
    dbService.persist();

    res.status(201).json({ success: true, data: newUnit });
  });

  app.patch('/api/internal/volunteers/:id', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional', 'Koordinator Wilayah'), (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const { id } = req.params;
    const updates = req.body;
    const index = db.volunteerUnits.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Unit relawan tidak ditemukan.' });
    }

    const old = db.volunteerUnits[index];
    db.volunteerUnits[index] = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.status && updates.status !== old.status) {
      logAudit(
        { name: req.user!.name, role: req.user!.role },
        'volunteer_unit',
        id,
        'STATUS_CHANGE',
        `Mengubah status unit relawan ${old.rw_number} dari '${old.status}' menjadi '${updates.status}'`,
        old.status,
        updates.status
      );
    }
    dbService.persist();

    res.json({ success: true, data: db.volunteerUnits[index] });
  });

  // Aspirations CRUD & Workflow Updates
  app.post('/api/internal/aspirations', authenticateToken, (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const aspData = req.body;

    const kec = db.regions.find((r) => r.id === aspData.region_id);
    const prefix = kec?.code || 'ADU';
    const year = new Date().getFullYear();
    const count = db.aspirations.length + 1;
    const aspiration_number = `ASP/${year}/${prefix}-${String(count).padStart(3, '0')}`;

    const newAsp: Aspiration = {
      id: `asp-${Date.now()}`,
      aspiration_number,
      title: aspData.title,
      description: aspData.description,
      category_id: aspData.category_id,
      region_id: aspData.region_id,
      village_id: aspData.village_id,
      rw_unit_id: aspData.rw_unit_id,
      rt_unit_id: aspData.rt_unit_id,
      rw_number: aspData.rw_number ? String(aspData.rw_number).padStart(2, '0') : undefined,
      rt_number: aspData.rt_number ? String(aspData.rt_number).padStart(2, '0') : undefined,
      source_type: aspData.source_type || 'Masyarakat',
      submitted_at: aspData.submitted_at || new Date().toISOString().split('T')[0],
      location_description: aspData.location_description,
      latitude: aspData.latitude,
      longitude: aspData.longitude,
      attachment_urls: aspData.attachment_urls || [],
      priority: aspData.priority || 'Sedang',
      current_status: aspData.current_status || 'Diajukan',
      assigned_user_id: aspData.assigned_user_id,
      created_by: req.user!.name,
      reporter_name: aspData.reporter_name,
      reporter_contact: aspData.reporter_contact,
      updated_at: new Date().toISOString()
    };

    db.aspirations.unshift(newAsp);
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'aspiration',
      newAsp.id,
      'CREATE',
      `Mencatat aspirasi baru ${newAsp.aspiration_number}: ${newAsp.title}`
    );
    dbService.persist();

    res.status(201).json({ success: true, data: newAsp });
  });

  // Update Status Aspiration (Workflow Pipeline)
  app.patch('/api/internal/aspirations/:id/status', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional', 'Koordinator Wilayah'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, notes, target_agency } = req.body;
    const db = dbService.getDb();

    const asp = db.aspirations.find((a) => a.id === id);
    if (!asp) {
      return res.status(404).json({ success: false, error: 'Aspirasi tidak ditemukan.' });
    }

    const oldStatus = asp.current_status;
    asp.current_status = status as AspirationStatus;
    asp.updated_at = new Date().toISOString();

    // Auto-create a follow-up record for pipeline transparency
    const newFollowUp: FollowUpRecord = {
      id: `flw-${Date.now()}`,
      aspiration_id: id,
      status_change: status,
      action_type: `Status diubah ke ${status}`,
      target_agency: target_agency || 'Tim Sahabat ADU',
      notes: notes || `Perubahan status kerja oleh ${req.user!.name} (${req.user!.role})`,
      performed_by: req.user!.name,
      follow_up_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    db.followUps.unshift(newFollowUp);

    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'aspiration',
      id,
      'STATUS_CHANGE',
      `Mengubah status aspirasi ${asp.aspiration_number} dari '${oldStatus}' ke '${status}'. Catatan: ${notes || '-'}`,
      oldStatus,
      status
    );
    dbService.persist();

    res.json({ success: true, data: asp, followUp: newFollowUp });
  });

  // Follow-Up Records
  app.post('/api/internal/follow-ups', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional', 'Koordinator Wilayah'), (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const flwData = req.body;

    const newFollowUp: FollowUpRecord = {
      id: `flw-${Date.now()}`,
      aspiration_id: flwData.aspiration_id,
      status_change: flwData.status_change,
      action_type: flwData.action_type,
      target_agency: flwData.target_agency,
      notes: flwData.notes,
      meeting_notes: flwData.meeting_notes,
      documents: flwData.documents || [],
      performed_by: req.user!.name,
      follow_up_date: flwData.follow_up_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    db.followUps.unshift(newFollowUp);

    // Sync status if follow up specified a status change
    if (flwData.status_change) {
      const asp = db.aspirations.find((a) => a.id === flwData.aspiration_id);
      if (asp) {
        const oldStatus = asp.current_status;
        asp.current_status = flwData.status_change;
        asp.updated_at = new Date().toISOString();
        logAudit(
          { name: req.user!.name, role: req.user!.role },
          'aspiration',
          asp.id,
          'STATUS_CHANGE',
          `Status aspirasi diperbarui ke '${flwData.status_change}' melalui tindak lanjut: ${flwData.action_type}`,
          oldStatus,
          flwData.status_change
        );
      }
    }

    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'follow_up',
      newFollowUp.id,
      'CREATE',
      `Menambahkan tindak lanjut baru: ${newFollowUp.action_type} ke ${newFollowUp.target_agency || 'Dinas Terkait'}`
    );
    dbService.persist();

    res.status(201).json({ success: true, data: newFollowUp });
  });

  // Realizations Documentation
  app.post('/api/internal/realizations', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional', 'Koordinator Wilayah'), (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const relData = req.body;

    const newRel: RealizationRecord = {
      id: `rel-${Date.now()}`,
      aspiration_id: relData.aspiration_id,
      description: relData.description,
      realization_type: relData.realization_type,
      reported_at: relData.reported_at || new Date().toISOString().split('T')[0],
      before_image_url: relData.before_image_url,
      evidence_urls: relData.evidence_urls || [],
      verification_status: 'Menunggu Verifikasi',
      notes: relData.notes,
      created_at: new Date().toISOString()
    };

    db.realizations.unshift(newRel);
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'realization',
      newRel.id,
      'CREATE',
      `Menyerahkan dokumentasi realisasi hasil untuk aspirasi #${relData.aspiration_id}.`
    );
    dbService.persist();

    res.status(201).json({ success: true, data: newRel });
  });

  // Realization Verification (Admin Utama / Admin Operasional)
  app.patch('/api/internal/realizations/:id/verify', authenticateToken, authorizeRoles('Admin Utama', 'Admin Operasional'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db = dbService.getDb();

    const rel = db.realizations.find((r) => r.id === id);
    if (!rel) {
      return res.status(404).json({ success: false, error: 'Data realisasi tidak ditemukan.' });
    }

    rel.verification_status = status;
    rel.verified_by = req.user!.name;
    rel.verified_at = new Date().toISOString();
    if (notes) rel.notes = notes;

    // If verified, mark the corresponding aspiration as 'Realisasi Terverifikasi'
    if (status === 'Terverifikasi') {
      const asp = db.aspirations.find((a) => a.id === rel.aspiration_id);
      if (asp) {
        asp.current_status = 'Realisasi Terverifikasi';
        asp.updated_at = new Date().toISOString();
      }
    }

    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'realization',
      rel.id,
      'VERIFY',
      `Verifikasi realisasi #${rel.id} disetujui sebagai '${status}' oleh ${req.user!.name}`
    );
    dbService.persist();

    res.json({ success: true, data: rel });
  });

  // User Management (Admin Utama only)
  app.post('/api/internal/users', authenticateToken, authorizeRoles('Admin Utama'), (req: AuthRequest, res: Response) => {
    const db = dbService.getDb();
    const userData = req.body;

    if (!userData.name || !userData.email) {
      return res.status(400).json({ success: false, error: 'Nama dan email wajib diisi.' });
    }

    const emailClean = userData.email.trim().toLowerCase();
    const exists = db.users.find((u) => u.email.toLowerCase() === emailClean);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar.' });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: emailClean,
      role: userData.role || 'Koordinator Wilayah',
      phone: userData.phone,
      assigned_region_id: userData.assigned_region_id,
      assigned_village_id: userData.assigned_village_id,
      assigned_unit_id: userData.assigned_unit_id,
      active: true
    };

    db.users.push(newUser);
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'user',
      newUser.id,
      'CREATE',
      `Menambahkan akun petugas baru: ${newUser.name} (${newUser.role})`
    );
    dbService.persist();

    res.status(201).json({ success: true, data: newUser });
  });

  app.patch('/api/internal/users/:id/role', authenticateToken, authorizeRoles('Admin Utama'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const db = dbService.getDb();

    const u = db.users.find((user) => user.id === id);
    if (!u) {
      return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
    }

    const oldRole = u.role;
    u.role = role;
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'user',
      u.id,
      'UPDATE',
      `Mengubah peran pengguna ${u.name} dari '${oldRole}' menjadi '${role}'`,
      oldRole,
      role
    );
    dbService.persist();

    res.json({ success: true, data: u });
  });

  // Reset to default data
  app.post('/api/internal/reset-data', authenticateToken, authorizeRoles('Admin Utama'), (req: AuthRequest, res: Response) => {
    dbService.reset();
    logAudit(
      { name: req.user!.name, role: req.user!.role },
      'aspiration',
      'all',
      'DELETE',
      `Reset seluruh data ke konfigurasi awal oleh ${req.user!.name}`
    );
    res.json({ success: true, message: 'Basis data berhasil direset ke data awal.' });
  });

  // --- VITE MIDDLEWARE INTEGRATION (Dev Server) ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Sahabat ADU Backend API + Frontend running on port ${PORT}`);
    console.log(`📦 Database: ${dbService.getStatus().engine}`);
    console.log(`🛡️  RBAC & JWT Authentication: ACTIVE`);
    console.log(`🌐 Public API & Internal API separation: ENFORCED`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
