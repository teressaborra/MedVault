import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import ImageUpload from "../components/ImageUpload";
import Appointments from "./Appointments";
import Dialog from '../components/Dialog';

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState(null);
  
  // Health Records state
  const [healthRecordsTab, setHealthRecordsTab] = useState('demographics');
  const [healthDocuments, setHealthDocuments] = useState([]);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({
    documentName: '',
    documentType: '',
    documentUrl: '',
    documentDate: '',
    doctorName: '',
    hospitalName: '',
    notes: ''
  });

  useEffect(() => {
    // For the mock flow we read user id from localStorage 'mv_current_user' if set
    const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
    if (cur) {
      const users = JSON.parse(localStorage.getItem('mv_users_v1') || '[]');
      const u = users.find(x => x.id === cur.userId);
      // Merge localStorage user data with mv_current_user to preserve identificationId
      setUser({ ...u, ...cur });
      
      // Fetch identification ID from backend
      fetchUserIdentificationId(cur.userId);
    }
    const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
    setAppointments(appts.filter(a => a.userId === (cur ? cur.userId : null)).slice(0, 6));
  }, []);

  const fetchUserIdentificationId = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/user/${userId}`);
      const data = await response.json();
      if (data && data.identificationId) {
        setUser(prev => ({ ...prev, identificationId: data.identificationId }));
      }
    } catch (error) {
      console.error('Error fetching user identification:', error);
    }
  };

  useEffect(() => {
    if (activeView === 'profile' && user) {
      fetchProfile();
    }
    if (activeView === 'health-records' && user) {
      fetchProfile();
      fetchHealthDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, user]);

  const fetchHealthDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/health-documents/patient/${user.userId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHealthDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching health documents:', error);
    }
  };

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
    localStorage.removeItem('mv_jwt_token'); // Clear JWT token
    window.location.href = '/';
  };

  const handleDocumentUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, documentPath: imageUrl }));
    setMessage('Document uploaded successfully! Remember to save your profile.');
  };

  const handleHealthDocUpload = (imageUrl) => {
    setNewDocument(prev => ({ ...prev, documentUrl: imageUrl }));
  };

  const handleAddDocument = async () => {
    if (!newDocument.documentName || !newDocument.documentUrl) {
      setMessage('Please provide document name and upload a file.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/health-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDocument, userId: user.userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('Document added successfully!');
        setIsAddingDocument(false);
        setNewDocument({
          documentName: '',
          documentType: '',
          documentUrl: '',
          documentDate: '',
          doctorName: '',
          hospitalName: '',
          notes: ''
        });
        fetchHealthDocuments();
      } else {
        setMessage('Error: ' + data.message);
      }
    } catch (error) {
      setMessage('Error adding document. Please try again.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    setDialog({
      type: 'confirm',
      title: 'Delete document',
      message: 'Are you sure you want to delete this document?',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/health-documents/${docId}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (data.success) {
            setMessage('Document deleted successfully!');
            fetchHealthDocuments();
          } else {
            setMessage('Error: ' + data.message);
          }
        } catch (error) {
          setMessage('Error deleting document.');
        }
      }
    });
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="dashboard-layout">
      <aside className="left-nav card">
        <h2 className="nav-brand">MedVault</h2>
        <nav className="nav-list">
          <a href="#dashboard" className={activeView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); }}>Dashboard</a>
          <a href="#appointments" onClick={(e) => { e.preventDefault(); setActiveView('appointments'); }} className={activeView === 'appointments' ? 'active' : ''}>Book an Appointment</a>
          <a href="#prescriptions">Prescriptions</a>
          <a href="#health-records" className={activeView === 'health-records' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('health-records'); }}>Health Records</a>
          <a href="#profile" className={activeView === 'profile' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('profile'); }}>My Profile</a>
          <a href="#settings">Settings</a>
          <a href="#logout" className="muted" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
        </nav>
      </aside>

      <main className="main-area">

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
                  <div style={{ marginTop: '1rem' }}>
                    <label>Upload Government ID Document</label>
                    <ImageUpload 
                      onUpload={handleDocumentUpload}
                      existingImage={formData.documentPath}
                      folder="patient_documents"
                    />
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

        {activeView === 'appointments' && (
          <section className="card" style={{ padding: '1.5rem' }}>
            <Appointments />
          </section>
        )}

        {/* Health Records Section */}
        {activeView === 'health-records' && (
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2>Health Records</h2>
              <p className="muted">View and manage your complete health information</p>
              {user?.identificationId && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0, 153, 255, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
                  <strong>Patient ID:</strong> {user.identificationId}
                </div>
              )}
            </div>

            {message && (
              <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: message.includes('success') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)', color: message.includes('success') ? '#0f0' : '#f00' }}>
                {message}
              </div>
            )}

            {/* Health Records Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              {[
                { id: 'demographics', label: '📋 Basic Demographics' },
                { id: 'identification', label: '🪪 Identification' },
                { id: 'medical-history', label: '🏥 Medical History' },
                { id: 'lifestyle', label: '🏃 Lifestyle' },
                { id: 'health-data', label: '❤️ Health Data' },
                { id: 'medications', label: '💊 Medications' },
                { id: 'documents', label: '📁 Documents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn ${healthRecordsTab === tab.id ? 'primary' : 'outline'}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => setHealthRecordsTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Basic Demographics */}
            {healthRecordsTab === 'demographics' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📋 Basic Demographics
                </h3>
                {profileData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Full Name</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{profileData.fullName || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Father/Guardian</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{profileData.fatherGuardianName || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Date of Birth</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{profileData.dateOfBirth || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Age</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{calculateAge(profileData.dateOfBirth)} years</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Gender</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{profileData.gender || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(0, 153, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0, 153, 255, 0.3)' }}>
                      <div className="muted small">Blood Group</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem', color: 'var(--brand)' }}>{profileData.bloodGroup || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Mobile Number</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem' }}>{profileData.mobileNumber || 'N/A'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                      <div className="muted small">Address</div>
                      <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                        {profileData.address && `${profileData.address}, `}
                        {profileData.city && `${profileData.city}, `}
                        {profileData.state && `${profileData.state} `}
                        {profileData.postalCode && `- ${profileData.postalCode}`}
                        {!profileData.address && !profileData.city && 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="muted" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No profile data available. Please complete your profile first.</p>
                    <button className="btn primary" style={{ marginTop: '1rem' }} onClick={() => setActiveView('profile')}>
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Identification Details */}
            {healthRecordsTab === 'identification' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🪪 Identification Details
                </h3>
                {profileData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="info-card" style={{ background: 'rgba(0, 153, 255, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0, 153, 255, 0.3)' }}>
                      <div className="muted small">Patient ID</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--brand)' }}>
                        {user?.identificationId || 'PID-XXXXX'}
                      </div>
                      <div className="muted small" style={{ marginTop: '0.5rem' }}>System Generated</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                      <div className="muted small">Government ID Type</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.5rem' }}>{profileData.governmentIdType || 'Not Provided'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                      <div className="muted small">Government ID Number</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.5rem' }}>{profileData.governmentIdNumber || 'Not Provided'}</div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                      <div className="muted small">Verification Status</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.5rem 1rem', 
                          borderRadius: '20px', 
                          background: profileData.documentVerificationStatus === 'VERIFIED' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', 
                          color: profileData.documentVerificationStatus === 'VERIFIED' ? '#0f0' : '#ffa500',
                          fontWeight: '600'
                        }}>
                          {profileData.documentVerificationStatus === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    {profileData.documentPath && (
                      <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', gridColumn: '1 / -1' }}>
                        <div className="muted small" style={{ marginBottom: '1rem' }}>ID Document</div>
                        <a href={profileData.documentPath} target="_blank" rel="noopener noreferrer">
                          <img src={profileData.documentPath} alt="ID Document" style={{ maxWidth: '300px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="muted" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No identification details available. Please complete your profile first.</p>
                    <button className="btn primary" style={{ marginTop: '1rem' }} onClick={() => setActiveView('profile')}>
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Medical History */}
            {healthRecordsTab === 'medical-history' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏥 Medical History
                </h3>
                {profileData ? (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="info-card" style={{ background: 'rgba(255, 100, 100, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 100, 100, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                        <span className="muted">Allergies</span>
                      </div>
                      <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        {profileData.allergies || 'No known allergies'}
                      </div>
                    </div>
                    <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🩺</span>
                        <span className="muted">Existing Medical Conditions</span>
                      </div>
                      <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        {profileData.existingConditions || 'No existing conditions reported'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="muted" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No medical history available. Please complete your profile first.</p>
                    <button className="btn primary" style={{ marginTop: '1rem' }} onClick={() => setActiveView('profile')}>
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Lifestyle Information */}
            {healthRecordsTab === 'lifestyle' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏃 Lifestyle Information
                </h3>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>Update your lifestyle information to help doctors understand your health better.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label>🚬 Smoking Habit</label>
                    <select name="smokingHabit" value={formData.smokingHabit || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="NEVER">Never</option>
                      <option value="FORMER">Former Smoker</option>
                      <option value="OCCASIONAL">Occasional</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label>🍺 Alcohol Consumption</label>
                    <select name="alcoholHabit" value={formData.alcoholHabit || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="NEVER">Never</option>
                      <option value="OCCASIONAL">Occasional</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label>🥗 Diet Type</label>
                    <select name="dietType" value={formData.dietType || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="VEGETARIAN">Vegetarian</option>
                      <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                      <option value="VEGAN">Vegan</option>
                      <option value="EGGETARIAN">Eggetarian</option>
                    </select>
                  </div>
                  <div>
                    <label>🏋️ Physical Activity Level</label>
                    <select name="physicalActivity" value={formData.physicalActivity || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="SEDENTARY">Sedentary (Little/No Exercise)</option>
                      <option value="LIGHT">Light (1-3 days/week)</option>
                      <option value="MODERATE">Moderate (3-5 days/week)</option>
                      <option value="ACTIVE">Active (6-7 days/week)</option>
                      <option value="VERY_ACTIVE">Very Active (Athlete)</option>
                    </select>
                  </div>
                  <div>
                    <label>😴 Sleep Hours (per night)</label>
                    <select name="sleepHours" value={formData.sleepHours || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="LESS_THAN_5">Less than 5 hours</option>
                      <option value="5_TO_6">5-6 hours</option>
                      <option value="6_TO_7">6-7 hours</option>
                      <option value="7_TO_8">7-8 hours</option>
                      <option value="MORE_THAN_8">More than 8 hours</option>
                    </select>
                  </div>
                  <div>
                    <label>🌙 Sleep Quality</label>
                    <select name="sleepQuality" value={formData.sleepQuality || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="POOR">Poor</option>
                      <option value="FAIR">Fair</option>
                      <option value="GOOD">Good</option>
                      <option value="EXCELLENT">Excellent</option>
                    </select>
                  </div>
                  <div>
                    <label>😰 Stress Level</label>
                    <select name="stressLevel" value={formData.stressLevel || ''} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="LOW">Low</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HIGH">High</option>
                      <option value="VERY_HIGH">Very High</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Lifestyle Info'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Current Health Data */}
            {healthRecordsTab === 'health-data' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ❤️ Current Health Data
                </h3>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>Keep your vitals updated for better health monitoring.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label>⚖️ Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="e.g., 70.5" />
                  </div>
                  <div>
                    <label>📏 Height (cm)</label>
                    <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} placeholder="e.g., 175" />
                  </div>
                  <div className="info-card" style={{ background: 'rgba(0, 153, 255, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0, 153, 255, 0.3)' }}>
                    <div className="muted small">BMI (Auto-calculated)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand)' }}>
                      {formData.weight && formData.height ? 
                        (formData.weight / ((formData.height/100) * (formData.height/100))).toFixed(1) : 
                        profileData?.bmi || 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <label>🩸 Blood Pressure (Systolic)</label>
                    <input type="number" name="bloodPressureSystolic" value={formData.bloodPressureSystolic || ''} onChange={handleChange} placeholder="e.g., 120" />
                  </div>
                  <div>
                    <label>🩸 Blood Pressure (Diastolic)</label>
                    <input type="number" name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic || ''} onChange={handleChange} placeholder="e.g., 80" />
                  </div>
                  <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                    <div className="muted small">Blood Pressure Reading</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {formData.bloodPressureSystolic || profileData?.bloodPressureSystolic || '--'}/
                      {formData.bloodPressureDiastolic || profileData?.bloodPressureDiastolic || '--'} mmHg
                    </div>
                  </div>
                  <div>
                    <label>💓 Pulse Rate (bpm)</label>
                    <input type="number" name="pulseRate" value={formData.pulseRate || ''} onChange={handleChange} placeholder="e.g., 72" />
                  </div>
                  <div>
                    <label>🌡️ Temperature (°F)</label>
                    <input type="number" step="0.1" name="temperature" value={formData.temperature || ''} onChange={handleChange} placeholder="e.g., 98.6" />
                  </div>
                  <div>
                    <label>🫁 Respiratory Rate (breaths/min)</label>
                    <input type="number" name="respiratoryRate" value={formData.respiratoryRate || ''} onChange={handleChange} placeholder="e.g., 16" />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Health Data'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Current Medications */}
            {healthRecordsTab === 'medications' && (
              <div className="health-record-section">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💊 Current Medications
                </h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>List all medications you are currently taking</label>
                    <textarea 
                      name="currentMedications" 
                      value={formData.currentMedications || ''} 
                      onChange={handleChange} 
                      rows="6" 
                      placeholder="e.g.,&#10;Metformin 500mg - twice daily&#10;Lisinopril 10mg - once daily&#10;Atorvastatin 20mg - at night"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Medications'}
                    </button>
                  </div>
                </form>
                
                {profileData?.currentMedications && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Current Medication List</h4>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', whiteSpace: 'pre-wrap' }}>
                      {profileData.currentMedications}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Health Documents */}
            {healthRecordsTab === 'documents' && (
              <div className="health-record-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    📁 Health Documents
                  </h3>
                  <button className="btn primary" onClick={() => setIsAddingDocument(true)}>
                    + Add Document
                  </button>
                </div>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>Upload prescriptions, lab reports, X-rays, and other medical documents.</p>

                {isAddingDocument && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Add New Document</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label>Document Name *</label>
                        <input 
                          type="text" 
                          value={newDocument.documentName} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, documentName: e.target.value }))}
                          placeholder="e.g., Blood Test Report"
                        />
                      </div>
                      <div>
                        <label>Document Type</label>
                        <select 
                          value={newDocument.documentType} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, documentType: e.target.value }))}
                        >
                          <option value="">Select Type</option>
                          <option value="PRESCRIPTION">Prescription</option>
                          <option value="LAB_REPORT">Lab Report</option>
                          <option value="X_RAY">X-Ray</option>
                          <option value="MRI">MRI Scan</option>
                          <option value="CT_SCAN">CT Scan</option>
                          <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                          <option value="INSURANCE">Insurance Document</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label>Document Date</label>
                        <input 
                          type="date" 
                          value={newDocument.documentDate} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, documentDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label>Doctor Name</label>
                        <input 
                          type="text" 
                          value={newDocument.doctorName} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, doctorName: e.target.value }))}
                          placeholder="Dr. Name"
                        />
                      </div>
                      <div>
                        <label>Hospital/Clinic Name</label>
                        <input 
                          type="text" 
                          value={newDocument.hospitalName} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, hospitalName: e.target.value }))}
                          placeholder="Hospital Name"
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>Notes (Optional)</label>
                        <textarea 
                          value={newDocument.notes} 
                          onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional notes..."
                          rows="2"
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>Upload Document *</label>
                        <ImageUpload 
                          onUpload={handleHealthDocUpload}
                          existingImage={newDocument.documentUrl}
                          folder="health_documents"
                          helpText="Upload prescription, report, or scan (Max 10MB)"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button className="btn outline" onClick={() => {
                        setIsAddingDocument(false);
                        setNewDocument({ documentName: '', documentType: '', documentUrl: '', documentDate: '', doctorName: '', hospitalName: '', notes: '' });
                      }}>
                        Cancel
                      </button>
                      <button className="btn primary" onClick={handleAddDocument}>
                        Save Document
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents List */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {healthDocuments.length === 0 ? (
                    <div className="muted" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                      <p>No documents uploaded yet.</p>
                      <p style={{ fontSize: '0.875rem' }}>Click "Add Document" to upload your medical records.</p>
                    </div>
                  ) : (
                    healthDocuments.map(doc => (
                      <div key={doc.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '2rem' }}>
                          {doc.documentType === 'PRESCRIPTION' ? '📋' : 
                           doc.documentType === 'LAB_REPORT' ? '🔬' :
                           doc.documentType === 'X_RAY' ? '🩻' :
                           doc.documentType === 'MRI' || doc.documentType === 'CT_SCAN' ? '🖥️' :
                           '📄'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{doc.documentName}</div>
                          <div className="muted small" style={{ marginTop: '0.25rem' }}>
                            {doc.documentType?.replace('_', ' ')} • {doc.documentDate || 'No date'}
                          </div>
                          {(doc.doctorName || doc.hospitalName) && (
                            <div className="muted small" style={{ marginTop: '0.25rem' }}>
                              {doc.doctorName && `Dr. ${doc.doctorName}`}
                              {doc.doctorName && doc.hospitalName && ' • '}
                              {doc.hospitalName}
                            </div>
                          )}
                          {doc.notes && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                              {doc.notes}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="btn outline small">
                            View
                          </a>
                          <button className="btn outline small" style={{ color: '#f66', borderColor: '#f66' }} onClick={() => handleDeleteDocument(doc.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      {dialog && <Dialog dialog={dialog} setDialog={setDialog} />}
    </div>
  );
}

export default PatientDashboard;
