// ==============================================================
// Client‑side store — all data lives in localStorage.
// No server required. Seed accounts are created on first visit.
// ==============================================================

const STORAGE_KEY = 'hms_data';
export const TOKEN_KEY = 'hms_token';

// ─── helpers ──────────────────────────────────────────────────────

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function encodePw(pw) {
  // base64 — not secure, but this is a client‑only demo app
  return btoa(pw);
}

// ─── seed data ────────────────────────────────────────────────────

function seedState() {
  const now = new Date().toISOString();
  const state = {
    users: [
      { id: 'user-admin',    name: 'Administrator',   email: 'admin@citycare.com',   password: encodePw('admin123'),   role: 'admin',  createdAt: now },
      { id: 'user-doctor',   name: 'Dr. Amina Khan',  email: 'dr.khan@citycare.com',  password: encodePw('doctor123'),  role: 'doctor', createdAt: now },
      { id: 'user-patient',  name: 'Sara Ahmed',      email: 'patient@citycare.com',  password: encodePw('patient123'), role: 'patient',createdAt: now },
    ],
    patients: [
      { id: 'patient-1', userId: 'user-patient', dateOfBirth: '1991-04-18', phone: '+966500222222', address: 'Riyadh, Saudi Arabia', bloodGroup: 'O+', emergencyContact: 'Hassan Ahmed', createdAt: now },
    ],
    doctors: [
      { id: 'doctor-1', userId: 'user-doctor', specialization: 'Cardiology', phone: '+966500111111', state: 'Lagos', localGovernment: 'Ikeja', availability: 'Mon-Fri 09:00-17:00', createdAt: now },
    ],
    appointments: [
      { id: 'appointment-1', patientId: 'patient-1', doctorId: 'doctor-1', date: '2026-07-30', time: '10:30', status: 'Scheduled', notes: 'Routine checkup', createdAt: now },
    ],
    records: [
      { id: 'record-1', patientId: 'patient-1', doctorId: 'doctor-1', diagnosis: 'Hypertension', treatment: 'Lifestyle changes and medication review', prescription: 'Amlodipine 5mg', notes: 'Monitor blood pressure weekly', createdAt: now },
    ],
    bills: [
      { id: 'bill-1', patientId: 'patient-1', amount: 320, service: 'Consultation & Lab', status: 'Pending', issuedAt: now },
    ],
  };
  saveState(state);
  return state;
}

function ensureState() {
  let s = getState();
  if (!s || !s.users || s.users.length === 0) {
    s = seedState();
  }
  // Keep the original demo doctor complete for existing browser storage.
  const demoDoctor = s.doctors?.find((doctor) => doctor.id === 'doctor-1');
  if (demoDoctor && (!demoDoctor.state || !demoDoctor.localGovernment)) {
    demoDoctor.state ||= 'Lagos';
    demoDoctor.localGovernment ||= 'Ikeja';
    saveState(s);
  }
  const adminUser = s.users?.find((user) => user.id === 'user-admin');
  if (adminUser?.name === 'System Admin') {
    adminUser.name = 'Administrator';
    saveState(s);
  }
  return s;
}

// ─── token helpers ───────────────────────────────────────────────

function createToken(user) {
  const payload = btoa(JSON.stringify({ userId: user.id, role: user.role }));
  localStorage.setItem(TOKEN_KEY, payload);
  return payload;
}

function decodeToken() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw));
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

