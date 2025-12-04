import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import PatientLogin from "./pages/PatientLogin";
import DoctorLogin from "./pages/DoctorLogin";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Appointments from "./pages/Appointments";
import Signup from "./pages/Signup";
import UpdatePassword from "./pages/UpdatePassword";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ContactUs from "./pages/ContactUs";

function App() {
  return (
    <Router>
      <div>
        <header className="app-header">
          <div className="header-left">
            <h2 className="brand">MedVault</h2>
            <div className="brand-sub">Healthcare & Appointments</div>
          </div>

          

          <div className="header-right">
            <NavLink to="/" className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
              <NavLink to="/contact" className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>Contact Us</NavLink>
        
            <NavLink to="/login" className={({isActive}) => "auth-link login" + (isActive ? " active" : "")}>Login</NavLink>
            <NavLink to="/signup" className={({isActive}) => "auth-link signup" + (isActive ? " active" : "")}>Sign up</NavLink>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/login/patient" element={<PatientLogin />} />
            <Route path="/login/doctor" element={<DoctorLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
          </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
