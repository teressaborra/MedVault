// Simple mock backend using localStorage to simulate users and admin actions.
const STORAGE_KEY = "mv_users_v1";

function nowISO(){ return new Date().toISOString(); }

function load(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }catch(e){ return []; }
}

function save(users){ localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }

function ensureRoleExists(){
  const users = load();
  // ensure there's an admin user for testing
  if(!users.find(u=>u.role==="ADMIN")){
    users.push({
      id: "u_admin",
      name: "Site Admin",
      email: "admin@medvault.test",
      password: "adminpass",
      role: "ADMIN",
      status: "APPROVED",
      isApproved: true,
      firstLoginRequired: false,
      createdAt: nowISO()
    });
    save(users);
  }
}

function genId(){ return "u_" + Math.random().toString(36).slice(2,9); }

function genPassword(){
  return Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,6);
}

export async function signup({name,email,role,password}){
  const users = load();
  if(users.find(u => u.email === email)){
    return { success:false, message: "Email already registered." };
  }
  const id = genId();
  users.push({ id, name, email, role: role.toUpperCase(), password: password || null, status: "PENDING", isApproved:false, firstLoginRequired:false, createdAt: nowISO() });
  save(users);
  return { success:true, message: "Registration received. Your account is pending admin approval." };
}

export async function login({email,password,role}){
  ensureRoleExists();
  const users = load();
  const u = users.find(x=>x.email===email && x.role=== (role? role.toUpperCase(): x.role));
  if(!u) return { success:false, message: "Invalid credentials." };
  if(u.status !== "APPROVED" || !u.isApproved) return { success:false, message: `Account is ${u.status || 'PENDING'}. Contact admin.` };
  if(u.password !== password) return { success:false, message: "Invalid credentials." };
  // simulate first login check
  if(u.firstLoginRequired){ return { success:true, firstLoginRequired:true, message: "First login requires password update.", name: u.name, userId:u.id }; }
  return { success:true, message: "Login successful.", name: u.name, userId:u.id };
}

export async function adminList(role){ ensureRoleExists(); const users = load(); return users.filter(u=>u.role===role.toUpperCase()); }

export async function adminApprove(userId){
  const users = load();
  const u = users.find(x=>x.id===userId);
  if(!u) return { success:false };
  const pwd = genPassword();
  u.password = pwd; // plaintext only for mock
  u.status = "APPROVED";
  u.isApproved = true;
  u.firstLoginRequired = true;
  save(users);
  // simulate email send by returning password
  return { success:true, password: pwd, email: u.email, name: u.name };
}

export async function adminReject(userId){
  const users = load();
  const u = users.find(x=>x.id===userId);
  if(!u) return { success:false };
  u.status = "REJECTED";
  u.isApproved = false;
  save(users);
  return { success:true };
}

export async function seedMock(){
  // create example pending users for quick testing
  const users = load();
  const samples = [
    { id: genId(), name: 'Alice Johnson', email: 'alice.j@test.com', role: 'PATIENT', status: 'PENDING', isApproved:false, firstLoginRequired:false, createdAt: nowISO() },
    { id: genId(), name: 'Bob Miller', email: 'bob.m@test.com', role: 'PATIENT', status: 'PENDING', isApproved:false, firstLoginRequired:false, createdAt: nowISO() },
    { id: genId(), name: 'Dr. Caroline Ray', email: 'caroline.r@test.com', role: 'DOCTOR', status: 'PENDING', isApproved:false, firstLoginRequired:false, createdAt: nowISO() },
    { id: genId(), name: 'Dr. David Park', email: 'david.p@test.com', role: 'DOCTOR', status: 'PENDING', isApproved:false, firstLoginRequired:false, createdAt: nowISO() }
  ];
  // preserve existing admin if present, but add samples
  const merged = users.concat(samples);
  save(merged);
  return merged;
}

export async function updatePassword({userId,currentPassword,newPassword}){
  const users = load();
  const u = users.find(x=>x.id===userId);
  if(!u) return { success:false, message: "User not found." };
  if(u.password !== currentPassword) return { success:false, message: "Current password incorrect." };
  if(currentPassword === newPassword) return { success:false, message: "New password must not equal current password." };
  u.password = newPassword;
  u.firstLoginRequired = false;
  save(users);
  return { success:true };
}

// expose helper for dev
export function resetMock(){ localStorage.removeItem(STORAGE_KEY); }

export default { signup, login, adminList, adminApprove, adminReject, updatePassword, resetMock, seedMock };
