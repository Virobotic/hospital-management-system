const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return request('/auth/me');
}

export async function getDashboard() {
  return request('/dashboard');
}

export async function getPatients() {
  return request('/patients');
}

export async function createPatient(payload) {
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDoctors() {
  return request('/doctors');
}

export async function createDoctor(payload) {
  return request('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAppointments() {
  return request('/appointments');
}

export async function createAppointment(payload) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getRecords() {
  return request('/records');
}

export async function createRecord(payload) {
  return request('/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBills() {
  return request('/bills');
}

export async function createBill(payload) {
  return request('/bills', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
