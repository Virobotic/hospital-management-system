import { useEffect, useState } from 'react';
import './App.css';
import { getMe, getDashboard, getPatients, getDoctors, getAppointments, getRecords, getBills } from './api';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import ConsultationPage from './components/ConsultationPage';
import AnalyticsPage from './components/AnalyticsPage';
import PatientsPage from './components/PatientsPage';
import DoctorsPage from './components/DoctorsPage';
import BillingPage from './components/BillingPage';
import RecordsPage from './components/RecordsPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const meData = await getMe();
      const currentUser = meData.user;
      setUser(currentUser);

      const dashboardData = await getDashboard();
      setDashboard(dashboardData);

      const role = currentUser.role;
      const [patientsData, doctorsData, appointmentsData, recordsData, billsData] = await Promise.all([
        role !== 'patient' ? getPatients().catch(() => []) : Promise.resolve([]),
        getDoctors().catch(() => []),
        getAppointments().catch(() => []),
        role !== 'patient' ? getRecords().catch(() => []) : Promise.resolve([]),
        role !== 'patient' ? getBills().catch(() => []) : Promise.resolve([]),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
      setRecords(recordsData);
      setBills(billsData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActivePage('dashboard');
  };

  const clearError = () => setError('');

  const pageProps = {
    user,
    dashboard,
    patients,
    doctors,
    appointments,
    records,
    bills,
    error,
    setError,
    clearError,
    loadData,
  };

  if (!user) {
    return <AuthPage onAuth={loadData} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage {...pageProps} />;
      case 'consultation':
        return <ConsultationPage {...pageProps} />;
      case 'analytics':
        return <AnalyticsPage {...pageProps} />;
      case 'patients':
        return <PatientsPage {...pageProps} />;
      case 'doctors':
        return <DoctorsPage {...pageProps} />;
      case 'records':
        return <RecordsPage {...pageProps} />;
      case 'billing':
        return <BillingPage {...pageProps} />;
      default:
        return <DashboardPage {...pageProps} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {renderPage()}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="error-dismiss">&times;</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App
