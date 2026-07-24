const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readState, writeState } = require('../utils/storage');

function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'hospital-management-secret-key', {
    expiresIn: '8h',
  });
}

function register(req, res) {
  const { name, email, password, role = 'patient' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const state = readState();
  if (state.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  if (role === 'patient') {
    state.patients.push({
      id: `patient-${Date.now()}`,
      userId: user.id,
      dateOfBirth: '',
      phone: '',
      address: '',
      bloodGroup: '',
      emergencyContact: '',
      createdAt: user.createdAt,
    });
  }
  if (role === 'doctor') {
    state.doctors.push({
      id: `doctor-${Date.now()}`,
      userId: user.id,
      specialization: '',
      phone: '',
      availability: '',
      createdAt: user.createdAt,
    });
  }

  writeState(state);
  res.status(201).json({ message: 'User registered successfully', token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const state = readState();
  const user = state.users.find((entry) => entry.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful', token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

function me(req, res) {
  const state = readState();
  let profileId = null;
  if (req.user.role === 'patient') {
    const patient = state.patients.find((p) => p.userId === req.user.id);
    profileId = patient ? patient.id : null;
  } else if (req.user.role === 'doctor') {
    const doctor = state.doctors.find((d) => d.userId === req.user.id);
    profileId = doctor ? doctor.id : null;
  }
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, profileId } });
}

module.exports = { register, login, me };
