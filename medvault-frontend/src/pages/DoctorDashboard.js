import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function DoctorDashboard() {
  const [today, setToday] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // pull mock appointments (if any) for demo
    const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    setAppointments(appts.slice(0, 12));
    setToday(appts.filter(a => a.whenISO && a.whenISO.startsWith(todayStr)).slice(0, 8));
  }, []);

  const stats = {
    patients: 150,
    appointments: 2543,
    consultations: 13078
  };

  return (
    <div className="dashboard-layout">
      <aside className="left-nav card">
        <h2 className="nav-brand">Doctor App</h2>
        <nav className="nav-list">
          <a className="active">Dashboard</a>
          <a>Appointments</a>
          <a>Patients</a>
          <a>Messages</a>
          <a>Documents</a>
          <a>Settings</a>
          <a className="muted" onClick={() => {
            localStorage.removeItem('mv_current_user');
            window.location.href = '/';
          }}>Logout</a>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-bar card">
          <div className="search">
            <input placeholder="Search patients or appointments..." />
          </div>
          <div className="top-actions">
            <button className="btn primary">Make Appointment</button>
          </div>
        </header>

        <section className="hero card">
          <div className="hero-left">
            <h3>Hello  Doctor</h3>
            <p className="muted">Here's what's happening with your practice today.</p>
          </div>
          <div className="hero-right">
            <div className="stat-pill">150 People</div>
          </div>
        </section>

        <section className="dash-grid">
          <div>
            <div className="card activity-card">
              <h3>Activity</h3>
              <div className="chart-container" style={{ height: '160px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 600 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Grid lines */}
                  <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Bars */}
                  {/* Mon */}
                  <rect x="20" y="60" width="40" height="100" fill="var(--brand)" rx="4" opacity="0.8" />
                  <text x="40" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Mon</text>

                  {/* Tue */}
                  <rect x="100" y="40" width="40" height="120" fill="var(--brand)" rx="4" opacity="0.6" />
                  <text x="120" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Tue</text>

                  {/* Wed */}
                  <rect x="180" y="90" width="40" height="70" fill="var(--brand)" rx="4" opacity="0.9" />
                  <text x="200" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Wed</text>

                  {/* Thu */}
                  <rect x="260" y="30" width="40" height="130" fill="var(--brand)" rx="4" opacity="0.7" />
                  <text x="280" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Thu</text>

                  {/* Fri */}
                  <rect x="340" y="50" width="40" height="110" fill="var(--brand)" rx="4" opacity="0.5" />
                  <text x="360" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Fri</text>

                  {/* Sat */}
                  <rect x="420" y="100" width="40" height="60" fill="var(--brand)" rx="4" opacity="0.8" />
                  <text x="440" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Sat</text>

                  {/* Sun */}
                  <rect x="500" y="120" width="40" height="40" fill="var(--brand)" rx="4" opacity="0.4" />
                  <text x="520" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Sun</text>
                </svg>
              </div>
            </div>

            <div className="card small-cards">
              <h4>Appointment Requests</h4>
              <ul>
                {appointments.slice(0, 4).map(a => (
                  <li key={a.id} className="appt-row">
                    <div>
                      <strong>{a.patientName || 'Unknown'}</strong>
                      <div className="muted small">{a.when || a.whenISO || '—'}</div>
                    </div>
                    <div className="muted small">{a.status || 'Pending'}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card recent-patients">
              <h4>Recent Patients</h4>
              <div className="muted small">No recent patients to show.</div>
            </div>
          </div>

          <aside className="right-col">
            <div className="card profile-card">
              <div className="profile-top">
                <div className="avatar">JS</div>
                <div>
                  <h4>Dr. Jackson Santos</h4>
                  <div className="muted small">Dermatologist — Texas Hospital</div>
                </div>
              </div>
              <div className="profile-stats">
                <div><strong>{stats.patients}</strong><div className="muted small">People</div></div>
                <div><strong>{stats.appointments}</strong><div className="muted small">Appointments</div></div>
                <div><strong>{stats.consultations}</strong><div className="muted small">Consultations</div></div>
              </div>
            </div>

            <div className="card income-card">
              <h4>Incomes</h4>
              <div className="muted">$2,857.15</div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default DoctorDashboard;
