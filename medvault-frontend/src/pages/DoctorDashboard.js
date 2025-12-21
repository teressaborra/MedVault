import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import ImageUpload from "../components/ImageUpload";
import Dialog from '../components/Dialog';

function DoctorDashboard() {
  const [today, setToday] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  // multi-date/selectable slots UI
  const [selectedDates, setSelectedDates] = useState([]); // ['2025-12-20', ...]
  const [selectedDateSlots, setSelectedDateSlots] = useState({}); // { date: [{id,time,active}] }
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('09:30');
  const [genInterval, setGenInterval] = useState(30); // minutes
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [dialog, setDialog] = useState(null); // { type:'alert'|'confirm'|'prompt', title, message, defaultValue, onConfirm }
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState(null);

  const filterActiveSchedules = (arr) => {
    return (arr || []).filter(s => (s.slots || []).some(sl => sl.active)).sort((a,b)=>a.date.localeCompare(b.date));
  };

  useEffect(() => {
    // pull mock appointments (if any) for demo
    const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    setAppointments(appts.slice(0, 12));
    setToday(appts.filter(a => a.whenISO && a.whenISO.startsWith(todayStr)).slice(0, 8));
    
    const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
    setUser(cur);
  }, []);

  useEffect(() => {
    // load schedules for current doctor
    if (user && user.userId) {
      // try backend first
      (async () => {
        try {
          const res = await fetch(`http://localhost:8080/api/doctor/schedules/${user.userId}`);
          const j = await res.json();
          if (j && j.success && Array.isArray(j.data)) {
            // adapt backend shape to frontend expected shape
            const adapted = j.data.map(x => ({ doctorId: x.doctorUserId, doctorName: x.doctorName, specialization: x.specialization, date: x.date, slots: x.slots, scheduleId: x.id }));
            setSchedules(filterActiveSchedules(adapted));
            return;
          }
        } catch (e) {
          // ignore and fallback to localStorage
        }

        const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
        const mine = all.filter(s => s.doctorId === user.userId);
        setSchedules(filterActiveSchedules(mine));
      })();
    }
  }, [user]);

  useEffect(() => {
    if (activeView === 'profile' && user) {
      fetchProfile();
    }
  }, [activeView, user]);

  useEffect(() => {
    // load doctor's appointments when My Appointments view active
    let iv;
    const fetchDoctorAppointments = async () => {
      if (!user || !user.userId) return;
      try {
        const res = await fetch(`http://localhost:8080/api/appointments/doctor/${user.userId}`);
        const j = await res.json();
        if (j && j.success && Array.isArray(j.data)) {
          setDoctorAppointments(j.data.slice(0, 100));
          return;
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }
      const all = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
      const mine = all.filter(a => a.doctorUserId === user.userId).sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
      setDoctorAppointments(mine);
    };

    if (activeView === 'appointments') {
      fetchDoctorAppointments();
      iv = setInterval(fetchDoctorAppointments, 8000);

      // listen for localStorage changes (same-browser) to update instantly
      const onStorage = (e) => {
        if (e.key === 'mv_appointments') fetchDoctorAppointments();
      };
      window.addEventListener('storage', onStorage);

      return () => { clearInterval(iv); window.removeEventListener('storage', onStorage); };
    }
  }, [activeView, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.userId}`);
      const data = await response.json();
      
      if (data.success === false) {
        setIsEditMode(true);
        setFormData({ userId: user.userId });
      } else {
        setProfileData(data);
        setFormData(data);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsEditMode(true);
      setFormData({ userId: user.userId });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submissionData = {
        ...formData,
        userId: user.userId,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null
      };

      const response = await fetch('http://localhost:8080/api/doctor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Profile saved successfully! ✓');
        setProfileData(data.data);
        setIsEditMode(false);
        fetchProfile();
      } else {
        setMessage('Error: ' + data.message);
      }
    } catch (error) {
      setMessage('Error saving profile. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, documentPath: imageUrl }));
    setMessage('Document uploaded successfully! Remember to save your profile.');
  };

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
          <a className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>Dashboard</a>
          <a className={activeView === 'appointments' ? 'active' : ''} onClick={() => setActiveView('appointments')}>My Appointments</a>
          <a className={activeView === 'profile' ? 'active' : ''} onClick={() => setActiveView('profile')}>My Profile</a>
          <a className={activeView === 'schedule' ? 'active' : ''} onClick={() => setActiveView('schedule')}>My Schedule</a>
          <a>Documents</a>
          <a>Settings</a>
          <a className="muted" onClick={() => {
            localStorage.removeItem('mv_current_user');
            localStorage.removeItem('mv_jwt_token');
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

        {activeView === 'dashboard' && (
          <>
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
          </>
        )}

        {rescheduleAppt && (
          <div className="modal-overlay" onClick={() => { setRescheduleAppt(null); setRescheduleDate(null); setRescheduleSlotId(null); }}>
            <div className="modal-popup" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: 720 }}>
              <h3 style={{ marginTop: 0 }}>Reschedule: {rescheduleAppt.patientName || `Patient ${rescheduleAppt.patientUserId}`}</h3>
              <div className="muted" style={{ marginBottom: 12 }}>Current: {rescheduleAppt.date} — {rescheduleAppt.slotTime}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ minWidth: 220 }}>
                  <h4 style={{ marginBottom: 8 }}>Dates</h4>
                  <div style={{ display: 'grid', gap: 8, maxHeight: 300, overflow: 'auto' }}>
                    {(schedules || []).filter(x=> (x.slots||[]).some(sl=>sl.active)).sort((a,b)=>a.date.localeCompare(b.date)).map(d => (
                      <button key={d.date} className={rescheduleDate === d.date ? 'btn primary' : 'btn outline'} onClick={() => { setRescheduleDate(d.date); setRescheduleSlotId(null); }} style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700 }}>{d.date}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{(d.slots||[]).filter(sl=>sl.active).length} slots</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: 8 }}>Available Slots{rescheduleDate ? ` — ${rescheduleDate}` : ''}</h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {!rescheduleDate && <div className="muted">Select a date to view slots</div>}
                    {rescheduleDate && (() => {
                      const dd = (schedules || []).find(x => x.date === rescheduleDate) || { slots: [] };
                      const slots = (dd.slots || []).filter(s=>s.active);
                      if (slots.length === 0) return <div className="muted">No active slots available for this date.</div>;
                      return (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {slots.map(slot => (
                            <button key={slot.id} className={rescheduleSlotId === slot.id ? 'btn primary' : 'btn outline'} onClick={() => setRescheduleSlotId(slot.id)}>
                              <div style={{ fontWeight: 700 }}>{slot.time}</div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn outline" onClick={() => { setRescheduleAppt(null); setRescheduleDate(null); setRescheduleSlotId(null); }}>Cancel</button>
                <button className="btn primary" style={{ marginLeft: 8 }} onClick={async () => {
                  if (!rescheduleSlotId || !rescheduleDate) { setDialog({ type: 'alert', title: 'Validation', message: 'Choose a date and slot first' }); return; }
                  try {
                    const body = { scheduleId: (schedules || []).find(x=>x.date===rescheduleDate)?.scheduleId || (schedules || []).find(x=>x.date===rescheduleDate)?.scheduleId, slotId: rescheduleSlotId, date: rescheduleDate, slotTime: (schedules||[]).find(x=>x.date===rescheduleDate)?.slots.find(s=>s.id===rescheduleSlotId)?.time };
                    const res = await fetch(`http://localhost:8080/api/appointments/${rescheduleAppt.id}/reschedule`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                    const j = await res.json();
                    if (j && j.success) {
                      setDoctorAppointments(prev => prev.map(x => x.id === rescheduleAppt.id ? j.data : x));
                      setDialog({ type: 'alert', title: 'Rescheduled', message: 'Appointment rescheduled successfully' });
                      setRescheduleAppt(null); setRescheduleDate(null); setRescheduleSlotId(null);
                    } else {
                      setDialog({ type: 'alert', title: 'Error', message: j && j.message ? j.message : 'Failed to reschedule' });
                    }
                  } catch (e) {
                    setDialog({ type: 'alert', title: 'Error', message: 'Server error while rescheduling' });
                  }
                }}>Confirm Reschedule</button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'appointments' && (
          <section className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2>My Appointments</h2>
                <p className="muted">Patient bookings for your clinic.</p>
              </div>
            </div>

            <div>
              {doctorAppointments.length === 0 ? (
                <div className="muted">No appointments yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Patient</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>When</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Slot</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorAppointments.map(a => (
                      <tr key={a.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px' }}>{a.patientName || `User ${a.patientUserId || '—'}`}</td>
                        <td style={{ padding: '8px' }}>{a.date || a.when || a.whenISO || '—'}</td>
                        <td style={{ padding: '8px' }}>{a.slotTime || a.slot || '—'}</td>
                        <td style={{ padding: '8px' }}>{a.status || 'CONFIRMED'}</td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn outline" onClick={() => {
                              setDialog({ type: 'confirm', title: 'Cancel Appointment', message: 'Cancel this appointment?', onConfirm: async () => {
                                try {
                                  const res = await fetch(`http://localhost:8080/api/appointments/${a.id}/cancel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                                  const j = await res.json();
                                  if (j && j.success) {
                                    // remove cancelled appointment from view
                                    try {
                                      const r2 = await fetch(`http://localhost:8080/api/appointments/doctor/${user.userId}`);
                                      const j2 = await r2.json();
                                      if (j2 && j2.success && Array.isArray(j2.data)) {
                                        // exclude cancelled ones
                                        const filtered = j2.data.filter(a2 => (a2.status || '').toUpperCase() !== 'CANCELLED');
                                        setDoctorAppointments(filtered.slice(0,100));
                                      } else {
                                        setDoctorAppointments(prev => prev.filter(x => x.id !== a.id));
                                      }
                                    } catch (e2) {
                                      setDoctorAppointments(prev => prev.filter(x => x.id !== a.id));
                                    }
                                    // also update localStorage copy
                                    try {
                                      const all = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
                                      const idx = all.findIndex(x => x.id === a.id || (x.doctorUserId===a.doctorUserId && x.date===a.date && x.slotTime===a.slotTime));
                                      if (idx !== -1) { all.splice(idx,1); localStorage.setItem('mv_appointments', JSON.stringify(all)); }
                                    } catch (e3) { }
                                  }
                                } catch (e) {
                                  // fallback to localStorage update
                                  try {
                                    const all = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
                                    const idx = all.findIndex(x => x.id === a.id || (x.doctorUserId===a.doctorUserId && x.date===a.date && x.slotTime===a.slotTime));
                                    if (idx !== -1) { all[idx].status = 'CANCELLED'; localStorage.setItem('mv_appointments', JSON.stringify(all)); }
                                    const mine = all.filter(x => x.doctorUserId === user.userId).sort((p,q)=> (q.createdAt||'').localeCompare(p.createdAt||''));
                                    setDoctorAppointments(mine);
                                  } catch (e3) { }
                                }
                                setDialog(null);
                              }});
                            }}>Cancel</button>
                            <button className="btn outline" onClick={() => {
                              setRescheduleAppt(a); setRescheduleDate(null); setRescheduleSlotId(null);
                            }}>Reschedule</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {activeView === 'schedule' && (
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2>My Schedule</h2>
                <p className="muted">Upload available dates and define time slots (mandatory).</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Add Available Dates (selectable)</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="date" value={newScheduleDate} onChange={e => setNewScheduleDate(e.target.value)} />
                  <button className="btn outline" onClick={() => {
                    if (!newScheduleDate) { setDialog({ type: 'alert', title: 'Validation', message: 'Please choose a date' }); return; }
                    if (selectedDates.includes(newScheduleDate)) { setDialog({ type: 'alert', title: 'Validation', message: 'Date already selected' }); return; }
                    // prevent adding a date that's already uploaded for this doctor
                    if ((schedules || []).some(s => s.date === newScheduleDate)) { setDialog({ type: 'alert', title: 'Already Scheduled', message: `Date ${newScheduleDate} is already uploaded for your account` }); return; }
                    setSelectedDates(prev => [...prev, newScheduleDate].sort());
                    setSelectedDateSlots(prev => ({ ...prev, [newScheduleDate]: prev[newScheduleDate] || [] }));
                    setNewScheduleDate('');
                }}>Add Date</button>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', paddingLeft: 12, marginLeft: 8 }}>
                  <div style={{ marginBottom: 8 }}><strong>Selected Dates</strong></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedDates.length === 0 && <div className="muted">No dates selected</div>}
                    {selectedDates.map(d => (
                      <button key={d} className={currentSelectedDate === d ? 'btn primary' : 'btn outline'} onClick={() => setCurrentSelectedDate(d)} style={{ whiteSpace: 'nowrap' }}>
                        {d} <span style={{ marginLeft: 8 }}>{(selectedDateSlots[d]||[]).length} slots</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h5 style={{ marginBottom: 8 }}>Add slot for selected date</h5>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="time" value={slotStart} onChange={e => setSlotStart(e.target.value)} />
                  <span style={{ fontSize: 18 }}>—</span>
                  <input type="time" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} />
                  <button className="btn outline" onClick={() => {
                    if (!currentSelectedDate) { setDialog({ type: 'alert', title: 'Validation', message: 'Please pick a date from Selected Dates to add slots' }); return; }
                    if (!slotStart || !slotEnd) { setDialog({ type: 'alert', title: 'Validation', message: 'Please select start and end times' }); return; }
                    const timeLabel = `${slotStart}-${slotEnd}`;
                    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
                    // prevent duplicate identical time entries for the same date
                    if ((selectedDateSlots[currentSelectedDate] || []).some(x => x.time === timeLabel)) {
                      setDialog({ type: 'alert', title: 'Validation', message: 'This slot time is already added for the selected date' });
                      return;
                    }
                    setSelectedDateSlots(prev => ({
                      ...(prev || {}),
                      [currentSelectedDate]: [
                        ...((prev && prev[currentSelectedDate]) || []),
                        { id, time: timeLabel, active: true }
                      ]
                    }));
                  }}>Add slot</button>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      Interval
                      <input type="number" min={5} step={5} value={genInterval} onChange={e => setGenInterval(parseInt(e.target.value || '30'))} style={{ width: 80 }} />
                      mins
                    </label>
                    <button className="btn outline" onClick={() => {
                      if (!currentSelectedDate) { setDialog({ type: 'alert', title: 'Validation', message: 'Pick a date first' }); return; }
                      if (!slotStart || !slotEnd) { setDialog({ type: 'alert', title: 'Validation', message: 'Select start and end times' }); return; }
                      const toMinutes = (t) => { const [hh, mm] = t.split(':').map(Number); return hh*60 + mm; };
                      const fromMinutes = toMinutes(slotStart);
                      const toMins = toMinutes(slotEnd);
                      if (fromMinutes >= toMins) { setDialog({ type: 'alert', title: 'Validation', message: 'End time must be after start time' }); return; }
                      const interval = Math.max(5, parseInt(genInterval) || 30);
                      const newSlots = [];
                      for (let cur = fromMinutes; cur + interval <= toMins; cur += interval) {
                        const fmt = (m) => { const hh = Math.floor(m/60).toString().padStart(2,'0'); const mm = (m%60).toString().padStart(2,'0'); return `${hh}:${mm}`; };
                        const label = `${fmt(cur)}-${fmt(cur+interval)}`;
                        newSlots.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`, time: label, active: true });
                      }
                      if (newSlots.length === 0) { setDialog({ type: 'alert', title: 'Validation', message: 'No slots generated with given interval' }); return; }
                      // merge, avoid duplicates by time
                      setSelectedDateSlots(prev => {
                        const existing = ((prev && prev[currentSelectedDate]) || []).slice();
                        const times = new Set(existing.map(x=>x.time));
                        const merged = existing.slice();
                        newSlots.forEach(s => { if (!times.has(s.time)) { merged.push(s); times.add(s.time); } });
                        return { ...(prev||{}), [currentSelectedDate]: merged };
                      });
                    }}>Generate slots</button>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="btn primary" onClick={async () => {
                      if (selectedDates.length === 0) { setDialog({ type: 'alert', title: 'Validation', message: 'Select at least one date with slots before uploading' }); return; }
                      // build entries array
                      const docName = (profileData && profileData.fullName) || (user && user.name) || 'Unknown';
                      const specialization = (profileData && profileData.specialization) || 'N/A';
                      const entries = selectedDates.map(d => ({ date: d, slots: (selectedDateSlots[d] || []).slice() }));
                      // validate
                      const empty = entries.find(e => !e.slots || e.slots.length === 0);
                      if (empty) { setDialog({ type: 'alert', title: 'Validation', message: 'All selected dates must have at least one slot' }); return; }

                      // check duplicates against existing schedules for this doctor
                      const duplicateDate = selectedDates.find(d => (schedules || []).some(s => s.date === d));
                      if (duplicateDate) { setDialog({ type: 'alert', title: 'Already Scheduled', message: `Date ${duplicateDate} is already uploaded for your account` }); return; }

                      // try backend per-date create; if any fail, fallback to local storage for all
                      let backendOk = true;
                      const created = [];
                      try {
                        for (const e of entries) {
                          const body = { doctorUserId: user.userId, doctorName: docName, specialization, date: e.date, slots: e.slots };
                          const res = await fetch('http://localhost:8080/api/doctor/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                          const j = await res.json();
                          if (j && j.success && j.data) { created.push({ doctorId: j.data.doctorUserId || user.userId, doctorName: j.data.doctorName || docName, specialization: j.data.specialization || specialization, date: j.data.date, slots: j.data.slots || e.slots, scheduleId: j.data.id }); }
                          else { backendOk = false; break; }
                        }
                      } catch (err) { backendOk = false; }

                      if (backendOk && created.length) {
                        setSchedules(prev => filterActiveSchedules([ ...(prev || []), ...created ]));
                        setSelectedDates([]); setSelectedDateSlots({}); setCurrentSelectedDate('');
                        return;
                      }

                      // fallback to localStorage
                      const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
                      entries.forEach(e => {
                        all.push({ doctorId: user?.userId, doctorName: docName, specialization, date: e.date, slots: e.slots });
                      });
                      localStorage.setItem('mv_doctor_schedules', JSON.stringify(all));
                      const mine = all.filter(s=>s.doctorId===user.userId);
                      setSchedules(filterActiveSchedules(mine));
                      setSelectedDates([]); setSelectedDateSlots({}); setCurrentSelectedDate('');
                    }}>Upload All</button>
                  </div>
                </div>

                {currentSelectedDate && (
                  <div style={{ marginTop: 12 }}>
                    <h5>Slots for {currentSelectedDate}</h5>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(selectedDateSlots[currentSelectedDate] || []).map(s => (
                        <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, flex: 1 }}>{s.time}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn outline" onClick={() => {
                              const newTime = window.prompt('Edit slot time (e.g. 18:00-18:30)', s.time);
                              if (!newTime) return;
                              setSelectedDateSlots(prev => ({
                                ...(prev || {}),
                                [currentSelectedDate]: (prev[currentSelectedDate] || []).map(x => x.id === s.id ? { ...x, time: newTime } : x)
                              }));
                            }}>Edit</button>

                            <button className="btn outline" onClick={() => setSelectedDateSlots(prev => ({ ...prev, [currentSelectedDate]: (prev[currentSelectedDate]||[]).filter(x => x.id !== s.id) }))}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4>Uploaded Dates</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Doctor Name</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Specialization</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '12px' }} className="muted">No schedules uploaded yet.</td></tr>
                  )}
                  {schedules.map((s, idx) => {
                    const activeCount = (s.slots || []).filter(sl=>sl.active).length;
                    return (
                      <tr key={`${s.doctorId}_${s.date}_${idx}`} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px' }}>{s.doctorName}</td>
                        <td style={{ padding: '8px' }}>{s.specialization}</td>
                        <td style={{ padding: '8px' }}>{s.date}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ marginRight: 12 }}>{activeCount} active</span>
                          <button className="btn outline" onClick={() => { setActiveSchedule(s); setShowSlotsModal(true); }}>View Slots</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showSlotsModal && activeSchedule && (
              <div className="modal-overlay" onClick={() => { setShowSlotsModal(false); setActiveSchedule(null); }}>
                <div className="modal-popup" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: 640 }}>
                  <h3 style={{ marginTop: 0 }}>Slots for {activeSchedule.date}</h3>
                  <div style={{ marginBottom: 12 }} className="muted">Doctor: {activeSchedule.doctorName} — {activeSchedule.specialization}</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(activeSchedule.slots || []).map(slot => (
                      <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: 6, background: slot.active ? 'rgba(255,255,255,0.02)' : 'rgba(255,0,0,0.04)' }}>
                        <div>
                          <strong>{slot.time}</strong>
                          <div className="muted" style={{ fontSize: '0.85rem' }}>{slot.active ? 'Active' : 'Disabled'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn outline" onClick={async () => {
                            // Toggle active (reuse existing PATCH)
                            if (activeSchedule && activeSchedule.scheduleId) {
                              try {
                                const res = await fetch(`http://localhost:8080/api/doctor/schedules/${activeSchedule.scheduleId}/slots/${slot.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                                const j = await res.json();
                                if (j && j.success) {
                                  const res2 = await fetch(`http://localhost:8080/api/doctor/schedules/${user.userId}`);
                                  const j2 = await res2.json();
                                  if (j2 && j2.success) {
                                    const adapted = j2.data.map(x => ({ doctorId: x.doctorUserId, doctorName: x.doctorName, specialization: x.specialization, date: x.date, slots: x.slots, scheduleId: x.id }));
                                    setSchedules(filterActiveSchedules(adapted));
                                    const updated = adapted.find(x=>x.scheduleId===activeSchedule.scheduleId && x.date===activeSchedule.date);
                                    setActiveSchedule(updated || null);
                                    return;
                                  }
                                }
                              } catch (e) { }
                            }

                            const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
                            const idx = all.findIndex(x => x.doctorId === activeSchedule.doctorId && x.date === activeSchedule.date);
                            if (idx === -1) return;
                            const slotIdx = all[idx].slots.findIndex(x => x.id === slot.id);
                            if (slotIdx === -1) return;
                            all[idx].slots[slotIdx].active = !all[idx].slots[slotIdx].active;
                            localStorage.setItem('mv_doctor_schedules', JSON.stringify(all));
                            const mine = all.filter(s=>s.doctorId===user.userId).sort((a,b)=>a.date.localeCompare(b.date));
                            setSchedules(filterActiveSchedules(mine));
                            const updated = mine.find(x=>x.doctorId===activeSchedule.doctorId && x.date===activeSchedule.date);
                            setActiveSchedule(updated || null);
                          }}>{slot.active ? 'Disable' : 'Enable'}</button>

                          <button className="btn outline" onClick={async () => {
                            const newTime = window.prompt('Edit slot time (e.g. 18:00-18:30)', slot.time);
                            if (!newTime) return;
                            // try backend edit
                            if (activeSchedule && activeSchedule.scheduleId) {
                              try {
                                const res = await fetch(`http://localhost:8080/api/doctor/schedules/${activeSchedule.scheduleId}/slots/${slot.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ time: newTime }) });
                                const j = await res.json();
                                if (j && j.success) {
                                  const res2 = await fetch(`http://localhost:8080/api/doctor/schedules/${user.userId}`);
                                  const j2 = await res2.json();
                                  if (j2 && j2.success) {
                                    const adapted = j2.data.map(x => ({ doctorId: x.doctorUserId, doctorName: x.doctorName, specialization: x.specialization, date: x.date, slots: x.slots, scheduleId: x.id }));
                                    setSchedules(filterActiveSchedules(adapted));
                                    const updated = adapted.find(x=>x.scheduleId===activeSchedule.scheduleId && x.date===activeSchedule.date);
                                    setActiveSchedule(updated || null);
                                    return;
                                  }
                                }
                              } catch (e) { }
                            }
                            // fallback localStorage
                            const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
                            const idx = all.findIndex(x => x.doctorId === activeSchedule.doctorId && x.date === activeSchedule.date);
                            if (idx === -1) return;
                            const slotIdx = all[idx].slots.findIndex(x => x.id === slot.id);
                            if (slotIdx === -1) return;
                            all[idx].slots[slotIdx].time = newTime;
                            localStorage.setItem('mv_doctor_schedules', JSON.stringify(all));
                            const mine = all.filter(s=>s.doctorId===user.userId).sort((a,b)=>a.date.localeCompare(b.date));
                            setSchedules(filterActiveSchedules(mine));
                            const updated = mine.find(x=>x.doctorId===activeSchedule.doctorId && x.date===activeSchedule.date);
                            setActiveSchedule(updated || null);
                          }}>Edit</button>

                          <button className="btn outline" onClick={() => {
                            setDialog({
                              type: 'confirm',
                              title: 'Confirm Delete',
                              message: 'Delete this slot? This cannot be undone.',
                              onConfirm: async () => {
                                // try backend delete
                                if (activeSchedule && activeSchedule.scheduleId) {
                                  try {
                                    const res = await fetch(`http://localhost:8080/api/doctor/schedules/${activeSchedule.scheduleId}/slots/${slot.id}`, { method: 'DELETE' });
                                    const j = await res.json();
                                    if (j && j.success) {
                                      const res2 = await fetch(`http://localhost:8080/api/doctor/schedules/${user.userId}`);
                                      const j2 = await res2.json();
                                      if (j2 && j2.success) {
                                        const adapted = j2.data.map(x => ({ doctorId: x.doctorUserId, doctorName: x.doctorName, specialization: x.specialization, date: x.date, slots: x.slots, scheduleId: x.id }));
                                        const filtered = filterActiveSchedules(adapted);
                                        setSchedules(filtered);
                                        const updated = filtered.find(x=>x.scheduleId===activeSchedule.scheduleId && x.date===activeSchedule.date);
                                        setActiveSchedule(updated || null);
                                        setDialog(null);
                                        return;
                                      }
                                    }
                                  } catch (e) { }
                                }
                                // fallback localStorage delete
                                const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
                                const idx = all.findIndex(x => x.doctorId === activeSchedule.doctorId && x.date === activeSchedule.date);
                                if (idx === -1) { setDialog(null); return; }
                                all[idx].slots = all[idx].slots.filter(x => x.id !== slot.id);
                                localStorage.setItem('mv_doctor_schedules', JSON.stringify(all));
                                const mine = all.filter(s=>s.doctorId===user.userId);
                                const filtered = filterActiveSchedules(mine);
                                setSchedules(filtered);
                                const updated = filtered.find(x=>x.doctorId===activeSchedule.doctorId && x.date===activeSchedule.date);
                                setActiveSchedule(updated || null);
                                setDialog(null);
                              }
                            });
                          }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn primary" onClick={() => { setShowSlotsModal(false); setActiveSchedule(null); }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeView === 'profile' && (
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2>Doctor Profile</h2>
                <p className="muted">Manage your professional information</p>
              </div>
              {!isEditMode && profileData && (
                <button className="btn primary" onClick={() => setIsEditMode(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: message.includes('success') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)', color: message.includes('success') ? '#0f0' : '#f00' }}>
                {message}
              </div>
            )}

            {!isEditMode && profileData ? (
              <div style={{ display: 'grid', gap: '2rem' }}>
                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Personal Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div><strong>Full Name:</strong> {profileData.fullName || 'N/A'}</div>
                    <div><strong>Specialization:</strong> {profileData.specialization || 'N/A'}</div>
                    <div><strong>Qualification:</strong> {profileData.qualification || 'N/A'}</div>
                    <div><strong>Years of Experience:</strong> {profileData.yearsOfExperience || 'N/A'}</div>
                    <div><strong>License Number:</strong> {profileData.licenseNumber || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Contact Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div><strong>Mobile:</strong> {profileData.mobileNumber || 'N/A'}</div>
                    <div><strong>Alternate Phone:</strong> {profileData.alternatePhone || 'N/A'}</div>
                    <div><strong>Address:</strong> {profileData.address || 'N/A'}</div>
                    <div><strong>City:</strong> {profileData.city || 'N/A'}</div>
                    <div><strong>State:</strong> {profileData.state || 'N/A'}</div>
                    <div><strong>Postal Code:</strong> {profileData.postalCode || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Professional Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div><strong>Clinic/Hospital:</strong> {profileData.clinicHospitalName || 'N/A'}</div>
                    <div><strong>Consultation Fee:</strong> ₹{profileData.consultationFee || 'N/A'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Availability:</strong> {profileData.availabilitySchedule || 'N/A'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Bio:</strong> {profileData.bio || 'N/A'}</div>
                    <div><strong>Verification Status:</strong> 
                      <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: profileData.documentVerificationStatus === 'VERIFIED' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', color: profileData.documentVerificationStatus === 'VERIFIED' ? '#0f0' : '#ffa500', fontSize: '0.875rem' }}>
                        {profileData.documentVerificationStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Personal Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>Specialization *</label>
                      <input type="text" name="specialization" value={formData.specialization || ''} onChange={handleChange} required placeholder="e.g., Cardiology" />
                    </div>
                    <div>
                      <label>Qualification *</label>
                      <input type="text" name="qualification" value={formData.qualification || ''} onChange={handleChange} required placeholder="e.g., MBBS, MD" />
                    </div>
                    <div>
                      <label>Years of Experience</label>
                      <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <label>License Number *</label>
                      <input type="text" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} required />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label>Upload Medical License/Certificate</label>
                    <ImageUpload 
                      onUpload={handleDocumentUpload}
                      existingImage={formData.documentPath}
                      folder="doctor_documents"
                    />
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Contact Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label>Mobile Number *</label>
                      <input type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>Alternate Phone</label>
                      <input type="tel" name="alternatePhone" value={formData.alternatePhone || ''} onChange={handleChange} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Address *</label>
                      <input type="text" name="address" value={formData.address || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>City *</label>
                      <input type="text" name="city" value={formData.city || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>State *</label>
                      <input type="text" name="state" value={formData.state || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>Postal Code *</label>
                      <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Professional Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label>Clinic/Hospital Name</label>
                      <input type="text" name="clinicHospitalName" value={formData.clinicHospitalName || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <label>Consultation Fee (₹)</label>
                      <input type="number" name="consultationFee" value={formData.consultationFee || ''} onChange={handleChange} step="0.01" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Availability Schedule</label>
                      <input type="text" name="availabilitySchedule" value={formData.availabilitySchedule || ''} onChange={handleChange} placeholder="e.g., Mon-Fri 9AM-5PM" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Bio</label>
                      <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="4" placeholder="Brief professional bio..." />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {profileData && (
                    <button type="button" className="btn outline" onClick={() => { setIsEditMode(false); setFormData(profileData); }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
      {dialog && <Dialog dialog={dialog} setDialog={setDialog} />}
    </div>
  );
}

export default DoctorDashboard;
