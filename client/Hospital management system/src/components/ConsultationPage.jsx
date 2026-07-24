import { useState } from 'react';
import { createAppointment, createRecord } from '../api';

export default function ConsultationPage({ user, patients, doctors, appointments, records, loadData }) {
  const [activeTab, setActiveTab] = useState('book');
  const [form, setForm] = useState({
    patientId: '', doctorId: '', date: '', time: '', notes: '',
    diagnosis: '', treatment: '', prescription: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({
        patientId: form.patientId, doctorId: form.doctorId,
        date: form.date, time: form.time, notes: form.notes,
      });
      setForm((prev) => ({ ...prev, patientId: '', doctorId: '', date: '', time: '', notes: '' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const doctorId = user?.role === 'admin' ? form.doctorId : doctors.find(d => d.userId === user?.id)?.id || form.doctorId;
      await createRecord({
        patientId: form.patientId, doctorId,
        diagnosis: form.diagnosis, treatment: form.treatment, prescription: form.prescription, notes: form.notes,
      });
      setForm((prev) => ({ ...prev, patientId: '', doctorId: '', diagnosis: '', treatment: '', prescription: '', notes: '' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const canManage = user?.role === 'admin' || user?.role === 'doctor';

  return (
    <>
      <div className="page-header">
        <h2>Consultation</h2>
        <p>Book appointments and manage medical records.</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Book Appointment
        </button>
        {canManage && (
          <button className={`tab-btn ${activeTab === 'record' ? 'active' : ''}`} onClick={() => setActiveTab('record')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Medical Record
          </button>
        )}
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          History
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="panel">
          <div className="panel-header">
            <h3>Book an Appointment</h3>
          </div>
          <form onSubmit={handleBookAppointment} className="form-stack">
            {user?.role === 'admin' && (
              <select name="patientId" value={form.patientId} onChange={handleChange} required>
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.name} ({p.id})</option>
                ))}
              </select>
            )}
            <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.user?.name} - {d.specialization || 'General'}</option>
              ))}
            </select>
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="time" type="time" value={form.time} onChange={handleChange} required />
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Reason for visit / Notes" />
            <button type="submit" className="primary-btn">Book Appointment</button>
          </form>
        </div>
      )}

      {activeTab === 'record' && canManage && (
        <div className="panel">
          <div className="panel-header">
            <h3>Create Medical Record</h3>
          </div>
          <form onSubmit={handleCreateRecord} className="form-stack">
            <select name="patientId" value={form.patientId} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.user?.name} ({p.id})</option>
              ))}
            </select>
            {user?.role === 'admin' && (
              <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.user?.name} - {d.specialization || 'General'}</option>
                ))}
              </select>
            )}
            <input name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Diagnosis" required />
            <input name="treatment" value={form.treatment} onChange={handleChange} placeholder="Treatment plan" />
            <input name="prescription" value={form.prescription} onChange={handleChange} placeholder="Prescription" />
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes" rows={3} />
            <button type="submit" className="primary-btn">Save Record</button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Appointments</h3>
              <span className="panel-count">{appointments.length}</span>
            </div>
            <ul className="list">
              {appointments.length === 0 && <li className="empty-state">No appointments recorded</li>}
              {appointments.slice(0, 10).map((app) => (
                <li key={app.id}>
                  <div>
                    <span className="list-item-title">{app.date} at {app.time}</span>
                    <p className="list-item-sub">{app.patient?.name || 'Patient'} → {app.doctor?.name || 'Doctor'}</p>
                    {app.notes && <p className="list-item-sub">{app.notes}</p>}
                  </div>
                  <span className={`status-badge ${app.status?.toLowerCase()}`}>{app.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Medical Records</h3>
              <span className="panel-count">{records.length}</span>
            </div>
            <ul className="list">
              {records.length === 0 && <li className="empty-state">No medical records</li>}
              {records.slice(0, 10).map((rec) => (
                <li key={rec.id}>
                  <div>
                    <span className="list-item-title">{rec.diagnosis}</span>
                    <p className="list-item-sub">{rec.patient?.name || 'Patient'} — Dr. {rec.doctor?.name || 'Doctor'}</p>
                    {rec.treatment && <p className="list-item-sub">Treatment: {rec.treatment}</p>}
                    {rec.prescription && <p className="list-item-sub">Rx: {rec.prescription}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
