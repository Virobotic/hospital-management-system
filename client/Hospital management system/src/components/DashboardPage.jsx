import { useMemo, useState } from 'react';
import { createAppointment, createBill, createPatient, createDoctor } from '../api';

function StatCard({ label, value, trend, icon }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <span className="stat-trend">{trend}</span>
    </article>
  );
}

export default function DashboardPage({ user, dashboard, patients, doctors, appointments, bills, loadData }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'patient',
    phone: '', dateOfBirth: '', address: '', bloodGroup: '', emergencyContact: '',
    specialization: '', availability: '',
    patientId: '', doctorId: '', date: '', time: '', notes: '',
    amount: '', service: '', status: 'Pending',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await createPatient({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, dateOfBirth: form.dateOfBirth, address: form.address,
        bloodGroup: form.bloodGroup, emergencyContact: form.emergencyContact,
      });
      setForm((prev) => ({ ...prev, name: '', email: '', password: '', phone: '', dateOfBirth: '', address: '', bloodGroup: '', emergencyContact: '' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await createDoctor({
        name: form.name, email: form.email, password: form.password,
        specialization: form.specialization, phone: form.phone, availability: form.availability,
      });
      setForm((prev) => ({ ...prev, name: '', email: '', password: '', phone: '', specialization: '', availability: '' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    const patientId = user?.role === 'patient' ? (user.profileId || '') : form.patientId;
    try {
      await createAppointment({
        patientId, doctorId: form.doctorId,
        date: form.date, time: form.time, notes: form.notes,
      });
      setForm((prev) => ({ ...prev, patientId: '', doctorId: '', date: '', time: '', notes: '' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await createBill({
        patientId: form.patientId, amount: form.amount, service: form.service, status: form.status,
      });
      setForm((prev) => ({ ...prev, patientId: '', amount: '', service: '', status: 'Pending' }));
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const stats = useMemo(() => [
    { label: 'Total patients', value: dashboard?.totalPatients ?? 0, trend: 'Registered' },
    { label: 'Doctors', value: dashboard?.totalDoctors ?? 0, trend: 'Active' },
    { label: 'Appointments', value: dashboard?.totalAppointments ?? 0, trend: `${dashboard?.upcomingAppointments ?? 0} upcoming` },
    { label: 'Revenue', value: `$${dashboard?.totalRevenue ?? 0}`, trend: `${dashboard?.pendingBills ?? 0} pending` },
  ], [dashboard]);

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <div style={{ marginTop: '6px' }}>
          <strong style={{ display: 'block', fontSize: '1.05rem' }}>{user?.name}</strong>
        </div>
        <p className="page-header-user">{user?.role === 'admin' ? 'Administrator' : user?.role === 'doctor' ? 'Doctor' : 'Patient'} account</p>
      </div>

      <section className="stats-grid">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </section>

      {isAdmin && (
        <>
          <section className="content-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Patient registration</h3>
              </div>
              <form onSubmit={handleCreatePatient} className="form-stack">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Patient name" required />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
                <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood group" />
                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Emergency contact" />
                <button type="submit" className="primary-btn">Add patient</button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Doctor management</h3>
              </div>
              <form onSubmit={handleCreateDoctor} className="form-stack">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Doctor name" required />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
                <input name="availability" value={form.availability} onChange={handleChange} placeholder="Availability (e.g. Mon-Fri 9-5)" />
                <button type="submit" className="primary-btn">Add doctor</button>
              </form>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Appointment scheduling</h3>
                <span className="panel-count">{appointments.length}</span>
              </div>
              <form onSubmit={handleCreateAppointment} className="form-stack">
                <select name="patientId" value={form.patientId} onChange={handleChange} required>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.user?.name} ({p.id})</option>
                  ))}
                </select>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.user?.name} - {d.specialization || 'General'}</option>
                  ))}
                </select>
                <input name="date" type="date" value={form.date} onChange={handleChange} required />
                <input name="time" type="time" value={form.time} onChange={handleChange} required />
                <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
                <button type="submit" className="primary-btn">Schedule</button>
              </form>
              <ul className="list">
                {appointments.slice(0, 5).map((app) => (
                  <li key={app.id}>
                    <div>
                      <span className="list-item-title">{app.date} at {app.time}</span>
                      <p className="list-item-sub">{app.patient?.name} → {app.doctor?.name}</p>
                    </div>
                    <span className={`status-badge ${app.status?.toLowerCase()}`}>{app.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Billing overview</h3>
                <span className="panel-count">{bills.length}</span>
              </div>
              <form onSubmit={handleCreateBill} className="form-stack">
                <select name="patientId" value={form.patientId} onChange={handleChange} required>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.user?.name} ({p.id})</option>
                  ))}
                </select>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount" required />
                <input name="service" value={form.service} onChange={handleChange} placeholder="Service" required />
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
                <button type="submit" className="primary-btn">Create bill</button>
              </form>
              <ul className="list">
                {bills.length === 0 && <li className="empty-state">No bills yet</li>}
                {bills.slice(0, 5).map((bill) => (
                  <li key={bill.id}>
                    <div>
                      <span className="list-item-title">{bill.service}</span>
                      <p className="list-item-sub">${bill.amount} — {bill.patient?.name || 'Unknown'}</p>
                    </div>
                    <span className={`status-badge ${bill.status?.toLowerCase()}`}>{bill.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {isDoctor && (
        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Patient care queue</h3>
              <span className="panel-count">{appointments.length}</span>
            </div>
            <ul className="list">
              {appointments.length === 0 && <li className="empty-state">No appointments yet</li>}
              {appointments.slice(0, 8).map((app) => (
                <li key={app.id}>
                  <div>
                    <span className="list-item-title">{app.date} at {app.time}</span>
                    <p className="list-item-sub">{app.patient?.name || 'Unknown'} — {app.notes || 'No notes'}</p>
                  </div>
                  <span className={`status-badge ${app.status?.toLowerCase()}`}>{app.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Patient directory</h3>
              <span className="panel-count">{patients.length}</span>
            </div>
            <ul className="list">
              {patients.length === 0 && <li className="empty-state">No patients registered</li>}
              {patients.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <div>
                    <span className="list-item-title">{p.user?.name}</span>
                    <p className="list-item-sub">{p.user?.email}</p>
                  </div>
                  <span className="tag">{p.bloodGroup || 'N/A'}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {isPatient && (
        <>
          <section className="content-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Book an appointment</h3>
              </div>
              <form onSubmit={handleCreateAppointment} className="form-stack">
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.user?.name} - {d.specialization || 'General'}</option>
                  ))}
                </select>
                <input name="date" type="date" value={form.date} onChange={handleChange} required />
                <input name="time" type="time" value={form.time} onChange={handleChange} required />
                <input name="notes" value={form.notes} onChange={handleChange} placeholder="Reason for visit" />
                <button type="submit" className="primary-btn">Request</button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Your appointments</h3>
                <span className="panel-count">{appointments.length}</span>
              </div>
              <ul className="list">
                {appointments.length === 0 && <li className="empty-state">No appointments yet</li>}
                {appointments.slice(0, 5).map((app) => (
                  <li key={app.id}>
                    <div>
                      <span className="list-item-title">{app.date} at {app.time}</span>
                      <p className="list-item-sub">{app.doctor?.name || 'Doctor'} — {app.notes || 'No notes'}</p>
                    </div>
                    <span className={`status-badge ${app.status?.toLowerCase()}`}>{app.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="panel">
            <div className="panel-header">
              <h3>Billing & invoices</h3>
              <span className="panel-count">{bills.length}</span>
            </div>
            <ul className="list">
              {bills.length === 0 && <li className="empty-state">No bills</li>}
              {bills.slice(0, 5).map((bill) => (
                <li key={bill.id}>
                  <div>
                    <span className="list-item-title">{bill.service}</span>
                    <p className="list-item-sub">${bill.amount}</p>
                  </div>
                  <span className={`status-badge ${bill.status?.toLowerCase()}`}>{bill.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
