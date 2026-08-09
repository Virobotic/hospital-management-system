import { useState } from 'react';
import { loginUser, TOKEN_KEY } from '../api';

export default function AuthPage({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginUser(form.email, form.password);
      localStorage.setItem(TOKEN_KEY, result.token);
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

        <form onSubmit={handleSubmit} className="form-stack">
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
          <button type="submit" className="primary-btn">Sign in</button>
        </form>

        <p className="empty-state" style={{ marginTop: '1rem' }}>Only admins can add or remove doctors.</p>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
