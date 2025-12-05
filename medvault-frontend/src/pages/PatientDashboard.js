import React, { useEffect, useState } from "react";
import mock from "../api/mockBackend";
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

  return (
    <div className="dashboard container">
      <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Patient Dashboard</h1>
          <p className="muted">Welcome {user ? user.name : 'Patient'}</p>
        </div>
        <button className="btn outline" onClick={() => {
          localStorage.removeItem('mv_current_user');
          window.location.href = '/';
        }}>Logout</button>
      </header>

      <section className="overview-grid">
        <div className="stat-card card">
          <div className="stat-head">
            <h4>Appointments</h4>
            <a className="view-all" href="/appointments">View All</a>
          </div>
          {appointments.length === 0 ? (
            <p className="muted">No upcoming appointments. Book one from the appointments page.</p>
          ) : (
            <ul>
              {appointments.slice(0, 3).map(a => (
                <li key={a.id}><strong>{a.when}</strong> — Dr. {a.doctorName}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="stat-card card">
          <div className="stat-head">
            <h4>Current Medication</h4>
            <a className="view-all" href="#">View Med List</a>
          </div>
          <p className="muted">You have <strong>3</strong> medications on your active list.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn primary">View Med List</button>
            <button className="btn outline">Request Refill</button>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-head">
            <h4>Recent Referrals</h4>
            <a className="view-all" href="#">View All</a>
          </div>
          <p className="muted">No recent referrals.</p>
        </div>
      </section>

      <section className="dash-grid">


        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" >Book Appointment</button>
            <button className="btn outline">View Records</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
