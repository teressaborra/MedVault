import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // For the mock flow we read user id from localStorage 'mv_current_user' if set
    const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
    if (cur) {
      const users = JSON.parse(localStorage.getItem('mv_users_v1') || '[]');
      const u = users.find(x => x.id === cur.userId);
      setUser(u || cur);
    }
    const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
    setAppointments(appts.filter(a => a.userId === (cur ? cur.userId : null)).slice(0, 6));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mv_current_user');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <aside className="left-nav card">
        <h2 className="nav-brand">MedVault</h2>
        <nav className="nav-list">
          <a className="active">Dashboard</a>
          <a href="/appointments">Appointments</a>
          <a>Prescriptions</a>
          <a>Records</a>
          <a>Messages</a>
          <a>Settings</a>
          <a className="muted" onClick={handleLogout}>Logout</a>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-bar card">
          <div className="search">
            <input placeholder="Search records, doctors..." />
          </div>
          <div className="top-actions">
            <button className="btn primary">Book Appointment</button>
          </div>
        </header>

        <section className="hero card">
          <div className="hero-left">
            <h3>Hello, {user ? user.name : 'Patient'}</h3>
            <p className="muted">Here is your health summary.</p>
          </div>
          <div className="hero-right">
            <div className="stat-pill">Patient Account</div>
          </div>
        </section>

        <section className="dash-grid">
          <div>
            <div className="card activity-card">
              <h3>Health Activity</h3>
              <div className="chart-container" style={{ height: '160px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 600 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Grid lines */}
                  <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Area under curve */}
                  <path d="M0,100 Q100,60 200,90 T400,70 T600,100 V160 H0 Z" fill="url(#lineGradient)" />

                  {/* Line */}
                  <path d="M0,100 Q100,60 200,90 T400,70 T600,100" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />

                  {/* Points */}
                  <circle cx="0" cy="100" r="4" fill="#fff" />
                  <circle cx="200" cy="90" r="4" fill="#fff" />
                  <circle cx="400" cy="70" r="4" fill="#fff" />
                  <circle cx="600" cy="100" r="4" fill="#fff" />

                  {/* Labels */}
                  <text x="0" y="175" textAnchor="start" fill="var(--muted)" fontSize="12">Week 1</text>
                  <text x="200" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Week 2</text>
                  <text x="400" y="175" textAnchor="middle" fill="var(--muted)" fontSize="12">Week 3</text>
                  <text x="600" y="175" textAnchor="end" fill="var(--muted)" fontSize="12">Week 4</text>
                </svg>
              </div>
            </div>

            <div className="card small-cards">
              <h4>Upcoming Appointments</h4>
              {appointments.length === 0 ? (
                <p className="muted small" style={{ padding: '12px 0' }}>No upcoming appointments.</p>
              ) : (
                <ul>
                  {appointments.slice(0, 4).map(a => (
                    <li key={a.id} className="appt-row">
                      <div>
                        <strong>Dr. {a.doctorName}</strong>
                        <div className="muted small">{a.when || a.whenISO || '—'}</div>
                      </div>
                      <div className="muted small">{a.status || 'Scheduled'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card recent-patients">
              <h4>Recent Referrals</h4>
              <div className="muted small">No recent referrals to show.</div>
            </div>
          </div>

          <aside className="right-col">
            <div className="card profile-card">
              <div className="profile-top">
                <div className="avatar">{user ? user.name.charAt(0) : 'P'}</div>
                <div>
                  <h4>{user ? user.name : 'Patient Name'}</h4>
                  <div className="muted small">Member since 2024</div>
                </div>
              </div>
              <div className="profile-stats">
                <div><strong>{appointments.length}</strong><div className="muted small">Appts</div></div>
                <div><strong>3</strong><div className="muted small">Meds</div></div>
                <div><strong>0</strong><div className="muted small">Msgs</div></div>
              </div>
            </div>

            <div className="card income-card">
              <h4>Current Medications</h4>
              <div className="muted small" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Lisinopril</span>
                  <span className="muted">10mg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Atorvastatin</span>
                  <span className="muted">20mg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Metformin</span>
                  <span className="muted">500mg</span>
                </div>
              </div>
              <button className="btn outline small" style={{ marginTop: 12, width: '100%' }}>Request Refill</button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;
