import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import mock from "../api/mockBackend";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!email || !password) { setMessage('Please enter email and password'); return; }

    // Quick dev-mode hardcoded accounts (bypass backend)
    const devAccounts = [
      { email: 'patient@medvault.test', password: 'patientpass', role: 'PATIENT', name: 'Demo Patient', id: 'u_demo_patient' },
      { email: 'doctor@medvault.test', password: 'doctorpass', role: 'DOCTOR', name: 'Dr. Demo', id: 'u_demo_doctor' },
      { email: 'admin@medvault.test', password: 'adminpass', role: 'ADMIN', name: 'Site Admin', id: 'u_admin' }
    ];
    const matched = devAccounts.find(a => a.email === email && a.password === password);
    if (matched) {
      // ensure user exists in mock storage so dashboards can read name etc.
      const users = JSON.parse(localStorage.getItem('mv_users_v1') || '[]');
      if (!users.find(u => u.email === matched.email)) {
        users.push({ id: matched.id, name: matched.name, email: matched.email, password: matched.password, role: matched.role, status: 'APPROVED', isApproved: true, firstLoginRequired: false, createdAt: new Date().toISOString() });
        localStorage.setItem('mv_users_v1', JSON.stringify(users));
      }
      localStorage.setItem('mv_current_user', JSON.stringify({ userId: matched.id, role: matched.role, name: matched.name }));
      if (matched.role === 'ADMIN') navigate('/admin');
      else if (matched.role === 'DOCTOR') navigate('/dashboard/doctor');
      else navigate('/dashboard/patient');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/login', { email, password });
      const data = res.data;
      if (!data.success) { setMessage(data.message || 'Login failed'); return; }
      // backend should ideally return role and userId
      const role = data.role || data.user?.role || data.userRole;
      const userId = data.userId || data.user?.id || data.user_id;
      const name = data.name || data.user?.name;
      // persist current user for mock/update-password flow
      localStorage.setItem('mv_current_user', JSON.stringify({ userId, role, name }));
      if (data.firstLoginRequired) navigate('/update-password');
      else {
        if (role === 'ADMIN' || role === 'ADMINISTRATIVE') navigate('/admin');
        else if (role === 'DOCTOR') navigate('/dashboard/doctor');
        else navigate('/dashboard/patient');
      }
    } catch (err) {
      // fallback to mock implementation
      try {
        const r = await mock.login({ email, password });
        if (!r.success) { setMessage(r.message || 'Login failed'); return; }
        // find role from localStorage users
        const users = JSON.parse(localStorage.getItem('mv_users_v1') || '[]');
        const u = users.find(x => x.email === email) || {};
        const role = u.role || 'PATIENT';
        const userId = u.id;
        const name = u.name;
        localStorage.setItem('mv_current_user', JSON.stringify({ userId, role, name }));
        if (r.firstLoginRequired) navigate('/update-password');
        else {
          if (role === 'ADMIN') navigate('/admin');
          else if (role === 'DOCTOR') navigate('/dashboard/doctor');
          else navigate('/dashboard/patient');
        }
      } catch (e) {
        console.error(e);
        setMessage('Login failed. Please check your credentials or try again.');
      }
    }
  }

  return (
    <div className="login-page container">
      <div className="login-card">
        <h1>Login</h1>
        <p className="muted">Sign in with your email and password.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" type="submit">Login</button>
            <Link to="/signup" className="btn outline" style={{ textDecoration: 'none' }}>Create account</Link>
          </div>
        </form>

        {message && <p style={{ marginTop: 12, color: '#b91c1c' }}>{message}</p>}

        <p style={{ marginTop: 12 }}><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default Login;
