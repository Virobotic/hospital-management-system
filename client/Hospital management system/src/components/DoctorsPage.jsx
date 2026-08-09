import { useState } from 'react';
import { createDoctor, removeDoctor } from '../api';

export default function DoctorsPage({ doctors, loadData, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '', phone: '', availability: '',
  });

  const handleChange = (e) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDoctor(form);
      setForm({ name: '', email: '', password: '', specialization: '', phone: '', availability: '' });
      setShowForm(false);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleRemoveDoctor = async (doctorId) => {
    if (!window.confirm('Remove this doctor from the system?')) return;
    try {
      await removeDoctor(doctorId);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Doctors</h2>
        <p>All registered physicians ({doctors.length})</p>
      </div>

      <div className="section-toolbar">
        <h3>{doctors.length} Doctors</h3>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Doctor'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h3>Register New Doctor</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-stack form-grid">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="availability" value={form.availability} onChange={handleChange} placeholder="Availability" />
            <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1' }}>Register</button>
          </form>
        </div>
      )}

      <div className="doctor-cards">
        {doctors.length === 0 && (
          <div className="doctor-card">
            <p className="empty-state">No doctors registered yet</p>
          </div>
        )}
        {doctors.map((d) => (
          <article key={d.id} className="doctor-card">
            <div className="doctor-avatar">
              {d.user?.name?.charAt(0) || '?'}
            </div>
            <div className="doctor-info">
              <h4>{d.user?.name}</h4>
              <p className="doctor-specialty">{d.specialization || 'General Practitioner'}</p>
              <p className="doctor-email">{d.user?.email}</p>
              <div className="doctor-meta">
                <span>ID: <code>{d.id}</code></span>
                {d.phone && <span>P: {d.phone}</span>}
              </div>
              {d.availability && (
                <div className="doctor-availability">{d.availability}</div>
              )}
              {user?.role === 'admin' && (
                <button className="error-dismiss" style={{ marginTop: '0.75rem' }} onClick={() => handleRemoveDoctor(d.id)}>
                  Remove doctor
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
