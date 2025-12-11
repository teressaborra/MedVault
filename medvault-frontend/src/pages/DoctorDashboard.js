import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import ImageUpload from "../components/ImageUpload";

function DoctorDashboard() {
  const [today, setToday] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

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
    if (activeView === 'profile' && user) {
      fetchProfile();
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
          <a>Appointments</a>
          <a className={activeView === 'profile' ? 'active' : ''} onClick={() => setActiveView('profile')}>My Profile</a>
          <a>Messages</a>
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
    </div>
  );
}

export default DoctorDashboard;
