import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientProfile.css';
import ImageUpload from '../components/ImageUpload';

function PatientProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    fatherGuardianName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    mobileNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    governmentIdType: '',
    governmentIdNumber: '',
    documentPath: '',
    existingConditions: '',
    allergies: '',
    currentMedications: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    // Get userId from localStorage (set during login)
    const userData = JSON.parse(localStorage.getItem('mv_current_user') || '{}');
    const userId = userData.userId;
    
    if (userId) {
      setFormData(prev => ({ ...prev, userId }));
      fetchProfile(userId);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/patient/profile/${userId}`);
      const data = await response.json();
      
      if (data.success === false) {
        // Profile doesn't exist yet
        setProfileExists(false);
      } else {
        // Profile exists, populate form
        setProfileExists(true);
        setFormData({
          userId,
          fullName: data.fullName || '',
          fatherGuardianName: data.fatherGuardianName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          mobileNumber: data.mobileNumber || '',
          alternatePhone: data.alternatePhone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          governmentIdType: data.governmentIdType || '',
          governmentIdNumber: data.governmentIdNumber || '',
          documentPath: data.documentPath || '',
          existingConditions: data.existingConditions || '',
          allergies: data.allergies || '',
          currentMedications: data.currentMedications || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = (url) => {
    setFormData(prev => ({ ...prev, documentPath: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/patient/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Profile saved successfully! ✓');
        setProfileExists(true);
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard/patient');
        }, 1500);
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

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p className="profile-subtitle">
          {profileExists ? 'Update your personal information' : 'Complete your profile to access all features'}
        </p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        
        {/* Personal Information Section */}
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Father/Guardian Name *</label>
              <input
                type="text"
                name="fatherGuardianName"
                value={formData.fatherGuardianName}
                onChange={handleChange}
                required
                placeholder="Enter father/guardian name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">Select Blood Group</option>
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

        {/* Contact Information Section */}
        <div className="form-section">
          <h2>Contact Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                placeholder="Optional alternate number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Street address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="State"
              />
            </div>
            <div className="form-group">
              <label>Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                placeholder="PIN Code"
              />
            </div>
          </div>
        </div>

        {/* Government ID Section */}
        <div className="form-section">
          <h2>Government ID Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>ID Type *</label>
              <select
                name="governmentIdType"
                value={formData.governmentIdType}
                onChange={handleChange}
                required
              >
                <option value="">Select ID Type</option>
                <option value="AADHAR">Aadhar Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="VOTER_ID">Voter ID</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Number *</label>
              <input
                type="text"
                name="governmentIdNumber"
                value={formData.governmentIdNumber}
                onChange={handleChange}
                required
                placeholder="Enter ID number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <ImageUpload
                label="Government ID Document Upload *"
                currentImage={formData.documentPath}
                onUploadComplete={handleDocumentUpload}
                helpText="Upload a clear photo of your government ID (Aadhar, Passport, etc.) - Max 10MB"
              />
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="form-section">
          <h2>Medical History (Optional)</h2>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Existing Conditions</label>
              <textarea
                name="existingConditions"
                value={formData.existingConditions}
                onChange={handleChange}
                rows="3"
                placeholder="List any existing medical conditions (e.g., Diabetes, Hypertension)"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="2"
                placeholder="List any allergies (e.g., Penicillin, Peanuts)"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Current Medications</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                rows="2"
                placeholder="List current medications with dosage"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : profileExists ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientProfile;
