// import React from "react";
// import { Link } from "react-router-dom";
// import "./Home.css";
// import heroImage from "../assets/hero-image.png";
// import authorImage from "../assets/author.png";
// import urgentCare from "../assets/urgent-care.png";
// import cancerCare from "../assets/cancer-care.png";
// import heartCare from "../assets/heart-care.png";

// function Home() {
//   return (
//     <div className="home-page">
//       {/* Custom Header */}
//       <header className="home-header">
//         <div className="home-brand">
//           {/* You can add a logo icon here if you have one */}
//           <span>MedVault</span>
//         </div>
//         <nav className="home-nav">

//           <Link to="/contact">Contact</Link>
//           <Link to="/login">Login</Link>
//           <Link to="/signup">Signup</Link>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <section className="hero-section">
//         <div className="hero-overlay"></div>
//         <div className="hero-container">
//           <div className="hero-content">
//             <div className="hero-badge">
//               <span className="heart-icon">❤️</span>
//               <span>WE GIVE YOU THE BEST!</span>
//             </div>
            
//             <h1 className="hero-title">
//               <span className="text-medical">Medical</span> Services<br />
//               That You Can <span className="text-trust">Trust</span>
//             </h1>

//             <p className="hero-description">
//               Need professional help? Our support staff will answer your questions.<br />
//               Visit us Now or Make an Appointment!
//             </p>

//             <div className="hero-cta-group">
//               <Link to="/signup" className="btn primary big-btn">MAKE AN APPOINTMENT</Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Care Section */}
//       <section className="care-section">
//         <h2 className="section-title">Discover expert care that's right for you</h2>
//         <div className="care-grid">
//           <div className="care-card">
//             <img src={urgentCare} alt="Urgent Care" />
//             <h3>Urgent Care</h3>
//             <span className="arrow">→</span>
//           </div>
//           <div className="care-card">
//             <img src={cancerCare} alt="Cancer Care" />
//             <h3>Cancer Care</h3>
//             <span className="arrow">→</span>
//           </div>
//           <div className="care-card">
//             <img src={heartCare} alt="Heart Care" />
//             <h3>Heart Care</h3>
//             <span className="arrow">→</span>
//           </div>
//         </div>
//       </section>

//       {/* Footer Section */}
//       <footer className="home-footer">
//         <div className="footer-top">
//           <div className="footer-brand">
//             <h2>MedVault</h2>
//             <p>Receive the latest news and updates</p>
//             <div className="newsletter-form">
//               <input type="email" placeholder="Enter your email address" />
//               <button>SIGN UP</button>
//             </div>
//           </div>
//         </div>

//         <div className="footer-links-grid">
//           <div className="footer-col">
//             <div className="call-box">
//               <span>CALL US 913-588-1227</span>
//             </div>
//             <div className="social-links">
//               <span>f</span>
//               <span>X</span>
//               <span>in</span>
//               <span>📷</span>
//               <span>▶</span>
//             </div>
//           </div>

//           <div className="footer-col">
//             <Link to="/about">About Us</Link>
//             <Link to="/contact">Contact Us</Link>
//             <Link to="/careers">Careers</Link>
//             <Link to="/news">News & Blogs</Link>
//             <Link to="/classes">Classes & Events</Link>
//             <Link to="/volunteer">Volunteer</Link>
//           </div>

//           <div className="footer-col">
//             <Link to="/portal">MyChart (Patient Portal)</Link>
//             <Link to="/billing">Billing, Insurance & Financial Support</Link>
//             <Link to="/pricing">Price Transparency</Link>
//             <Link to="/records">Medical Records</Link>
//             <Link to="/support">Support Services</Link>
//             <Link to="/visitors">Visitor Information</Link>
//           </div>

//           <div className="footer-col">
//             <Link to="/refer">Refer a Patient</Link>
//             <Link to="/professionals">Medical Professionals</Link>
//             <Link to="/cancer-center">The University of Kansas Cancer Center</Link>
//             <Link to="/giving">Giving</Link>
//             <Link to="/media">Media Relations</Link>
//           </div>
//         </div>

//         <div className="footer-bottom">
//           <p>© 2025 MedVault Health System</p>
//           <div className="legal-links">
//             <Link to="/privacy">Notice of Privacy Practices</Link>
//             <Link to="/policy">Privacy Policy</Link>
//             <Link to="/records-act">The Kansas Open Records Act</Link>
//             <Link to="/vendors">Vendors</Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default Home;


import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";


function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,   // animation duration
      once: true,       // animate only once
      easing: "ease-in-out",
    });
  }, []);

  return (
    <div className="home-page">

      {/* Header */}
      <header className="home-header">
        <div className="home-brand">
          <span className="brand-logo">🩺</span>
          <span className="brand-name">MedVault</span>
        </div>
        <nav className="home-nav">
          <Link to="/contact">Contact</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup" className="btn primary small">Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left " data-aos="fade-right">
          <span className="hero-badge">Trusted Healthcare Platform</span>

          <h1>
            Smart Hospital <br />
            <span>Management System</span>
          </h1>

          <p>
            Manage appointments, patients, doctors, and medical records
            securely with MedVault.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn primary big">
              Book Appointment
            </Link>
            <Link to="/login" className="btn outline big">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-right" data-aos="fade-left">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
            alt="Hospital"
          />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 data-aos="fade-up">Why Choose MedVault?</h2>

        <div className="feature-grid">
          <div className="feature-card" data-aos="zoom-in">
            <span>👨‍⚕️</span>
            <h3>Doctor Management</h3>
            <p>Efficiently manage doctor schedules and profiles.</p>
          </div>

          <div className="feature-card" data-aos="zoom-in" data-aos-delay="100">
            <span>📅</span>
            <h3>Appointments</h3>
            <p>Book, reschedule, and track appointments easily.</p>
          </div>

          <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
            <span>📄</span>
            <h3>Medical Records</h3>
            <p>Secure storage and quick access to health records.</p>
          </div>

          <div className="feature-card" data-aos="zoom-in" data-aos-delay="300">
            <span>🔒</span>
            <h3>Secure & Private</h3>
            <p>Data protection with role-based access.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta" data-aos="fade-up">
        <h2>Start managing healthcare the smart way</h2>
        <p>Create your account and experience digital healthcare</p>
        <Link to="/signup" className="btn primary big">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 MedVault Health System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
