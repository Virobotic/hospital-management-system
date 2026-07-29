import { useEffect, useState } from 'react';
import './App.css';
import { getMe, getDashboard, getPatients, getDoctors, getAppointments, getRecords, getBills, TOKEN_KEY } from './api';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

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
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      loadData();
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setActivePage('dashboard');
  };

  const clearError = () => setError('');
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigate = (page) => {
    setActivePage(page);
    if (isMobile) {
      closeSidebar();
    }
  };

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
      {isMobile && (
        <>
          <button className="mobile-nav-toggle" onClick={toggleSidebar} aria-label="Toggle navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} />
        </>
      )}
      <Sidebar activePage={activePage} onNavigate={handleNavigate} user={user} onLogout={handleLogout} isOpen={isMobile ? sidebarOpen : true} onClose={closeSidebar} />
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
