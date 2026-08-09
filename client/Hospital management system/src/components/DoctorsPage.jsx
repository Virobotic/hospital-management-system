import { useState } from 'react';
import { createDoctor, removeDoctor } from '../api';
import { NIGERIAN_STATES, getLocalGovernments } from '../data/nigeriaLocations';

export default function DoctorsPage({ doctors, loadData, user }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [localGovernments, setLocalGovernments] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '', phone: '', state: '', localGovernment: '', availability: '',
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setForm((prev) => ({ ...prev, state: value, localGovernment: '' }));
      setLocalGovernments([]);
      try {
        setLocalGovernments(await getLocalGovernments(value));
      } catch {
        alert('Could not load local governments. Please check your connection and try again.');
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDoctor(form);
      setForm({ name: '', email: '', password: '', specialization: '', phone: '', state: '', localGovernment: '', availability: '' });
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
            <select name="state" value={form.state} onChange={handleChange} required>
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            <select name="localGovernment" value={form.localGovernment} onChange={handleChange} disabled={!form.state || localGovernments.length === 0} required>
              <option value="">{form.state ? 'Select local government' : 'Select a state first'}</option>
              {localGovernments.map((localGovernment) => <option key={localGovernment} value={localGovernment}>{localGovernment}</option>)}
            </select>
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
              <button className="secondary-btn doctor-details-btn" onClick={() => setSelectedDoctor(d)}>
                View details
              </button>
              {user?.role === 'admin' && (
                <button className="error-dismiss" style={{ marginTop: '0.75rem' }} onClick={() => handleRemoveDoctor(d.id)}>
                  Remove doctor
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedDoctor && (
        <div className="doctor-modal-backdrop" onClick={() => setSelectedDoctor(null)} role="presentation">
          <section className="doctor-modal" role="dialog" aria-modal="true" aria-labelledby="doctor-details-title" onClick={(event) => event.stopPropagation()}>
            <div className="doctor-modal-header">
              <div>
                <p className="doctor-modal-label">Doctor profile</p>
                <h3 id="doctor-details-title">{selectedDoctor.user?.name || 'Doctor details'}</h3>
              </div>
              <button className="doctor-modal-close" onClick={() => setSelectedDoctor(null)} aria-label="Close doctor details">&times;</button>
            </div>
            <div className="doctor-details-grid">
              <div><span>Name</span><strong>{selectedDoctor.user?.name || '—'}</strong></div>
              <div><span>State</span><strong>{selectedDoctor.state || 'Not provided'}</strong></div>
              <div><span>Local government</span><strong>{selectedDoctor.localGovernment || 'Not provided'}</strong></div>
              <div><span>Specialty</span><strong>{selectedDoctor.specialization || 'General Practitioner'}</strong></div>
              <div><span>Phone</span><strong>{selectedDoctor.phone || 'Not provided'}</strong></div>
              <div><span>Email</span><strong>{selectedDoctor.user?.email || 'Not provided'}</strong></div>
              <div><span>Availability</span><strong>{selectedDoctor.availability || 'Not provided'}</strong></div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
