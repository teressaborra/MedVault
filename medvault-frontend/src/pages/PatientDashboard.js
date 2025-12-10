import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (activeView === 'profile' && user) {
      fetchProfile();
    }
  }, [activeView, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/patient/profile/${user.userId}`);
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
      const response = await fetch('http://localhost:8080/api/patient/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.userId })
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

  const handleLogout = () => {
    localStorage.removeItem('mv_current_user');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <aside className="left-nav card">
        <h2 className="nav-brand">MedVault</h2>
        <nav className="nav-list">
          <a className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>Dashboard</a>
          <a href="/appointments">Appointments</a>
          <a>Prescriptions</a>
          <a>Records</a>
          <a className={activeView === 'profile' ? 'active' : ''} onClick={() => setActiveView('profile')}>My Profile</a>
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

        {activeView === 'dashboard' && (
          <>
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
          </>
        )}

        {activeView === 'profile' && (
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2>Patient Profile</h2>
                <p className="muted">Manage your personal and medical information</p>
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
                    <div><strong>Father/Guardian:</strong> {profileData.fatherGuardianName || 'N/A'}</div>
                    <div><strong>Date of Birth:</strong> {profileData.dateOfBirth || 'N/A'}</div>
                    <div><strong>Gender:</strong> {profileData.gender || 'N/A'}</div>
                    <div><strong>Blood Group:</strong> {profileData.bloodGroup || 'N/A'}</div>
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
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Government ID</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div><strong>ID Type:</strong> {profileData.governmentIdType || 'N/A'}</div>
                    <div><strong>ID Number:</strong> {profileData.governmentIdNumber || 'N/A'}</div>
                    <div><strong>Verification Status:</strong> 
                      <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: profileData.documentVerificationStatus === 'VERIFIED' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', color: profileData.documentVerificationStatus === 'VERIFIED' ? '#0f0' : '#ffa500', fontSize: '0.875rem' }}>
                        {profileData.documentVerificationStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Medical History</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div><strong>Existing Conditions:</strong> {profileData.existingConditions || 'None'}</div>
                    <div><strong>Allergies:</strong> {profileData.allergies || 'None'}</div>
                    <div><strong>Current Medications:</strong> {profileData.currentMedications || 'None'}</div>
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
                      <label>Father/Guardian Name</label>
                      <input type="text" name="fatherGuardianName" value={formData.fatherGuardianName || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <label>Date of Birth *</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>Gender *</label>
                      <select name="gender" value={formData.gender || ''} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label>Blood Group</label>
                      <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
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
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Government ID</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label>ID Type</label>
                      <select name="governmentIdType" value={formData.governmentIdType || ''} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="Aadhar">Aadhar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Passport">Passport</option>
                        <option value="DrivingLicense">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label>ID Number</label>
                      <input type="text" name="governmentIdNumber" value={formData.governmentIdNumber || ''} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--brand)' }}>Medical History</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label>Existing Conditions</label>
                      <textarea name="existingConditions" value={formData.existingConditions || ''} onChange={handleChange} rows="3" placeholder="e.g., Diabetes, Hypertension" />
                    </div>
                    <div>
                      <label>Allergies</label>
                      <textarea name="allergies" value={formData.allergies || ''} onChange={handleChange} rows="2" placeholder="e.g., Penicillin, Peanuts" />
                    </div>
                    <div>
                      <label>Current Medications</label>
                      <textarea name="currentMedications" value={formData.currentMedications || ''} onChange={handleChange} rows="3" placeholder="e.g., Metformin 500mg twice daily" />
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
    </div>
  );
}

export default PatientDashboard;
