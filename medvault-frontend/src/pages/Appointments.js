import React, { useEffect, useState } from "react";
import "./Appointments.css";

function Appointments(){
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // grouped doctor object
  const [modalDate, setModalDate] = useState(null); // date selected inside doctor modal
  const [modalMode, setModalMode] = useState('book'); // 'view' or 'book'
  const [reserving, setReserving] = useState(null); // { scheduleId, slotId, doctorUserId, doctorName, date, slotTime, expiresAt }
  const [countdown, setCountdown] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [message, setMessage] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [cityFilter, setCityFilter] = useState('Any');
  const [specialtyFilter, setSpecialtyFilter] = useState('Any');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/api/doctor/schedules/available');
        const j = await res.json();
        if (j && j.success && Array.isArray(j.data)) {
          // group schedules by doctor
          const raw = j.data;
          const grouped = {};
          raw.forEach(s => {
            const key = s.doctorUserId;
            if (!grouped[key]) grouped[key] = { doctorUserId: s.doctorUserId, doctorName: s.doctorName, specialization: s.specialization, dates: [] };
            grouped[key].dates.push({ id: s.id, date: s.date, slots: s.slots || [] });
          });
                setAvailable(Object.values(grouped));
        } else {
          setAvailable([]);
        }
      } catch (e) {
        console.error('Error fetching available schedules, falling back to client storage', e);
        // fallback to localStorage
        const all = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
        // filter only those with active slots
        const out = [];
        all.forEach(s => {
          const active = (s.slots || []).filter(sl => sl.active);
          if (active.length) out.push({ id: s.scheduleId || null, doctorUserId: s.doctorId, doctorName: s.doctorName, specialization: s.specialization, date: s.date, slots: active });
        });
        // group out by doctor
        const grouped = {};
        out.forEach(s => {
          const key = s.doctorUserId;
          if (!grouped[key]) grouped[key] = { doctorUserId: s.doctorUserId, doctorName: s.doctorName, specialization: s.specialization, dates: [] };
          grouped[key].dates.push({ id: s.id, date: s.date, slots: s.slots });
        });
        setAvailable(Object.values(grouped));
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) { setDoctorProfile(null); return; }
    (async () => {
      try {
        const r = await fetch(`http://localhost:8080/api/doctor/profile/${selectedDoctor.doctorUserId}`);
        const j = await r.json();
        // support both shapes: { success:true, data: {...} } and direct Doctor object
        if (!j) { setDoctorProfile(null); return; }
        if (j.success && j.data) {
          setDoctorProfile(j.data);
        } else if (j.fullName || j.consultationFee || j.mobileNumber || j.clinicHospitalName) {
          // direct entity returned
          setDoctorProfile(j);
        } else {
          setDoctorProfile(null);
        }
      } catch (e) { /* ignore */ }
    })();
  }, [selectedDoctor]);

  // derive specialty & city lists for filters
  const specialties = Array.from(new Set((available || []).flatMap(d => d.specialization ? [d.specialization] : [])));
  const cities = ['Any','Bangalore','Chennai','Mumbai','Delhi'];

  const filteredAvailable = (available || []).filter(doc => {
    const q = searchQuery.trim().toLowerCase();
    if (specialtyFilter !== 'Any' && (doc.specialization || '').toLowerCase() !== specialtyFilter.toLowerCase()) return false;
    if (cityFilter !== 'Any') {
      // simple city filter currently not present per-doctor, so skip unless backend provides it
    }
    if (q) {
      if (!((doc.doctorName||'').toLowerCase().includes(q) || (doc.specialization||'').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const handleBook = (doctorUserId, doctorName, date, slot, scheduleId) => {
    // Start reservation flow: call reserve endpoint and show countdown + confirm
    (async () => {
      const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
      const patientId = cur?.userId || null;
      if (!scheduleId) scheduleId = null;
      // call reserve endpoint
      try {
        const ttl = 300; // 5 minutes
        const res = await fetch(`http://localhost:8080/api/appointments/reserve/${scheduleId}/${slot.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientUserId: patientId, ttl }) });
        const j = await res.json();
        if (j && j.success) {
          const expiresAt = Date.now() + ttl * 1000;
          setReserving({ scheduleId, slotId: slot.id, doctorUserId, doctorName, date, slotTime: slot.time, expiresAt });
          setCountdown(Math.floor((expiresAt - Date.now()) / 1000));
          // ensure modal is visible so user sees reservation and can confirm
          const docObj = available.find(d => d.doctorUserId === doctorUserId) || { doctorUserId, doctorName, specialization: '' };
          setSelectedDoctor(docObj);
          setModalDate(date);
          // start local countdown
          const iv = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) { clearInterval(iv); setReserving(null); return 0; }
              return prev - 1;
            });
          }, 1000);
          setMessage('Slot reserved for 5 minutes. Complete booking to confirm.');
          return;
        } else {
          setMessage(j && j.message ? `Could not reserve: ${j.message}` : 'Could not reserve slot.');
        }
      } catch (e) {
        console.error('Reserve request failed, falling back to immediate booking', e);
      }

      // fallback to immediate booking if reserve failed
      try {
        const body = { scheduleId: scheduleId || null, slotId: slot.id, patientUserId: patientId, doctorUserId: doctorUserId, doctorName, date, slotTime: slot.time };
        const res2 = await fetch('http://localhost:8080/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j2 = await res2.json();
        if (j2 && j2.success) {
          setMessage('Appointment booked successfully');
          // refresh available from backend
          try {
            const r2 = await fetch('http://localhost:8080/api/doctor/schedules/available');
            const j3 = await r2.json();
            if (j3 && j3.success) {
              const raw = j3.data;
              const grouped = {};
              raw.forEach(s => {
                const key = s.doctorUserId;
                if (!grouped[key]) grouped[key] = { doctorUserId: s.doctorUserId, doctorName: s.doctorName, specialization: s.specialization, dates: [] };
                grouped[key].dates.push({ id: s.id, date: s.date, slots: s.slots || [] });
              });
              setAvailable(Object.values(grouped));
            }
          } catch (e) { /* ignore */ }
          setSelectedDoctor(null); setModalDate(null);
          return;
        }
      } catch (e) { /* ignore */ }
    })();
  };

  const confirmReserved = async () => {
    if (!reserving) return;
    const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
    const patientId = cur?.userId || null;
    try {
      const body = { scheduleId: reserving.scheduleId || null, slotId: reserving.slotId, patientUserId: patientId, doctorUserId: reserving.doctorUserId, doctorName: reserving.doctorName, date: reserving.date, slotTime: reserving.slotTime };
      const res = await fetch('http://localhost:8080/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await res.json();
      if (j && j.success) {
        setMessage('Booking confirmed ✅');
        // refresh available
        try {
          const r2 = await fetch('http://localhost:8080/api/doctor/schedules/available');
          const j2 = await r2.json();
          if (j2 && j2.success) {
            const raw = j2.data;
            const grouped = {};
            raw.forEach(s => {
              const key = s.doctorUserId;
              if (!grouped[key]) grouped[key] = { doctorUserId: s.doctorUserId, doctorName: s.doctorName, specialization: s.specialization, dates: [] };
              grouped[key].dates.push({ id: s.id, date: s.date, slots: s.slots || [] });
            });
            setAvailable(Object.values(grouped));
          }
        } catch (e) { }
        setReserving(null); setCountdown(0); setSelectedDoctor(null); setModalDate(null);
        return;
      } else if (j && j.message) {
        setMessage(`Booking failed: ${j.message}`);
      }
    } catch (e) {
      setMessage('Booking failed. Please try again.');
    }
    setReserving(null); setCountdown(0);
  };

    const handleQuickBook = (doctorUserId, doctorName, date, slot, scheduleId) => {
      (async () => {
        const cur = JSON.parse(localStorage.getItem('mv_current_user') || 'null');
        const patientId = cur?.userId || null;
        try {
          const body = { scheduleId: scheduleId || null, slotId: slot.id, patientUserId: patientId, doctorUserId: doctorUserId, doctorName, date, slotTime: slot.time };
          const res = await fetch('http://localhost:8080/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          const j = await res.json();
          if (j && j.success) {
            setMessage('Appointment booked successfully');
            try {
              const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
              const saved = j.data;
              appts.push({ id: saved.id || `appt_${Date.now()}`, patientUserId: saved.patientUserId || patientId, patientName: saved.patientName || cur?.name || null, doctorUserId: saved.doctorUserId || doctorUserId, doctorName: saved.doctorName || doctorName, date: saved.date || date, slotTime: saved.slotTime || slot.time, status: saved.status || 'CONFIRMED', createdAt: saved.createdAt || new Date().toISOString() });
              localStorage.setItem('mv_appointments', JSON.stringify(appts));
            } catch (e) { }
            try {
              const r2 = await fetch('http://localhost:8080/api/doctor/schedules/available');
              const j2 = await r2.json();
              if (j2 && j2.success) {
                const raw = j2.data;
                const grouped = {};
                raw.forEach(s => {
                  const key = s.doctorUserId;
                  if (!grouped[key]) grouped[key] = { doctorUserId: s.doctorUserId, doctorName: s.doctorName, specialization: s.specialization, dates: [] };
                  grouped[key].dates.push({ id: s.id, date: s.date, slots: s.slots || [] });
                });
                setAvailable(Object.values(grouped));
              }
            } catch (e) { }
            return;
          }
        } catch (e) { console.error('Quick book failed, falling back to local', e); }

        // fallback local
        try {
          const appts = JSON.parse(localStorage.getItem('mv_appointments') || '[]');
          const whenISO = `${date}T${slot.time.split('-')[0]}:00`;
          const newAppt = { id: `appt_${Date.now()}`, patientUserId: patientId || 'guest', patientName: cur?.name || null, doctorName, doctorUserId, date, slotTime: slot.time, whenISO, status: 'CONFIRMED', createdAt: new Date().toISOString() };
          appts.push(newAppt);
          localStorage.setItem('mv_appointments', JSON.stringify(appts));
          setMessage('Appointment booked (offline)');
          const allSchedules = JSON.parse(localStorage.getItem('mv_doctor_schedules') || '[]');
          const idx = allSchedules.findIndex(x => x.doctorId === doctorUserId && x.date === date);
          if (idx !== -1) {
            const sIdx = allSchedules[idx].slots.findIndex(x => x.id === slot.id);
            if (sIdx !== -1) { allSchedules[idx].slots.splice(sIdx,1); localStorage.setItem('mv_doctor_schedules', JSON.stringify(allSchedules)); }
          }
          setAvailable(prev => prev.map(doc => {
            if (doc.doctorUserId !== doctorUserId) return doc;
            return { ...doc, dates: doc.dates.map(d => d.date === date ? { ...d, slots: d.slots.filter(s=>s.id!==slot.id) } : d) };
          }));
        } catch (e) { console.error('Local fallback failed', e); }
      })();
    };
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
                <select className="select" value={cityFilter} onChange={e=>setCityFilter(e.target.value)}>
                  {['Any','Bangalore','Chennai','Mumbai','Delhi'].map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="search-mid">
                <label className="label">Search Doctors by</label>
                <input className="full-input" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder=" Condition, Doctor's name" />
              </div>

              <div className="search-mid" style={{ minWidth: 180 }}>
                <label className="label">Specialty</label>
                <select className="select" value={specialtyFilter} onChange={e=>setSpecialtyFilter(e.target.value)}>
                  <option value="Any">Any</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="search-action">
                <button className="btn primary large">Search</button>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <h3>Find top doctors near you</h3>
              <p className="muted">Trusted specialists, verified clinics and easy online booking.</p>
              <div style={{ marginTop: 12 }}>
                <button className="btn primary">Find Doctors</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="appointments-info">
          <h3>How it works</h3>
          <p className="muted">Choose a city, search for your specialist, select a convenient time slot and confirm your visit. You will receive appointment confirmation via email.</p>
        </section>
        <section style={{ marginTop: 24 }}>
          <h3>Available Doctors & Slots</h3>
          {message && <div style={{ padding: 8, background: 'rgba(16,185,129,0.06)', color: '#059669', borderRadius: 6 }}>{message}</div>}
          {loading ? (
              <div className="muted">Loading available slots…</div>
            ) : (
              <div style={{ marginTop: 12 }}>
                  {filteredAvailable.length === 0 && (
                    <div className="muted" style={{ padding: 12 }}>No available slots. Doctors must upload time slots first.</div>
                  )}
                  {filteredAvailable.length > 0 && (
                    <table className="doctors-table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Specialty</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAvailable.map((doc, i) => {
                          const totalSlots = (doc.dates || []).reduce((acc,d)=>acc + (d.slots?d.slots.length:0),0);
                          const days = (doc.dates||[]).length;
                          const next = (doc.dates||[]).slice().sort((a,b)=>a.date.localeCompare(b.date))[0]?.date || '—';
                          return (
                            <tr key={`${doc.doctorUserId}_${i}`}>
                              <td className="doctor-cell">
                                {doc.avatarUrl ? (
                                  <img className="avatar-img" src={doc.avatarUrl} alt={doc.doctorName} />
                                ) : (
                                  <div className="avatar">{(doc.doctorName || 'Dr').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div>
                                )}
                                <div style={{ marginLeft: 12 }}>
                                  <div className="doctor-name">{doc.doctorName}</div>
                                  <div className="muted doctor-spec" style={{ fontSize: 13 }}>{doc.specialization || '—'}</div>
                                </div>
                              </td>
                              <td>{doc.specialization || '—'}</td>
                                          <td style={{ textAlign: 'right' }}>
                                            <button className="btn outline" onClick={() => { setSelectedDoctor(doc); setModalMode('view'); setModalDate(null); setSelectedSlotId(null); }}>View</button>
                                            <button className="btn primary" style={{ marginLeft: 8 }} onClick={() => { const d = (doc.dates||[]).slice().sort((a,b)=>a.date.localeCompare(b.date))[0]; if (d && d.slots && d.slots.length) { setSelectedDoctor(doc); setModalMode('book'); setModalDate(d.date); setSelectedSlotId(null); } else { setSelectedDoctor(doc); setModalMode('book'); setModalDate(null); setSelectedSlotId(null); } }}>Quick Book</button>
                                          </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
            )}
        </section>
        {selectedDoctor && (
          <div className="modal-overlay" onClick={() => { setSelectedDoctor(null); setModalDate(null); }}>
            <div className="modal-popup" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
              <h3 style={{ marginTop: 0 }}>{selectedDoctor.doctorName}</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div className="muted">{selectedDoctor.specialization}</div>
                {doctorProfile && (
                  <div className="muted" style={{ fontSize: 13 }}>
                    {doctorProfile.city ? `${doctorProfile.city}` : ''}{doctorProfile.consultationFee ? ` • Fee: ₹${doctorProfile.consultationFee}` : ''}
                  </div>
                )}
              </div>

              {modalMode === 'view' ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 999, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{(selectedDoctor.doctorName||'Dr').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{doctorProfile?.fullName || selectedDoctor.doctorName}</div>
                      <div className="muted">{selectedDoctor.specialization || doctorProfile?.specialization || '—'}</div>
                      {doctorProfile?.clinicName && <div className="muted" style={{ marginTop: 6 }}>{doctorProfile.clinicName}</div>}
                    </div>
                  </div>

                  {(() => {
                    const profile = doctorProfile || {};
                    const fields = [
                      { label: 'Name', value: profile.fullName || selectedDoctor.doctorName || '—' },
                      { label: 'Qualification', value: profile.qualification || profile.qualificationName || '—' },
                      { label: 'Clinic', value: profile.clinicHospitalName || profile.clinic || '—' },
                      { label: 'City', value: profile.city || selectedDoctor.city || '—' },
                      { label: 'Fees', value: profile.consultationFee ? `₹${profile.consultationFee}` : '—' },
                      { label: 'Contact', value: profile.mobileNumber || profile.mobile || profile.alternatePhone || '—' },
                      { label: 'Address', value: profile.address || selectedDoctor.address || '—' }
                    ];

                    return (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {fields.map(f => (
                          <div key={f.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 140, color: 'var(--muted)', fontWeight: 600 }}>{f.label}</div>
                            <div className="muted">{f.value}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : null}

              {modalMode === 'book' && (
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ minWidth: 220 }}>
                    <h4 style={{ marginBottom: 8 }}>Dates</h4>
                    <div style={{ display: 'grid', gap: 8, maxHeight: 300, overflow: 'auto' }}>
                      {(selectedDoctor.dates || []).sort((a,b)=>a.date.localeCompare(b.date)).map(d => (
                        <button key={d.date} className={modalDate === d.date ? 'btn primary' : 'btn outline'} onClick={() => setModalDate(d.date)} style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700 }}>{d.date}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{(d.slots||[]).length} slots</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: 8 }}>Available Slots{modalDate ? ` — ${modalDate}` : ''}</h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {!modalDate && <div className="muted">Select a date to view slots</div>}
                      {modalDate && (() => {
                        const dd = (selectedDoctor.dates || []).find(x => x.date === modalDate) || { slots: [] };
                        if ((dd.slots || []).length === 0) return <div className="muted">No active slots available for this date.</div>;
                        return (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {(dd.slots || []).map(slot => {
                              const schedId = (selectedDoctor.dates||[]).find(x=>x.date===modalDate)?.id;
                              const isReserved = reserving && reserving.slotId === slot.id && reserving.date === modalDate && reserving.doctorUserId === selectedDoctor.doctorUserId;
                                    return isReserved ? (
                                <div key={slot.id} style={{ minWidth: 160, padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                  <div style={{ fontWeight: 700 }}>{slot.time} — Reserved</div>
                                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Expires in {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}</div>
                                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                    <button className="btn primary" onClick={confirmReserved}>Confirm Booking</button>
                                    <button className="btn outline" onClick={() => { setReserving(null); setCountdown(0); }}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button key={slot.id} className={"slot-chip" + (selectedSlotId === slot.id ? ' selected' : '')} onClick={() => { setSelectedSlotId(slot.id); }}>
                                  <div style={{ fontWeight: 700 }}>{slot.time}</div>
                                  <div className="muted" style={{ fontSize: 12 }}>{selectedSlotId === slot.id ? 'Selected' : 'Select'}</div>
                                </button>
                              );
                            })}
                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                              {selectedSlotId && (
                                <button className="btn primary" onClick={() => {
                                  const schedId2 = (selectedDoctor.dates||[]).find(x=>x.date===modalDate)?.id;
                                  const dd2 = (selectedDoctor.dates || []).find(x => x.date === modalDate) || { slots: [] };
                                  const slotObj = (dd2.slots || []).find(s => s.id === selectedSlotId);
                                  if (slotObj) handleQuickBook(selectedDoctor.doctorUserId, selectedDoctor.doctorName, modalDate, slotObj, schedId2);
                                }}>Book Now</button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn outline" onClick={() => { setSelectedDoctor(null); setModalDate(null); }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Appointments;
