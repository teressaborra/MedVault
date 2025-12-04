import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";
 import mock from "../api/mockBackend";


function Signup() {
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validate() {
    if (!name.trim() || !email.trim() ) {
      return "Please fill all required fields.";
    }
    if (!password) return "Please provide a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    const at = email.indexOf("@");
    if (at < 1 || at === email.length - 1) return "Please enter a valid email.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      // call backend (include password)
      const response = await axios.post("http://localhost:8080/api/signup", {
        name,
        email,
        role,
        password,
      }, {
        headers: { "Content-Type": "application/json" }
      });

    // backend returns { success: boolean, message: string }
    const res = response.data;
    if (res.success) {
      setSuccess(res.message);
      setName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setRole("patient");
    } else {
      setError(res.message || "Signup failed.");
    }
  } catch (err) {
    // better error messaging
    console.error("Signup error:", err);
    // If backend isn't available, fall back to local mock so dev signup still works
    try{
      const r = await mock.signup({ name, email, role, password });
      if(r.success){
        setSuccess(r.message);
        setName(""); setEmail(""); setPassword(""); setConfirm(""); setRole("patient");
      } else {
        setError(r.message || "Signup failed.");
      }
    }catch(e){
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  }
  }


  return (
    <div className="signup-page container">
      <div className="signup-card">
        <div className="signup-inner">
          <div className="panel-left">
            <h1>WELCOME TO MEDVAULT</h1>
            <h4>Join us and manage your health records securely </h4>
            
            <p className="muted">Choose your account type and create secure access to MedVault. (Admin will approve accounts.)</p>
          </div>

          <div className="panel-right">
            <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="row form-row">
            <label htmlFor="role">Account type</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div className="row form-row">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>

          <div className="row form-row">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="row form-row">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" />
          </div>

          <div className="row form-row">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">Create account</button>
            <button type="button" className="btn outline" onClick={() => {
              setName(""); setEmail(""); setPassword(""); setConfirm(""); setRole("patient"); setError(""); setSuccess("");
            }}>Reset</button>
          </div>
            </form>

            <p className="foot muted">Already have an account? Use the <a href="/login">Login</a> page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
