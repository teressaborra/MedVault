import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import heroImage from "../assets/hero-image.png";
import authorImage from "../assets/author.png";
import urgentCare from "../assets/urgent-care.png";
import cancerCare from "../assets/cancer-care.png";
import heartCare from "../assets/heart-care.png";

function Home() {
  return (
    <div className="home-page">
      {/* Custom Header */}
      <header className="home-header">
        <div className="home-brand">
          {/* You can add a logo icon here if you have one */}
          <span>MedVault</span>
        </div>
        <nav className="home-nav">

          <Link to="/contact">Contact</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            The Best Healthcare Experience for You
          </h1>

          <div className="hero-tagline">
            <h2>We serve.</h2>
            <h2>We solve.</h2>
            <h2>We save.</h2>
          </div>

          <div className="hero-cta-group">
            <Link to="/signup" className="btn primary big-btn">Book an Appointment</Link>
            <div className="play-video">
              <span className="play-icon">▶</span>
              <span>Watch Video</span>
            </div>
          </div>
        </div>

        <div className="hero-image-container">
          <img src={heroImage} alt="Healthcare Technology" className="hero-image" />
        </div>
      </section>

      {/* Care Section */}
      <section className="care-section">
        <h2 className="section-title">Discover expert care that's right for you</h2>
        <div className="care-grid">
          <div className="care-card">
            <img src={urgentCare} alt="Urgent Care" />
            <h3>Urgent Care</h3>
            <span className="arrow">→</span>
          </div>
          <div className="care-card">
            <img src={cancerCare} alt="Cancer Care" />
            <h3>Cancer Care</h3>
            <span className="arrow">→</span>
          </div>
          <div className="care-card">
            <img src={heartCare} alt="Heart Care" />
            <h3>Heart Care</h3>
            <span className="arrow">→</span>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>MedVault</h2>
            <p>Receive the latest news and updates</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button>SIGN UP</button>
            </div>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <div className="call-box">
              <span>CALL US 913-588-1227</span>
            </div>
            <div className="social-links">
              <span>f</span>
              <span>X</span>
              <span>in</span>
              <span>📷</span>
              <span>▶</span>
            </div>
          </div>

          <div className="footer-col">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/news">News & Blogs</Link>
            <Link to="/classes">Classes & Events</Link>
            <Link to="/volunteer">Volunteer</Link>
          </div>

          <div className="footer-col">
            <Link to="/portal">MyChart (Patient Portal)</Link>
            <Link to="/billing">Billing, Insurance & Financial Support</Link>
            <Link to="/pricing">Price Transparency</Link>
            <Link to="/records">Medical Records</Link>
            <Link to="/support">Support Services</Link>
            <Link to="/visitors">Visitor Information</Link>
          </div>

          <div className="footer-col">
            <Link to="/refer">Refer a Patient</Link>
            <Link to="/professionals">Medical Professionals</Link>
            <Link to="/cancer-center">The University of Kansas Cancer Center</Link>
            <Link to="/giving">Giving</Link>
            <Link to="/media">Media Relations</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 MedVault Health System</p>
          <div className="legal-links">
            <Link to="/privacy">Notice of Privacy Practices</Link>
            <Link to="/policy">Privacy Policy</Link>
            <Link to="/records-act">The Kansas Open Records Act</Link>
            <Link to="/vendors">Vendors</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
