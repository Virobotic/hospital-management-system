import { useEffect, useMemo, useRef, useState } from 'react';

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function TrendChart({ data, valueLabel, color = 'var(--color-accent)' }) {
  const width = 640;
  const height = 210;
  const padding = { top: 18, right: 20, bottom: 34, left: 30 };
  const max = Math.max(...data.map((item) => item.value), 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => ({
    ...item,
    x: padding.left + (data.length <= 1 ? plotWidth / 2 : index * plotWidth / (data.length - 1)),
    y: padding.top + plotHeight - (item.value / max) * plotHeight,
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="live-chart-wrap">
      <svg className="live-trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${valueLabel} trend chart`}>
        {[0, 1, 2, 3].map((line) => {
          const y = padding.top + line * plotHeight / 3;
          return <g key={line}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="live-chart-gridline" /><text x="0" y={y + 4} className="live-chart-scale">{Math.round(max * (3 - line) / 3)}</text></g>;
        })}
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => <g key={point.label}><circle cx={point.x} cy={point.y} r="5" fill={color} /><text x={point.x} y={height - 8} textAnchor="middle" className="live-chart-label">{point.label}</text><title>{point.label}: {point.value}</title></g>)}
      </svg>
    </div>
  );
}

export default function AnalyticsPage({ dashboard, appointments, bills, records, loadData }) {
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const loadDataRef = useRef(loadData);

  useEffect(() => { loadDataRef.current = loadData; }, [loadData]);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (refreshing || !loadDataRef.current) return;
      refreshing = true;
      try {
        await loadDataRef.current();
        if (active) setLastUpdated(new Date());
      } finally { refreshing = false; }
    };
    const interval = window.setInterval(refresh, 5000);
    window.addEventListener('storage', refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const stats = useMemo(() => [
    { label: 'Total patients', value: dashboard?.totalPatients ?? 0 },
    { label: 'Doctors', value: dashboard?.totalDoctors ?? 0 },
    { label: 'Appointments', value: dashboard?.totalAppointments ?? 0 },
    { label: 'Medical records', value: records.length },
    { label: 'Total revenue', value: `$${dashboard?.totalRevenue ?? 0}` },
    { label: 'Pending bills', value: dashboard?.pendingBills ?? 0 },
  ], [dashboard, records.length]);

  const billStatus = useMemo(() => bills.reduce((summary, bill) => {
    const status = (bill.status || 'Other').toLowerCase();
    if (status === 'paid') summary.paid += 1;
    else if (status === 'pending') summary.pending += 1;
    else summary.other += 1;
    return summary;
  }, { paid: 0, pending: 0, other: 0 }), [bills]);

  const weeklyAppointments = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      const key = dateKey(day);
      return { label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day), value: appointments.filter((appointment) => appointment.date === key).length };
    });
  }, [appointments]);

  const revenueByService = useMemo(() => {
    const totals = new Map();
    bills.forEach((bill) => {
      const service = bill.service || 'Other services';
      totals.set(service, (totals.get(service) || 0) + (Number(bill.amount) || 0));
    });
    return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [bills]);
  const allBills = bills.length;

  return (
    <>
      <div className="page-header analytics-page-heading">
        <div><h2>Analytics</h2><p>Live overview from your current patient, appointment and billing records.</p></div>
        <span className="analytics-live-status"><i /> Live · updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      <section className="analytics-grid">
        {stats.map((stat) => <article className="analytics-card" key={stat.label}><div className="analytics-card-header"><h3>{stat.value}</h3></div><p>{stat.label}</p></article>)}
      </section>

      <section className="live-analytics-grid">
        <div className="panel live-analytics-panel">
          <div className="panel-header"><div><h3>Appointments this week</h3><p>Bookings by appointment date</p></div><span className="panel-count">{weeklyAppointments.reduce((sum, day) => sum + day.value, 0)} total</span></div>
          <TrendChart data={weeklyAppointments} valueLabel="Appointments" />
        </div>
        <div className="panel live-analytics-panel">
          <div className="panel-header"><div><h3>Billing status</h3><p>Current bills in the system</p></div><span className="panel-count">{allBills} total</span></div>
          <div className="donut-chart">
            <div className="donut-segment" style={{ '--pct': allBills > 0 ? (billStatus.paid / allBills) * 100 : 0 }}><div className="donut-hole"><strong>{allBills}</strong><span>Total bills</span></div></div>
            <div className="donut-legend"><div className="legend-item"><span className="legend-dot paid" /> Paid ({billStatus.paid})</div><div className="legend-item"><span className="legend-dot pending" /> Pending ({billStatus.pending})</div>{billStatus.other > 0 && <div className="legend-item"><span className="legend-dot" /> Other ({billStatus.other})</div>}</div>
          </div>
        </div>
        <div className="panel live-analytics-panel live-revenue-panel">
          <div className="panel-header"><div><h3>Revenue by service</h3><p>Billed amounts grouped from current records</p></div></div>
          {revenueByService.length ? <div className="live-revenue-chart">{revenueByService.map((service) => {
            const maxRevenue = Math.max(...revenueByService.map((entry) => entry.value), 1);
            return <div className="live-revenue-row" key={service.label}><div className="live-revenue-label"><span>{service.label}</span><strong>${service.value.toLocaleString()}</strong></div><div className="live-revenue-track"><span style={{ width: `${Math.max(service.value / maxRevenue * 100, 2)}%` }} /></div></div>;
          })}</div> : <p className="empty-state">No billing data to chart yet.</p>}
        </div>
      </section>

      <div className="panel">
        <div className="panel-header"><h3>Recent bills</h3><span className="panel-count">{bills.length}</span></div>
        <div className="revenue-list">
          {bills.length === 0 && <p className="empty-state" style={{ padding: '1rem 0' }}>No billing data yet</p>}
          {bills.slice(0, 8).map((bill) => <div key={bill.id} className="revenue-item"><div><span className="revenue-title">{bill.service}</span><p className="revenue-sub">{bill.patient?.name || 'Unknown'}</p></div><div className="revenue-right"><span className={`status-badge ${bill.status?.toLowerCase()}`}>{bill.status}</span><span className="revenue-amount">${bill.amount}</span></div></div>)}
        </div>
      </div>
    </>
  );
}
