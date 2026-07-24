import { useState } from 'react';
import { createRecord } from '../api';

export default function RecordsPage({ records, patients, doctors, loadData, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', diagnosis: '', treatment: '', prescription: '', notes: '',
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const doctorId = form.doctorId || doctors.find((d) => d.userId === user?.id)?.id || '';
      await createRecord({ ...form, doctorId });
      setForm({ patientId: '', doctorId: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
      setShowForm(false);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'doctor';

  return (
    <>
      <div className="page-header">
        <h2>Medical Records</h2>
        <p>Patient health records, diagnoses, and prescriptions.</p>
      </div>

      <div className="section-toolbar">
        <h3>{records.length} Records</h3>
        {canCreate && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Record'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h3>Create Medical Record</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-stack form-grid">
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
            <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1' }}>Save Record</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={6} className="empty-table">No medical records yet</td></tr>
              )}
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '—'}</td>
                  <td><strong>{rec.patient?.name || 'Unknown'}</strong></td>
                  <td>Dr. {rec.doctor?.name || 'Unknown'}</td>
                  <td><span className="tag tag-diagnosis">{rec.diagnosis}</span></td>
                  <td>{rec.treatment || '—'}</td>
                  <td><code>{rec.prescription || '—'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
