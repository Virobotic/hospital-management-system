import { useMemo } from 'react';

export default function AnalyticsPage({ dashboard, appointments, bills, records }) {
  const stats = useMemo(() => [
    { label: 'Total patients', value: dashboard?.totalPatients ?? 0 },
    { label: 'Doctors', value: dashboard?.totalDoctors ?? 0 },
    { label: 'Appointments', value: dashboard?.totalAppointments ?? 0 },
    { label: 'Medical records', value: records.length },
    { label: 'Total revenue', value: `$${dashboard?.totalRevenue ?? 0}` },
    { label: 'Pending bills', value: dashboard?.pendingBills ?? 0 },
  ], [dashboard, records.length]);

  const paidBills = bills.filter((b) => b.status === 'Paid').length;
  const pendingBills = bills.filter((b) => b.status === 'Pending').length;

  const weeklyAppointments = useMemo(() => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return weekDays.map((day, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = appointments.filter((a) => a.date === dateStr).length;
      return { day, count };
    });
  }, [appointments]);

  const maxAppCount = Math.max(...weeklyAppointments.map((w) => w.count), 1);

  return (
    <>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Hospital performance metrics at a glance.</p>
      </div>

      <section className="analytics-grid">
        {stats.map((stat) => (
          <article className="analytics-card" key={stat.label}>
            <div className="analytics-card-header">
              <h3>{stat.value}</h3>
            </div>
            <p>{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Appointments this week</h3>
          </div>
          <div className="bar-chart">
            {weeklyAppointments.map((w) => (
              <div key={w.day} className="bar-item">
                <div
                  className="bar-fill"
                  style={{ height: `${Math.max((w.count / maxAppCount) * 100, 4)}%` }}
                >
                  {w.count > 0 && <span className="bar-value">{w.count}</span>}
                </div>
                <span className="bar-label">{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Billing status</h3>
          </div>
          <div className="donut-chart">
            <div className="donut-segment" style={{ '--pct': bills.length > 0 ? (paidBills / bills.length) * 100 : 0 }}>
              <div className="donut-hole">
                <strong>{bills.length}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><span className="legend-dot paid"></span> Paid ({paidBills})</div>
              <div className="legend-item"><span className="legend-dot pending"></span> Pending ({pendingBills})</div>
            </div>
          </div>
        </div>
      </section>

      <div className="panel">
        <div className="panel-header">
          <h3>Revenue breakdown</h3>
        </div>
        <div className="revenue-list">
          {bills.length === 0 && <p className="empty-state" style={{ padding: '1rem 0' }}>No billing data yet</p>}
          {bills.slice(0, 8).map((bill) => (
            <div key={bill.id} className="revenue-item">
              <div>
                <span className="revenue-title">{bill.service}</span>
                <p className="revenue-sub">{bill.patient?.name || 'Unknown'}</p>
              </div>
              <div className="revenue-right">
                <span className={`status-badge ${bill.status?.toLowerCase()}`}>{bill.status}</span>
                <span className="revenue-amount">${bill.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
