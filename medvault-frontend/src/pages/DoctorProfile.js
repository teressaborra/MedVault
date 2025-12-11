import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorProfile.css';
import ImageUpload from '../components/ImageUpload';

function DoctorProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    specialization: '',
    qualification: '',
    yearsOfExperience: '',
    licenseNumber: '',
    mobileNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    clinicHospitalName: '',
    consultationFee: '',
    availabilitySchedule: '',
    documentPath: '',
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    // Get userId from localStorage (set during login)
    const userData = JSON.parse(localStorage.getItem('mv_current_user') || '{}');
    console.log('LocalStorage user data:', userData);
    
    const userId = userData.userId;
    console.log('Extracted userId:', userId);
    
    if (userId) {
      setFormData(prev => ({ ...prev, userId }));
      fetchProfile(userId);
    } else {
      console.error('No userId found in localStorage! Please login again.');
      setMessage('Please login to access your profile');
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${userId}`);
      const data = await response.json();
      
      if (data.success === false) {
        setProfileExists(false);
      } else {
        setProfileExists(true);
        setFormData({
          userId,
          fullName: data.fullName || '',
          specialization: data.specialization || '',
          qualification: data.qualification || '',
          yearsOfExperience: data.yearsOfExperience || '',
          licenseNumber: data.licenseNumber || '',
          mobileNumber: data.mobileNumber || '',
          alternatePhone: data.alternatePhone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          clinicHospitalName: data.clinicHospitalName || '',
          consultationFee: data.consultationFee || '',
          availabilitySchedule: data.availabilitySchedule || '',
          documentPath: data.documentPath || '',
          bio: data.bio || ''
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
      // Convert string fields to appropriate types
      const submissionData = {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null
      };

      console.log('Submitting data:', submissionData);

      const response = await fetch('http://localhost:8080/api/doctor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setMessage('Profile saved successfully! ✓');
        setProfileExists(true);
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard/doctor');
        }, 1500);
      } else {
        setMessage('Error: ' + data.message);
      }
    } catch (error) {
      setMessage('Error saving profile. Please try again.');
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-profile-container">
      <div className="profile-header">
        <h1>My Professional Profile</h1>
        <p className="profile-subtitle">
          {profileExists ? 'Update your professional information' : 'Complete your profile to start consultations'}
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
                placeholder="Dr. Full Name"
              />
            </div>
            <div className="form-group">
              <label>Specialization *</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                placeholder="e.g., Cardiology, Pediatrics"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Qualification *</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                placeholder="e.g., MBBS, MD, MS"
              />
            </div>
            <div className="form-group">
              <label>Years of Experience *</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
                placeholder="Years"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Medical License Number *</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                placeholder="License number"
              />
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

        {/* Professional Details Section */}
        <div className="form-section">
          <h2>Professional Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Clinic/Hospital Name *</label>
              <input
                type="text"
                name="clinicHospitalName"
                value={formData.clinicHospitalName}
                onChange={handleChange}
                required
                placeholder="Name of clinic or hospital"
              />
            </div>
            <div className="form-group">
              <label>Consultation Fee (₹) *</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                required
                placeholder="Fee amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Availability Schedule</label>
              <textarea
                name="availabilitySchedule"
                value={formData.availabilitySchedule}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., Mon-Fri: 9 AM - 5 PM, Sat: 9 AM - 1 PM"
              />
              <small className="help-text">Describe your availability for consultations</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Brief description about your expertise and experience"
              />
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="form-section">
          <h2>License & Certificates</h2>
          <div className="form-row">
            <div className="form-group full-width">
              <ImageUpload
                label="Medical License / Degree Certificate Upload *"
                currentImage={formData.documentPath}
                onUploadComplete={handleDocumentUpload}
                helpText="Upload your medical license, degree certificate, or registration document - Max 10MB"
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

export default DoctorProfile;
