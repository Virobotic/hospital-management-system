import { useState } from 'react';
import { createBill } from '../api';

export default function BillingPage({ bills, patients, loadData, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '', service: '', status: 'Pending' });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBill(form);
      setForm({ patientId: '', amount: '', service: '', status: 'Pending' });
      setShowForm(false);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const totalPending = bills.filter((b) => b.status === 'Pending').reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const collectionRate = bills.length > 0 ? Math.round((bills.filter((b) => b.status === 'Paid').length / bills.length) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <h2>Billing</h2>
        <p>Manage patient invoices and track payments.</p>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Total invoices</p>
          <p className="stat-value">{bills.length}</p>
          <span className="stat-trend">All time</span>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pending</p>
          <p className="stat-value">${totalPending}</p>
          <span className="stat-trend">{bills.filter((b) => b.status === 'Pending').length} invoices</span>
        </article>
        <article className="stat-card">
          <p className="stat-label">Collected</p>
          <p className="stat-value">${totalPaid}</p>
          <span className="stat-trend">{bills.filter((b) => b.status === 'Paid').length} paid</span>
        </article>
        <article className="stat-card">
          <p className="stat-label">Collection rate</p>
          <p className="stat-value">{collectionRate}%</p>
          <span className="stat-trend">Of total invoices</span>
        </article>
      </section>

      <div className="section-toolbar">
        <h3>Invoices</h3>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Invoice'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h3>Create Invoice</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-stack form-grid">
            <select name="patientId" value={form.patientId} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.user?.name} ({p.id})</option>
              ))}
            </select>
            <input name="service" value={form.service} onChange={handleChange} placeholder="Service description" required />
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount ($)" required />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1' }}>Create</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 && (
                <tr><td colSpan={6} className="empty-table">No invoices yet</td></tr>
              )}
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td><code>{bill.id}</code></td>
                  <td>{bill.patient?.name || 'Unknown'}</td>
                  <td>{bill.service}</td>
                  <td><strong>${bill.amount}</strong></td>
                  <td><span className={`status-badge ${bill.status?.toLowerCase()}`}>{bill.status}</span></td>
                  <td>{bill.issuedAt ? new Date(bill.issuedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
