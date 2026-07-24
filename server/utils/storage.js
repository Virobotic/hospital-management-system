const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, '..', 'data', 'storage.json');

function ensureSeedData(state) {
  if (state.users.length > 0) {
    return state;
  }

  const now = new Date().toISOString();
  const adminUser = {
    id: 'user-admin',
    name: 'System Admin',
    email: 'admin@citycare.com',
    passwordHash: '$2b$10$3jiNDcTmoH2FgdqLaagkYeO6d5jBfPpN2l3lJ6xnU.z6qlo2y3rGa',
    role: 'admin',
    createdAt: now,
  };

  const doctorUser = {
    id: 'user-doctor',
    name: 'Dr. Amina Khan',
    email: 'dr.khan@citycare.com',
    passwordHash: '$2b$10$N97YzyR13YQ2QxmO9ch8WuyxFZb8VGBqA0sYTw7KAGNFEzD7yGQ7.',
    role: 'doctor',
    createdAt: now,
  };

  const patientUser = {
    id: 'user-patient',
    name: 'Sara Ahmed',
    email: 'patient@citycare.com',
    passwordHash: '$2b$10$KsJNJq7RjG7b2A0sRmfn8O7DmFqgkS9F7f1f7z6q7rWhKmg8pU9Gy',
    role: 'patient',
    createdAt: now,
  };

  const doctor = {
    id: 'doctor-1',
    userId: doctorUser.id,
    specialization: 'Cardiology',
    phone: '+966500111111',
    availability: 'Mon-Fri 09:00-17:00',
    createdAt: now,
  };

  const patient = {
    id: 'patient-1',
    userId: patientUser.id,
    dateOfBirth: '1991-04-18',
    phone: '+966500222222',
    address: 'Riyadh, Saudi Arabia',
    bloodGroup: 'O+',
    emergencyContact: 'Hassan Ahmed',
    createdAt: now,
  };

  const appointment = {
    id: 'appointment-1',
    patientId: patient.id,
    doctorId: doctor.id,
    date: '2026-07-30',
    time: '10:30',
    status: 'Scheduled',
    notes: 'Routine checkup',
    createdAt: now,
  };

  const record = {
    id: 'record-1',
    patientId: patient.id,
    doctorId: doctor.id,
    diagnosis: 'Hypertension',
    treatment: 'Lifestyle changes and medication review',
    prescription: 'Amlodipine 5mg',
    notes: 'Monitor blood pressure weekly',
    createdAt: now,
  };

  const bill = {
    id: 'bill-1',
    patientId: patient.id,
    amount: 320,
    service: 'Consultation & Lab',
    status: 'Pending',
    issuedAt: now,
  };

  return {
    users: [adminUser, doctorUser, patientUser],
    patients: [patient],
    doctors: [doctor],
    appointments: [appointment],
    records: [record],
    bills: [bill],
  };
}

function readState() {
  try {
    const file = fs.readFileSync(storagePath, 'utf8');
    const parsed = JSON.parse(file);
    return ensureSeedData(parsed);
  } catch (error) {
    const seeded = ensureSeedData({ users: [], patients: [], doctors: [], appointments: [], records: [], bills: [] });
    writeState(seeded);
    return seeded;
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  fs.writeFileSync(storagePath, JSON.stringify(state, null, 2));
}

module.exports = { readState, writeState };
