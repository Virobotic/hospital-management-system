const { readState, writeState } = require('../utils/storage');

function getDashboard(req, res) {
  const state = readState();
  const dashboard = {
    totalPatients: state.patients.length,
    totalDoctors: state.doctors.length,
    totalAppointments: state.appointments.length,
    totalRevenue: state.bills.reduce((sum, bill) => sum + bill.amount, 0),
    pendingBills: state.bills.filter((bill) => bill.status === 'Pending').length,
    upcomingAppointments: state.appointments.filter((appointment) => appointment.status === 'Scheduled').length,
  };
  res.json(dashboard);
}

function listPatients(req, res) {
  const state = readState();
  const patients = state.patients.map((patient) => {
    const user = state.users.find((entry) => entry.id === patient.userId);
    return { ...patient, user: user ? { name: user.name, email: user.email } : null };
  });
  res.json(patients);
}

function createPatient(req, res) {
  const state = readState();
  const { name, email, password, phone, dateOfBirth, address, bloodGroup, emergencyContact } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (state.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: require('bcrypt').hashSync(password, 10),
    role: 'patient',
    createdAt: new Date().toISOString(),
  };
  const patient = {
    id: `patient-${Date.now()}`,
    userId: user.id,
    dateOfBirth: dateOfBirth || '',
    phone: phone || '',
    address: address || '',
    bloodGroup: bloodGroup || '',
    emergencyContact: emergencyContact || '',
    createdAt: user.createdAt,
  };

  state.users.push(user);
  state.patients.push(patient);
  writeState(state);
  res.status(201).json({ patient, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

function listDoctors(req, res) {
  const state = readState();
  const doctors = state.doctors.map((doctor) => {
    const user = state.users.find((entry) => entry.id === doctor.userId);
    return { ...doctor, user: user ? { name: user.name, email: user.email } : null };
  });
  res.json(doctors);
}

function createDoctor(req, res) {
  const state = readState();
  const { name, email, password, specialization, phone, availability } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (state.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: require('bcrypt').hashSync(password, 10),
    role: 'doctor',
    createdAt: new Date().toISOString(),
  };
  const doctor = {
    id: `doctor-${Date.now()}`,
    userId: user.id,
    specialization: specialization || '',
    phone: phone || '',
    availability: availability || '',
    createdAt: user.createdAt,
  };

  state.users.push(user);
  state.doctors.push(doctor);
  writeState(state);
  res.status(201).json({ doctor, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

function listAppointments(req, res) {
  const state = readState();
  const appointments = state.appointments.map((appointment) => {
    const patient = state.patients.find((entry) => entry.id === appointment.patientId);
    const doctor = state.doctors.find((entry) => entry.id === appointment.doctorId);
    const patientUser = patient ? state.users.find((entry) => entry.id === patient.userId) : null;
    const doctorUser = doctor ? state.users.find((entry) => entry.id === doctor.userId) : null;
    return {
      ...appointment,
      patient: patientUser ? { name: patientUser.name, email: patientUser.email } : null,
      doctor: doctorUser ? { name: doctorUser.name, email: doctorUser.email } : null,
    };
  });
  res.json(appointments);
}

function createAppointment(req, res) {
  const state = readState();
  const { patientId, doctorId, date, time, notes } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Patient, doctor, date and time are required' });
  }

  const appointment = {
    id: `appointment-${Date.now()}`,
    patientId,
    doctorId,
    date,
    time,
    status: 'Scheduled',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  state.appointments.push(appointment);
  writeState(state);
  res.status(201).json(appointment);
}

function listRecords(req, res) {
  const state = readState();
  const records = state.records.map((record) => {
    const patient = state.patients.find((entry) => entry.id === record.patientId);
    const doctor = state.doctors.find((entry) => entry.id === record.doctorId);
    const patientUser = patient ? state.users.find((entry) => entry.id === patient.userId) : null;
    const doctorUser = doctor ? state.users.find((entry) => entry.id === doctor.userId) : null;
    return {
      ...record,
      patient: patientUser ? { name: patientUser.name, email: patientUser.email } : null,
      doctor: doctorUser ? { name: doctorUser.name, email: doctorUser.email } : null,
    };
  });
  res.json(records);
}

function createRecord(req, res) {
  const state = readState();
  const { patientId, doctorId, diagnosis, treatment, prescription, notes } = req.body;

  if (!patientId || !doctorId || !diagnosis) {
    return res.status(400).json({ message: 'Patient, doctor and diagnosis are required' });
  }

  const record = {
    id: `record-${Date.now()}`,
    patientId,
    doctorId,
    diagnosis,
    treatment: treatment || '',
    prescription: prescription || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  state.records.push(record);
  writeState(state);
  res.status(201).json(record);
}

function listBills(req, res) {
  const state = readState();
  const bills = state.bills.map((bill) => {
    const patient = state.patients.find((entry) => entry.id === bill.patientId);
    const user = patient ? state.users.find((entry) => entry.id === patient.userId) : null;
    return { ...bill, patient: user ? { name: user.name, email: user.email } : null };
  });
  res.json(bills);
}

function createBill(req, res) {
  const state = readState();
  const { patientId, amount, service, status } = req.body;

  if (!patientId || !amount || !service) {
    return res.status(400).json({ message: 'Patient, amount and service are required' });
  }

  const bill = {
    id: `bill-${Date.now()}`,
    patientId,
    amount: Number(amount),
    service,
    status: status || 'Pending',
    issuedAt: new Date().toISOString(),
  };

  state.bills.push(bill);
  writeState(state);
  res.status(201).json(bill);
}

module.exports = {
  getDashboard,
  listPatients,
  createPatient,
  listDoctors,
  createDoctor,
  listAppointments,
  createAppointment,
  listRecords,
  createRecord,
  listBills,
  createBill,
};
