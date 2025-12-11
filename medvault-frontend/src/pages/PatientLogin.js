import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import mock from "../api/mockBackend";
import { setToken } from "../api/auth";
import "./PatientLogin.css";

function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setName("");
    try {
      const res = await axios.post("http://localhost:8080/api/login", {
        email,
        password,
        role: "PATIENT",
      });

      if (res.data.success) {
        // Store JWT token
        if (res.data.token) {
          setToken(res.data.token);
        }
        // if backend indicates first login required it should include that flag
        const first = res.data.firstLoginRequired;
        const uid = res.data.userId || res.data.user_id;
        const nameResp = res.data.name;
        const identificationId = res.data.identificationId;
        // persist current user for mock/update-password flow
        localStorage.setItem('mv_current_user', JSON.stringify({ userId: uid, role: 'PATIENT', name: nameResp, identificationId }));
        if(first){
          navigate('/update-password');
        } else {
          navigate('/dashboard/patient');
        }
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      // fallback to mock backend if local API not available
      try{
        const r = await mock.login({ email, password, role: 'PATIENT' });
        if(r.success){
          setName(r.name || '');
          setMessage(r.message);
          // persist current user and navigate
          localStorage.setItem('mv_current_user', JSON.stringify({ userId: r.userId, role: 'PATIENT', name: r.name }));
          if(r.firstLoginRequired) navigate('/update-password');
          else navigate('/dashboard/patient');
        } else {
          setMessage(r.message);
        }
      }catch(e){
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">
      <h1>Patient Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Email:{" "}
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Password:{" "}
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button type="submit">Login</button>
      </form>

      {message && (
        <p style={{ marginTop: "10px" }}>
          {message} {name && ` | Welcome, ${name}!`}
        </p>
      )}

      <p style={{ marginTop: "10px" }}>
        <Link to="/">Back to Home</Link>
      </p>
      </div>
    </div>
  );
}

export default PatientLogin;
