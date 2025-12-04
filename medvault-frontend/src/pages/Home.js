import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page container">
      <header className="hero">
        <div className="hero-left">
          <div className="hero-card">
            <div className="eyebrow">Experience</div>
            <h1 className="brand">MedVault</h1>
            <p className="lead">Secure appointment booking and medical record management — built for clinics, doctors and patients.</p>

            <div className="hero-ctas">
              <Link to="/signup" className="btn primary">Get started</Link>
              <Link to="/login" className="btn outline">Login</Link>
              <Link to="/appointments" className="btn secondary">Book Appointment</Link>
            </div>

            <div className="hero-search">
              <input aria-label="search services" placeholder="Search doctors, specialties or clinics" />
              <button className="btn primary">Search</button>
            </div>
          </div>
        </div>

        <div className="hero-right">
          

          <div className="feature-card">
            <h4>For Patients</h4>
            <p>Quickly book appointments, view prescriptions, and access records.</p>
          </div>
          <div className="feature-card">
            <h4>For Doctors</h4>
            <p>Manage schedules, patient notes, and follow-ups in one place.</p>
          </div>
        </div>
      </header>

          

          <section className="insights container">
            <div className="insights-header">
              <h2>Healthcare Insights</h2>
              <p className="muted">Read about MedVault's success stories, latest news and expert articles to stay informed about better patient care.</p>
            </div>

            <div className="insights-nav">
              <button className="btn primary">Success Stories</button>
              <button className="btn outline">News & Articles</button>
              <button className="btn outline">Blogs From Our Experts</button>
            </div>

            <div className="insights-grid">
              <article className="article-card">
                <div className="article-thumb" />
                <h4>Successful Heart and Kidney Treatment</h4>
                <p className="muted">A patient story about a complex cardiology and nephrology recovery using coordinated care.</p>
              </article>

              <article className="article-card">
                <div className="article-thumb" />
                <h4>Congenital Heart Surgery Success</h4>
                <p className="muted">Surgeons share a step-by-step case of a pediatric heart surgery with excellent outcomes.</p>
              </article>

              <article className="article-card">
                <div className="article-thumb" />
                <h4>Thalassemia Treatment Advances</h4>
                <p className="muted">New transfusion protocols reduced complications and improved quality of life.</p>
              </article>

              <article className="article-card">
                <div className="article-thumb" />
                <h4>Heart Attack In Young Age — Prevention Tips</h4>
                <p className="muted">Expert tips on preventing early heart disease through lifestyle and screening.</p>
              </article>
            </div>
          </section>
    </div>
  );
}

export default Home;
