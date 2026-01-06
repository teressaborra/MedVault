import React, { useEffect, useState } from "react";
import axios from "axios";
import mock from "../api/mockBackend";
import Modal from "../components/Modal";
import "./AdminDashboard.css";

function UsersList({ role, reloadKey }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    let mounted = true;
    async function fetchList() {
      setLoading(true);
      // Try backend first
      try {
        const res = await axios.get(`http://localhost:8080/api/admin/users?role=${encodeURIComponent(role)}`);
        if (!mounted) return;
        if (res.data && Array.isArray(res.data)) {
          setList(res.data);
          fetchAllProfiles(res.data);
          setLoading(false);
          return;
        }
        // If backend returns an object with { success, users }
        if (res.data && res.data.users) {
          setList(res.data.users);
          fetchAllProfiles(res.data.users);
          setLoading(false);
          return;
        }
      } catch (err) {
        // backend not available or error - fall back to mock
        try {
          const m = await mock.adminList(role);
          if (!mounted) return;
          setList(m);
          setLoading(false);
          return;
        } catch (e) {
          console.error('admin list error', e);
        }
      }
      if (mounted) setLoading(false);
    }
    fetchList();
    return () => mounted = false;
  }, [role, reloadKey]);

  async function fetchAllProfiles(users) {
    const endpoint = role === 'PATIENT' ? 'patient' : 'doctor';
    console.log(`*** FETCHING ALL ${endpoint.toUpperCase()} PROFILES ***`);
    try {
      const res = await axios.get(`http://localhost:8080/api/${endpoint}/all`);
      console.log(`*** ${endpoint.toUpperCase()} PROFILES RESPONSE:`, res.data);
      console.log(`*** Total profiles fetched: ${res.data?.length || 0}`);
      if (res.data && res.data.length > 0) {
        console.log(`*** First profile sample:`, res.data[0]);
      }
      setProfiles(res.data || []);
    } catch (err) {
      console.error(`*** Error fetching ${endpoint} profiles:`, err);
    }
  }

  async function viewProfile(userId, userRole) {
    console.log('=== VIEW PROFILE CALLED ===');
    console.log('userId:', userId, 'userRole:', userRole);
    
    try {
      const endpoint = userRole === 'PATIENT' 
        ? `http://localhost:8080/api/patient/profile/${userId}`
        : `http://localhost:8080/api/doctor/profile/${userId}`;
      
      console.log('Calling endpoint:', endpoint);
      const res = await axios.get(endpoint);
      
      console.log('=== API RESPONSE ===');
      console.log('Full response:', res);
      console.log('Response data:', res.data);
      console.log('Data type:', typeof res.data);
      console.log('Data keys:', Object.keys(res.data || {}));
      console.log('Has success field:', res.data?.success);
      console.log('Has id field:', res.data?.id);
      console.log('Has fullName field:', res.data?.fullName);
      // Check if it's an error response with success=false
      if (res.data && res.data.success === false) {
        console.log('Error response detected');
        setModal({ isOpen: true, title: 'Profile Not Found', message: res.data.message || 'Profile not found or not yet created by user', type: 'warning' });
        return;
      }
      
      // Success case: Profile object returned directly (has id and fullName)
      if (res.data && res.data.id) {
        console.log('Valid profile detected, setting state');
        setProfileData(res.data);
        setSelectedProfile(userId);
        setSelectedRole(userRole);
        console.log('State updated successfully');
      } else {
        console.log('Invalid profile data structure');
        setModal({ isOpen: true, title: 'Profile Not Found', message: 'Profile not found or not yet created by user', type: 'warning' });
      }
    } catch (err) {
      console.error('=== ERROR ===');
      console.error('Error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      setModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || err.message, type: 'error' });
    }
  }

  function closeProfile() {
    setSelectedProfile(null);
    setProfileData(null);
    setSelectedRole(null);
  }

  async function verifyProfile() {
    try {
      const endpoint = selectedRole === 'PATIENT' ? 'patient' : 'doctor';
      
      // Get the user ID from the profile
      const userId = profileData.user ? profileData.user.id : selectedProfile;
      
      console.log('Verifying profile for userId:', userId, 'role:', selectedRole);
      
      // Use the new verification endpoint
      const res = await axios.post(`http://localhost:8080/api/${endpoint}/profile/${userId}/verify`);
      
      if (res.data.success) {
        setModal({ isOpen: true, title: 'Success', message: 'Profile verified successfully!', type: 'success' });
        setProfileData({ ...profileData, documentVerificationStatus: 'VERIFIED' });
        // Refresh the list to show updated status
        fetchAllProfiles(list);
        closeProfile();
      } else {
        setModal({ isOpen: true, title: 'Error', message: res.data.message, type: 'error' });
      }
    } catch (err) {
      console.error('Error verifying profile:', err);
      console.error('Error details:', err.response?.data);
      setModal({ isOpen: true, title: 'Error', message: 'Error verifying profile: ' + (err.response?.data?.message || err.message), type: 'error' });
    }
  }

  async function approve(id) {
    // try backend approve
    try {
      const res = await axios.post(`http://localhost:8080/api/admin/users/${id}/approve`);
      if (res.data && res.data.success) {
        const pwd = res.data.password;
        const email = res.data.email || '';
        setModal({ isOpen: true, title: 'User Approved', message: `Approved ${email}.\n\nTemporary Password: ${pwd}\n\nPlease copy this password.`, type: 'success' });
        setList(list.map(u => u.id === id ? { ...u, status: 'APPROVED' } : u));
        return;
      }
    } catch (err) {
      // fallback to mock
      try {
        const r = await mock.adminApprove(id);
        if (r.success) {
          setModal({ isOpen: true, title: 'User Approved', message: `Approved ${r.email}.\n\nTemporary Password: ${r.password}\n\nPlease copy this password.`, type: 'success' });
          setList(list.map(u => u.id === id ? { ...u, status: 'APPROVED' } : u));
          return;
        }
      } catch (e) { console.error(e); }
    }
  }

  async function reject(id) {
    try {
      const res = await axios.post(`http://localhost:8080/api/admin/users/${id}/reject`);
      if (res.data && res.data.success) {
        setList(list.map(u => u.id === id ? { ...u, status: 'REJECTED' } : u));
        return;
      }
    } catch (err) {
      try {
        const r = await mock.adminReject(id);
        if (r.success) setList(list.map(u => u.id === id ? { ...u, status: 'REJECTED' } : u));
      } catch (e) { console.error(e); }
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const getUserProfile = (userId) => {
    console.log(`*** Looking for profile for userId: ${userId}`);
    console.log(`*** Available profiles:`, profiles);
    console.log(`*** Profiles count: ${profiles.length}`);
    const found = profiles.find(p => p.user && p.user.id === userId);
    console.log(`*** Found profile:`, found);
    return found;
  };

  return (
    <div className="admin-table-container">
      {list.length === 0 && <div className="muted" style={{ padding: '2rem' }}>No users found for this role.</div>}
      
      {list.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registered</th>
              <th>Profile Status</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => {
              const profile = getUserProfile(u.id);
              const hasProfile = !!profile;
              const profileVerified = profile?.documentVerificationStatus === 'VERIFIED';
              const accountStatus = (u.status || 'PENDING').toString();
              
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{u.name || u.username || 'N/A'}</div>
                    {profile && profile.fullName && <div className="muted small">{profile.fullName}</div>}
                  </td>
                  <td>{u.email}</td>
                  <td className="muted small">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {hasProfile ? (
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', background: profileVerified ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', color: profileVerified ? '#0f0' : '#ffa500' }}>
                        {profileVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    ) : (
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', background: 'rgba(128, 128, 128, 0.2)', color: '#888' }}>
                        Not Created
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', background: accountStatus === 'APPROVED' ? 'rgba(0, 255, 0, 0.2)' : accountStatus === 'REJECTED' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', color: accountStatus === 'APPROVED' ? '#0f0' : accountStatus === 'REJECTED' ? '#f00' : '#ffa500' }}>
                      {accountStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {accountStatus === 'PENDING' && (
                        <>
                          <button className="btn primary small" onClick={() => approve(u.id)}>Approve</button>
                          <button className="btn outline small" onClick={() => reject(u.id)}>Reject</button>
                        </>
                      )}
                      {hasProfile && (
                        <button className="btn outline small" onClick={() => viewProfile(profile?.user?.id || u.id, role)}>View Profile</button>
                      )}
                      {!hasProfile && accountStatus === 'APPROVED' && (
                        <span className="muted small">Awaiting profile</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Profile Modal */}
      {selectedProfile && profileData && (
        <div className="profile-modal-overlay" onClick={closeProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRole === 'PATIENT' ? 'Patient' : 'Doctor'} Profile Details</h2>
              <button className="close-btn" onClick={closeProfile}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <strong>Verification Status:</strong>
                  <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: profileData.documentVerificationStatus === 'VERIFIED' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)', color: profileData.documentVerificationStatus === 'VERIFIED' ? '#0f0' : '#ffa500', fontSize: '0.875rem' }}>
                    {profileData.documentVerificationStatus || 'Pending'}
                  </span>
                </div>
                {profileData.documentVerificationStatus !== 'VERIFIED' && (
                  <button className="btn primary" onClick={verifyProfile}>Verify Profile</button>
                )}
              </div>
              {selectedRole === 'PATIENT' ? (
                <div className="profile-details">
                  <div className="detail-row"><strong>Full Name:</strong> {profileData.fullName || 'N/A'}</div>
                  <div className="detail-row"><strong>Father/Guardian:</strong> {profileData.fatherGuardianName || 'N/A'}</div>
                  <div className="detail-row"><strong>Date of Birth:</strong> {profileData.dateOfBirth || 'N/A'}</div>
                  <div className="detail-row"><strong>Gender:</strong> {profileData.gender || 'N/A'}</div>
                  <div className="detail-row"><strong>Blood Group:</strong> {profileData.bloodGroup || 'N/A'}</div>
                  <div className="detail-row"><strong>Mobile:</strong> {profileData.mobileNumber || 'N/A'}</div>
                  <div className="detail-row"><strong>Alternate Phone:</strong> {profileData.alternatePhone || 'N/A'}</div>
                  <div className="detail-row"><strong>Address:</strong> {profileData.address || 'N/A'}</div>
                  <div className="detail-row"><strong>City:</strong> {profileData.city || 'N/A'}</div>
                  <div className="detail-row"><strong>State:</strong> {profileData.state || 'N/A'}</div>
                  <div className="detail-row"><strong>Postal Code:</strong> {profileData.postalCode || 'N/A'}</div>
                  <div className="detail-row"><strong>Government ID:</strong> {profileData.governmentIdType || 'N/A'} - {profileData.governmentIdNumber || 'N/A'}</div>
                  {profileData.documentPath && (
                    <div className="detail-row document-section">
                      <strong>Government ID Document:</strong>
                      <div className="document-preview-admin">
                        {profileData.documentPath.match(/\.(jpeg|jpg|gif|png|webp)$/i) || profileData.documentPath.includes('cloudinary.com') ? (
                          <a href={profileData.documentPath} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={profileData.documentPath} 
                              alt="Government ID" 
                              className="admin-doc-image"
                            />
                          </a>
                        ) : (
                          <a 
                            href={profileData.documentPath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="admin-doc-link"
                          >
                            📄 View Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="detail-row"><strong>Medical Conditions:</strong> {profileData.existingConditions || 'None'}</div>
                  <div className="detail-row"><strong>Allergies:</strong> {profileData.allergies || 'None'}</div>
                  <div className="detail-row"><strong>Current Medications:</strong> {profileData.currentMedications || 'None'}</div>
                </div>
              ) : (
                <div className="profile-details">
                  <div className="detail-row"><strong>Full Name:</strong> {profileData.fullName || 'N/A'}</div>
                  <div className="detail-row"><strong>Specialization:</strong> {profileData.specialization || 'N/A'}</div>
                  <div className="detail-row"><strong>Qualification:</strong> {profileData.qualification || 'N/A'}</div>
                  <div className="detail-row"><strong>Experience:</strong> {profileData.yearsOfExperience || 0} years</div>
                  <div className="detail-row"><strong>License Number:</strong> {profileData.licenseNumber || 'N/A'}</div>
                  <div className="detail-row"><strong>Mobile:</strong> {profileData.mobileNumber || 'N/A'}</div>
                  <div className="detail-row"><strong>Alternate Phone:</strong> {profileData.alternatePhone || 'N/A'}</div>
                  <div className="detail-row"><strong>Address:</strong> {profileData.address || 'N/A'}</div>
                  <div className="detail-row"><strong>City:</strong> {profileData.city || 'N/A'}</div>
                  <div className="detail-row"><strong>State:</strong> {profileData.state || 'N/A'}</div>
                  <div className="detail-row"><strong>Postal Code:</strong> {profileData.postalCode || 'N/A'}</div>
                  <div className="detail-row"><strong>Clinic/Hospital:</strong> {profileData.clinicHospitalName || 'N/A'}</div>
                  <div className="detail-row"><strong>Consultation Fee:</strong> ₹{profileData.consultationFee || 0}</div>
                  <div className="detail-row"><strong>Availability:</strong> {profileData.availabilitySchedule || 'N/A'}</div>
                  {profileData.documentPath && (
                    <div className="detail-row document-section">
                      <strong>Medical License / Certificate:</strong>
                      <div className="document-preview-admin">
                        {profileData.documentPath.match(/\.(jpeg|jpg|gif|png|webp)$/i) || profileData.documentPath.includes('cloudinary.com') ? (
                          <a href={profileData.documentPath} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={profileData.documentPath} 
                              alt="Medical License" 
                              className="admin-doc-image"
                            />
                          </a>
                        ) : (
                          <a 
                            href={profileData.documentPath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="admin-doc-link"
                          >
                            📄 View Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="detail-row"><strong>Bio:</strong> {profileData.bio || 'N/A'}</div>
                </div>
              )}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn outline" onClick={closeProfile}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({
    departments: 8,
    doctors: 14,
    patients: 1,
    appointments: 3,
    caseStudies: 0,
    invoices: 0,
    prescriptions: 0,
    payments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users?role=PATIENT'),
        axios.get('http://localhost:8080/api/admin/users?role=DOCTOR')
      ]);
      
      setStats(prev => ({
        ...prev,
        patients: Array.isArray(patientsRes.data) ? patientsRes.data.length : 0,
        doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0
      }));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  const statCards = [
    { label: 'Department', value: stats.departments, color: '#2196F3', icon: '🏥' },
    { label: 'Doctor', value: stats.doctors, color: '#4CAF50', icon: '👨‍⚕️' },
    { label: 'Patient', value: stats.patients, color: '#2196F3', icon: '👤' },
    { label: 'Patient Appointment', value: stats.appointments, color: '#FFC107', icon: '📅' },
    { label: 'Patient Case Studies', value: stats.caseStudies, color: '#FFC107', icon: '📋' },
    { label: 'Invoice', value: stats.invoices, color: '#2196F3', icon: '💰' },
    { label: 'Prescription', value: stats.prescriptions, color: '#4CAF50', icon: '💊' },
    { label: 'Payment', value: stats.payments, color: '#2196F3', icon: '💳' }
  ];

  const monthlyData = [
    { month: 'Jan', users: 65 },
    { month: 'Feb', users: 85 },
    { month: 'Mar', users: 60 },
    { month: 'Apr', users: 90 },
    { month: 'May', users: 70 },
    { month: 'Jun', users: 85 },
    { month: 'Jul', users: 55 },
    { month: 'Aug', users: 75 },
    { month: 'Sep', users: 45 },
    { month: 'Oct', users: 0 },
    { month: 'Nov', users: 0 },
    { month: 'Dec', users: 0 }
  ];

  const maxUsers = Math.max(...monthlyData.map(d => d.users));

  return (
    <div>
      <h2 style={{ padding: '1.5rem', paddingBottom: '1rem', margin: 0 }}>Dashboard</h2>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>{stat.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', padding: '0 1.5rem 1.5rem' }}>
        {/* Monthly Registered Users Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Registered Users</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '250px', padding: '1rem 0' }}>
            {monthlyData.map((data, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(data.users / maxUsers) * 100}%`, 
                  background: ['#2196F3', '#4CAF50', '#f44336', '#FFC107'][idx % 4],
                  borderRadius: '4px 4px 0 0',
                  minHeight: data.users > 0 ? '20px' : '0',
                  transition: 'height 0.3s'
                }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Earning */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Monthly Earning</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.25rem 0.75rem', background: 'var(--brand)', border: 'none', borderRadius: '4px', color: '#000', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Weekly</button>
              <button style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.75rem', cursor: 'pointer' }}>Monthly</button>
            </div>
          </div>
          
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>This Week</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--brand)' }}>$29.5</div>
              <div style={{ fontSize: '0.75rem', color: '#f44336', marginTop: '0.25rem' }}>-31.08% From Previous week</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>-40.36%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>last 15 days Analytics</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFC107' }}>-30.36%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>last 15 days Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationTabs({ reloadKey }) {
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        <button 
          className={activeTab === 'patients' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('patients')}
          style={{ 
            padding: '1rem 2rem', 
            border: 'none', 
            background: 'transparent',
            color: activeTab === 'patients' ? 'var(--brand)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'patients' ? '3px solid var(--brand)' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'patients' ? '600' : '400',
            transition: 'all 0.3s'
          }}
        >
          Patient Verification
        </button>
        <button 
          className={activeTab === 'doctors' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('doctors')}
          style={{ 
            padding: '1rem 2rem', 
            border: 'none', 
            background: 'transparent',
            color: activeTab === 'doctors' ? 'var(--brand)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'doctors' ? '3px solid var(--brand)' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'doctors' ? '600' : '400',
            transition: 'all 0.3s'
          }}
        >
          Doctor Verification
        </button>
      </div>

      {activeTab === 'patients' && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Patient Profile Verification</h3>
          <UsersList role="PATIENT" reloadKey={reloadKey} />
        </div>
      )}

      {activeTab === 'doctors' && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Doctor Profile Verification</h3>
          <UsersList role="DOCTOR" reloadKey={reloadKey} />
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [reloadKey, setReloadKey] = useState(0);

  async function seedSample() {
    try {
      await mock.resetMock();
    } catch (e) { }
    try { await mock.seedMock(); } catch (e) { console.error('seed err', e); }
    setReloadKey(k => k + 1);
  }
  
  useEffect(() => {
    try { window.__mv_seed = seedSample; window.__mv_reset = mock.resetMock; } catch (e) { }
    return () => { try { delete window.__mv_seed; delete window.__mv_reset; } catch (e) { } };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mv_current_user');
    localStorage.removeItem('mv_jwt_token');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <aside className="left-nav card">
        <h2 className="nav-brand">MEDVAULT</h2>
        <nav className="nav-list">
          <a className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>Dashboard</a>
          <a className={activeView === 'patients' ? 'active' : ''} onClick={() => setActiveView('patients')}>Patient Management</a>
          <a className={activeView === 'doctors' ? 'active' : ''} onClick={() => setActiveView('doctors')}>Doctor Management</a>
          <a className={activeView === 'verification' ? 'active' : ''} onClick={() => setActiveView('verification')}>Profile Verification</a>
          <a>Reports</a>
          <a>Settings</a>
          <a className="muted" onClick={handleLogout}>Logout</a>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-bar card">
          <div className="search">
            <input placeholder="Search users, profiles..." />
          </div>
         
        </header>

        {activeView === 'dashboard' && (
          <section style={{ padding: '0' }}>
            <DashboardOverview />
          </section>
        )}

        {activeView === 'patients' && (
          <section className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Patient Management</h2>
              <p className="muted">Approve or reject patient registrations and manage profiles</p>
            </div>
            <UsersList role="PATIENT" reloadKey={reloadKey} />
          </section>
        )}

        {activeView === 'doctors' && (
          <section className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Doctor Management</h2>
              <p className="muted">Approve or reject doctor registrations and verify credentials</p>
            </div>
            <UsersList role="DOCTOR" reloadKey={reloadKey} />
          </section>
        )}

        {activeView === 'verification' && (
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2>Profile Verification</h2>
              <p className="muted">Verify document submissions and professional credentials</p>
            </div>
            <VerificationTabs reloadKey={reloadKey} />
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
