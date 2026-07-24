const express = require('express');
const { register, login, me } = require('../controllers/authController');
const {
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
} = require('../controllers/hospitalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

router.get('/dashboard', authenticateToken, getDashboard);
router.get('/patients', authenticateToken, requireRole('admin', 'doctor'), listPatients);
router.post('/patients', authenticateToken, requireRole('admin'), createPatient);
router.get('/doctors', authenticateToken, listDoctors);
router.post('/doctors', authenticateToken, requireRole('admin'), createDoctor);
router.get('/appointments', authenticateToken, listAppointments);
router.post('/appointments', authenticateToken, requireRole('admin', 'doctor', 'patient'), createAppointment);
router.get('/records', authenticateToken, requireRole('admin', 'doctor'), listRecords);
router.post('/records', authenticateToken, requireRole('admin', 'doctor'), createRecord);
router.get('/bills', authenticateToken, requireRole('admin', 'doctor', 'patient'), listBills);
router.post('/bills', authenticateToken, requireRole('admin'), createBill);

module.exports = router;
