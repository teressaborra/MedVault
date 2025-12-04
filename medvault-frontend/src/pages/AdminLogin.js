import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import mock from "../api/mockBackend";
import "./AdminLogin.css";

function AdminLogin() {
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
        role: "ADMIN",
      });

      if (res.data.success) {
        const uid = res.data.userId || res.data.user_id;
        localStorage.setItem('mv_current_user', JSON.stringify({ userId: uid, role: 'ADMIN', name: res.data.name }));
        navigate('/admin');
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      try{
        const r = await mock.login({ email, password, role: 'ADMIN' });
        if(r.success){
          setName(r.name || '');
          setMessage(r.message);
          localStorage.setItem('mv_current_user', JSON.stringify({ userId: r.userId, role: 'ADMIN', name: r.name }));
          navigate('/admin');
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
      <h1>Administrative Login</h1>

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

export default AdminLogin;
