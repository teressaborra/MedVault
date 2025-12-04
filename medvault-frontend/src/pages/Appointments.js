import React from "react";
import "./Appointments.css";

function Appointments(){
  return (
    <div className="appointments-page">
      <div className="appointments-hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <nav className="crumbs"><a href="/">Home</a> &gt; <span>Book a Hospital Visit</span></nav>
            <h1>Book an Appointment</h1>
            <p className="muted">Search for doctors by name, specialty, or condition from our comprehensive list of healthcare experts.</p>

            <div className="appointment-search">
              <div className="search-left">
                <label className="label">Location/City</label>
                <select className="select">
                  <option>Bangalore</option>
                  <option>Chennai</option>
                  <option>Mumbai</option>
                </select>
              </div>

              <div className="search-mid">
                <label className="label">Search Doctors by</label>
                <input className="full-input" placeholder="Specialty, Condition, Doctor's name" />
              </div>

              <div className="search-action">
                <button className="btn primary large">Search</button>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="illustration" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="appointments-info">
          <h3>How it works</h3>
          <p className="muted">Choose a city, search for your specialist, select a convenient time slot and confirm your visit. You will receive appointment confirmation via email.</p>
        </section>
      </div>
    </div>
  )
}

export default Appointments;
