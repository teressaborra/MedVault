import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs(){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('');
  const [status,setStatus] = useState('');

  function saveMessage(e){
    e.preventDefault();
    setStatus('');
    if(!name.trim() || !email.trim() || !message.trim()){
      setStatus('Please fill all fields.');
      return;
    }
    const msgs = JSON.parse(localStorage.getItem('mv_messages')||'[]');
    msgs.push({ id: 'm_'+Math.random().toString(36).slice(2,9), name, email, message, createdAt: new Date().toISOString() });
    localStorage.setItem('mv_messages', JSON.stringify(msgs));
    setName(''); setEmail(''); setMessage('');
    setStatus('Message sent. We will reply shortly.');
  }

  return (
    <div className="contact-page container">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p className="muted">We’d love to hear from you. Send us a message and we’ll get back shortly.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info card">
          <h3>Contact Details</h3>
          <div className="info-row"><strong>Address</strong><div>4671 Sugar Camp Road, Owatonna, Minnesota</div></div>
          <div className="info-row"><strong>Phone</strong><div>561-456-2321</div></div>
          <div className="info-row"><strong>Email</strong><div>example@email.com</div></div>
        </div>

        <form className="contact-form card" onSubmit={saveMessage}>
          <h3>Send Message</h3>
          {status && <div className={status.startsWith('Message')? 'alert success':'alert error'}>{status}</div>}
          <label>Full Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" />
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          <label>Type your Message..</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6} placeholder="How can we help?" />
          <div className="form-actions">
            <button type="submit" className="btn primary">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;
