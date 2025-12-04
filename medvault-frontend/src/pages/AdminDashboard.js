import React, { useEffect, useState } from "react";
import axios from "axios";
import mock from "../api/mockBackend";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function UsersList({role, reloadKey}){
  const [list,setList] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    async function fetchList(){
      setLoading(true);
      // Try backend first
      try{
        const res = await axios.get(`http://localhost:8080/api/admin/users?role=${encodeURIComponent(role)}`);
        if(!mounted) return;
        if(res.data && Array.isArray(res.data)){
          setList(res.data);
          setLoading(false);
          return;
        }
        // If backend returns an object with { success, users }
        if(res.data && res.data.users) {
          setList(res.data.users);
          setLoading(false);
          return;
        }
      }catch(err){
        // backend not available or error - fall back to mock
        try{
          const m = await mock.adminList(role);
          if(!mounted) return;
          setList(m);
          setLoading(false);
          return;
        }catch(e){
          console.error('admin list error', e);
        }
      }
      if(mounted) setLoading(false);
    }
    fetchList();
    return ()=> mounted=false;
  },[role, reloadKey]);

  async function approve(id){
    // try backend approve
    try{
      const res = await axios.post(`http://localhost:8080/api/admin/users/${id}/approve`);
      if(res.data && res.data.success){
        const pwd = res.data.password;
        const email = res.data.email || '';
        alert(`Approved ${email}. Temp password: ${pwd}`);
        setList(list.map(u=> u.id===id? {...u, status:'APPROVED'}:u));
        return;
      }
    }catch(err){
      // fallback to mock
      try{
        const r = await mock.adminApprove(id);
        if(r.success){
          alert(`Approved ${r.email}. Temp password: ${r.password} (copy it)`);
          setList(list.map(u=> u.id===id? {...u, status:'APPROVED'}:u));
          return;
        }
      }catch(e){ console.error(e); }
    }
  }

  async function reject(id){
    try{
      const res = await axios.post(`http://localhost:8080/api/admin/users/${id}/reject`);
      if(res.data && res.data.success){
        setList(list.map(u=> u.id===id? {...u, status:'REJECTED'}:u));
        return;
      }
    }catch(err){
      try{
        const r = await mock.adminReject(id);
        if(r.success) setList(list.map(u=> u.id===id? {...u, status:'REJECTED'}:u));
      }catch(e){ console.error(e); }
    }
  }

  if(loading) return <p>Loading...</p>;

  return (
    <div className="admin-cards">
      {list.length===0 && <div className="muted">No users found for this role.</div>}
      <div className="cards-grid">
        {list.map(u=> (
          <div className="user-card card" key={u.id}>
            <div className="user-top">
              <div className="user-avatar">{(u.name||'').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
              <div className="user-meta">
                <div className="user-name">{u.name}</div>
                <div className="user-email muted small">{u.email}</div>
                <div className="user-created muted small">{new Date(u.createdAt).toLocaleString()}</div>
              </div>
              <div className="user-badges">
                <div className={`role-badge`}>{u.role}</div>
                <div className={`status-pill status-${u.status.toLowerCase()}`}>{u.status}</div>
              </div>
            </div>

            <div className="user-actions">
              {u.status==='PENDING' ? (
                <>
                  <button className="btn primary" onClick={()=>approve(u.id)}>Approve</button>
                  <button className="btn outline" onClick={()=>reject(u.id)}>Reject</button>
                </>
              ) : (
                <div className="muted">No actions available</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard(){
  const [tab,setTab] = useState('PATIENT');
  const [reloadKey, setReloadKey] = useState(0);

  async function seedSample(){
    try{
      await mock.resetMock();
    }catch(e){}
    try{ await mock.seedMock(); }catch(e){ console.error('seed err', e); }
    setReloadKey(k=>k+1);
  }
  return (
    <div className="admin-wrap container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="muted">Manage patient & doctor registrations</p>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav>
            <button className={tab==='PATIENT'? 'active': ''} onClick={()=>setTab('PATIENT')}>Patients</button>
            <button className={tab==='DOCTOR'? 'active': ''} onClick={()=>setTab('DOCTOR')}>Doctors</button>
            <Link to="/">Back to site</Link>
          </nav>
        </aside>

        <main className="admin-main">
          <UsersList role={tab} reloadKey={reloadKey} />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
