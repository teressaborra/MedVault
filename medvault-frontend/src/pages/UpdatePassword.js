import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mock from "../api/mockBackend";

function UpdatePassword(){
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [current, setCurrent] = useState("");
  const [nw, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  useEffect(()=>{
    const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
    if(cur){ setUserId(cur.userId || ''); setRole(cur.role || ''); }
  },[]);

  async function submit(e){
    e.preventDefault(); setMsg("");
    if(!userId){ setMsg("User id not available. Please login or enter user id (mock)"); return; }
    if(!current || !nw){ setMsg("Fill passwords"); return; }
    if(nw !== confirm){ setMsg("New password and confirm must match"); return; }
    if(nw === current){ setMsg("New password must not equal current"); return; }
    const res = await mock.updatePassword({ userId, currentPassword: current, newPassword: nw });
    if(!res.success) { setMsg(res.message || "Update failed"); return; }
    setMsg("Password updated. Redirecting to dashboard...");
    setTimeout(()=> {
      if(role === 'PATIENT') nav('/dashboard/patient');
      else if(role === 'DOCTOR') nav('/dashboard/doctor');
      else if(role === 'ADMIN') nav('/admin');
      else nav('/');
    },700);
  }

  return (
    <div className="container">
      <div style={{maxWidth:640, marginTop:24}}>
        <h1>Update Password (first login)</h1>
        <p className="muted">Enter your temporary/current password and choose a new one.</p>
        <form onSubmit={submit} style={{marginTop:12}}>
          <div style={{marginBottom:8}}>
            <label>User Id (mock): <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="user id from email (mock)" readOnly /></label>
          </div>
          <div style={{marginBottom:8}}>
            <label>Current Password: <input type="password" value={current} onChange={e=>setCurrent(e.target.value)}/></label>
          </div>
          <div style={{marginBottom:8}}>
            <label>New Password: <input type="password" value={nw} onChange={e=>setNew(e.target.value)}/></label>
          </div>
          <div style={{marginBottom:8}}>
            <label>Confirm New Password: <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn primary" type="submit">Update password</button>
          </div>
        </form>
        {msg && <p style={{marginTop:12}}>{msg}</p>}
      </div>
    </div>
  );
}

export default UpdatePassword;
