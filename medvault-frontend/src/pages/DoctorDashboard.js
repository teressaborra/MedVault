import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function DoctorDashboard(){
  const [today, setToday] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(()=>{
    // pull mock appointments (if any) for demo
    const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
    const now = new Date();
    const todayStr = now.toISOString().slice(0,10);
    setAppointments(appts.slice(0,12));
    setToday(appts.filter(a=> a.whenISO && a.whenISO.startsWith(todayStr)).slice(0,8));
  },[]);

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
          <a className="muted">Logout</a>
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
              <div className="chart-placeholder">(chart placeholder)</div>
            </div>

            <div className="card small-cards">
              <h4>Appointment Requests</h4>
              <ul>
                {appointments.slice(0,4).map(a=> (
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
