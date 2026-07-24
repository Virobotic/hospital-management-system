import { useState } from 'react';
import { createPatient } from '../api';

export default function PatientsPage({ patients, loadData, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', address: '', bloodGroup: '', emergencyContact: '',
  });

  const handleChange = (e) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPatient(form);
      setForm({ name: '', email: '', password: '', phone: '', dateOfBirth: '', address: '', bloodGroup: '', emergencyContact: '' });
      setShowForm(false);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Patients</h2>
        <p>All registered patients ({patients.length})</p>
      </div>

      <div className="section-toolbar">
        <h3>{patients.length} Records</h3>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Register Patient'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h3>Register New Patient</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-stack form-grid">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
            <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood group" />
            <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Emergency contact" />
            <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1' }}>Register Patient</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Patient ID</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>DOB</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr><td colSpan={6} className="empty-table">No patients registered yet</td></tr>
              )}
              {patients.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.user?.name}</strong></td>
                  <td>{p.user?.email}</td>
                  <td><code>{p.id}</code></td>
                  <td><span className="tag tag-blood">{p.bloodGroup || '—'}</span></td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.dateOfBirth || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
