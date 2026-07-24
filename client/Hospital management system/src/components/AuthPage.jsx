import { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function AuthPage({ onAuth }) {
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = authMode === 'login'
        ? await loginUser(form.email, form.password)
        : await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      localStorage.setItem('token', result.token);
      await onAuth();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card-header">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <h1>CityCare</h1>
          <p>Hospital Management System</p>
        </div>

        <div className="auth-toggle">
          <button type="button" className={authMode === 'login' ? 'toggle-active' : 'toggle-inactive'} onClick={() => setAuthMode('login')}>
            Login
          </button>
          <button type="button" className={authMode === 'register' ? 'toggle-active' : 'toggle-inactive'} onClick={() => setAuthMode('register')}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {authMode === 'register' && (
            <>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
            </>
          )}
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
          <button type="submit" className="primary-btn">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