function getUserFromToken() {
  const payload = decodeToken();
  if (!payload) return null;
  const state = ensureState();
  const user = state.users.find((u) => u.id === payload.userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ─── populate helpers (mirror server response shape) ─────────────

function populatePatient(patient, state) {
  const u = state.users.find((x) => x.id === patient.userId);
  return { ...patient, user: u ? { name: u.name, email: u.email } : null };
}

function populateDoctor(doctor, state) {
  const u = state.users.find((x) => x.id === doctor.userId);
  return { ...doctor, user: u ? { name: u.name, email: u.email } : null };
}

function populateAppointment(app, state) {
  const pat = state.patients.find((x) => x.id === app.patientId);
  const doc = state.doctors.find((x) => x.id === app.doctorId);
  const pu = pat ? state.users.find((x) => x.id === pat.userId) : null;
  const du = doc ? state.users.find((x) => x.id === doc.userId) : null;
  return {
    ...app,
    patient: pu ? { name: pu.name, email: pu.email } : null,
    doctor: du ? { name: du.name, email: du.email } : null,
  };
}

function populateRecord(rec, state) {
  const pat = state.patients.find((x) => x.id === rec.patientId);
  const doc = state.doctors.find((x) => x.id === rec.doctorId);
  const pu = pat ? state.users.find((x) => x.id === pat.userId) : null;
  const du = doc ? state.users.find((x) => x.id === doc.userId) : null;
  return {
    ...rec,
    patient: pu ? { name: pu.name, email: pu.email } : null,
    doctor: du ? { name: du.name, email: du.email } : null,
  };
}

function populateBill(bill, state) {
  const pat = state.patients.find((x) => x.id === bill.patientId);
  const pu = pat ? state.users.find((x) => x.id === pat.userId) : null;
  return { ...bill, patient: pu ? { name: pu.name, email: pu.email } : null };
}

// ─── public API (async to match original signatures) ─────────────

export async function loginUser(email, password) {
  const state = ensureState();
  const user = state.users.find((u) => u.email === email);
  if (!user || user.password !== encodePw(password)) {
    throw new Error('Invalid credentials');
  }
  const token = createToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function registerUser({ name, email, password, role = 'patient' }) {
  throw new Error('Registration is disabled. Only admins can add doctors.');
}

export async function getMe() {
  const user = getUserFromToken();
  if (!user) throw new Error('Authentication required');
  // also return profileId like the server does
  const state = ensureState();
  let profileId = null;
  if (user.role === 'patient') {
    const p = state.patients.find((x) => x.userId === user.id);
    if (p) profileId = p.id;
  } else if (user.role === 'doctor') {
    const d = state.doctors.find((x) => x.userId === user.id);
    if (d) profileId = d.id;
  }
  return { user: { ...user, profileId } };
}

export async function getDashboard() {
  const state = ensureState();
  return {
    totalPatients: state.patients.length,
    totalDoctors: state.doctors.length,
    totalAppointments: state.appointments.length,
    totalRevenue: state.bills.reduce((s, b) => s + b.amount, 0),
    pendingBills: state.bills.filter((b) => b.status === 'Pending').length,
    upcomingAppointments: state.appointments.filter((a) => a.status === 'Scheduled').length,
  };
}

export async function getPatients() {
  const state = ensureState();
  return state.patients.map((p) => populatePatient(p, state));
}

export async function createPatient(data) {
  const state = ensureState();
  const { name, email, password, phone, dateOfBirth, address, bloodGroup, emergencyContact } = data;
  if (!name || !email || !password) throw new Error('Name, email and password are required');
  if (state.users.some((u) => u.email === email)) throw new Error('Email already exists');

  const now = new Date().toISOString();
  const user = { id: uid('user'), name, email, password: encodePw(password), role: 'patient', createdAt: now };
  const patient = { id: uid('patient'), userId: user.id, dateOfBirth: dateOfBirth || '', phone: phone || '', address: address || '', bloodGroup: bloodGroup || '', emergencyContact: emergencyContact || '', createdAt: now };

  state.users.push(user);
  state.patients.push(patient);
  saveState(state);
  return { patient, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function getDoctors() {
  const state = ensureState();
  return state.doctors.map((d) => populateDoctor(d, state));
}

export async function createDoctor(data) {
  const currentUser = getUserFromToken();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can add doctors');
  }

  const state = ensureState();
  const { name, email, password, specialization, phone, state: doctorState, localGovernment, availability } = data;
  if (!name || !email || !password) throw new Error('Name, email and password are required');
  if (state.users.some((u) => u.email === email)) throw new Error('Email already exists');

  const now = new Date().toISOString();
  const user = { id: uid('user'), name, email, password: encodePw(password), role: 'doctor', createdAt: now };
  const doctor = { id: uid('doctor'), userId: user.id, specialization: specialization || '', phone: phone || '', state: doctorState || '', localGovernment: localGovernment || '', availability: availability || '', createdAt: now };

  state.users.push(user);
  state.doctors.push(doctor);
  saveState(state);
  return { doctor, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function removeDoctor(doctorId) {
  const currentUser = getUserFromToken();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can remove doctors');
  }

  const state = ensureState();
  const doctorIndex = state.doctors.findIndex((doctor) => doctor.id === doctorId);
  if (doctorIndex === -1) throw new Error('Doctor not found');

  const doctor = state.doctors[doctorIndex];
  state.doctors.splice(doctorIndex, 1);
  state.users = state.users.filter((user) => user.id !== doctor.userId);
  state.appointments = state.appointments.filter((appointment) => appointment.doctorId !== doctorId);
  state.records = state.records.filter((record) => record.doctorId !== doctorId);
  saveState(state);
  return doctor;
}

export async function getAppointments() {
  const state = ensureState();
  return state.appointments.map((a) => populateAppointment(a, state));
}

export async function createAppointment(data) {
  const state = ensureState();
  const { patientId, doctorId, date, time, notes } = data;
  if (!patientId || !doctorId || !date || !time) throw new Error('Patient, doctor, date and time are required');

  const now = new Date().toISOString();
  const app = { id: uid('appointment'), patientId, doctorId, date, time, status: 'Scheduled', notes: notes || '', createdAt: now };
  state.appointments.push(app);
  saveState(state);
  return app;
}

export async function getRecords() {
  const state = ensureState();
  return state.records.map((r) => populateRecord(r, state));
}

export async function createRecord(data) {
  const state = ensureState();
  const { patientId, doctorId, diagnosis, treatment, prescription, notes } = data;
  if (!patientId || !doctorId || !diagnosis) throw new Error('Patient, doctor and diagnosis are required');

  const now = new Date().toISOString();
  const rec = { id: uid('record'), patientId, doctorId, diagnosis, treatment: treatment || '', prescription: prescription || '', notes: notes || '', createdAt: now };
  state.records.push(rec);
  saveState(state);
  return rec;
}

export async function getBills() {
  const state = ensureState();
  return state.bills.map((b) => populateBill(b, state));
}

export async function createBill(data) {
  const state = ensureState();
  const { patientId, amount, service, status } = data;
  if (!patientId || !amount || !service) throw new Error('Patient, amount and service are required');

  const now = new Date().toISOString();
  const bill = { id: uid('bill'), patientId, amount: Number(amount), service, status: status || 'Pending', issuedAt: now };
  state.bills.push(bill);
  saveState(state);
  return bill;
}
