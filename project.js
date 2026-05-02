// ════════════════════════════════════════════════════════════════════
// LOCATHINGS - Lost and Found Management System
// Main JavaScript File - Organized by Functionality
// ════════════════════════════════════════════════════════════════════

// ════════════════ DATA STORE ════════════════════════════════════════
const STORE = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch (e) { return null } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)) }
};

let items = STORE.get('lct_items') || [];
let users = STORE.get('lct_users') || [];
let currentUser = null;
let activeTab = 'all';
let activeDetailId = null;

// Save data to localStorage
function save() {
  STORE.set('lct_items', items);
  STORE.set('lct_users', users);
}

// Seed default data on first load
(function () {
  if (!users.length) {
    users = [
      {
        id: 'u001',
        fn: 'Admin',
        ln: 'User',
        username: 'admin',
        email: 'admin@gordon.edu.ph',
        password: 'admin123',
        role: 'admin',
        joined: new Date().toISOString().slice(0, 10)
      },
      {
        id: 'u002',
        fn: 'Juan',
        ln: 'Dela Cruz',
        username: 'student',
        email: 'student@gordon.edu.ph',
        password: 'student123',
        role: 'user',
        joined: new Date().toISOString().slice(0, 10)
      }
    ];
    save();
  }
  if (!items.length) {
    items = [
      {
        id: 'LCT-1001',
        type: 'lost',
        name: 'Black Wallet',
        category: 'Wallets / IDs',
        desc: 'Leather wallet with driver license and credit cards',
        location: 'Library - 3rd Floor',
        date: '2026-04-15',
        reporter: 'John Smith',
        reporterId: 'u002',
        status: 'active'
      },
      {
        id: 'LCT-1002',
        type: 'found',
        name: 'Apple AirPods',
        category: 'Electronics',
        desc: 'White Apple AirPods Pro in charging case',
        location: 'Canteen',
        date: '2026-04-16',
        reporter: 'Maria Garcia',
        reporterId: 'u002',
        status: 'active'
      },
      {
        id: 'LCT-1003',
        type: 'lost',
        name: 'Blue Backpack',
        category: 'Bags',
        desc: 'Navy blue backpack with laptop compartment',
        location: 'Entrance',
        date: '2026-04-14',
        reporter: 'Alex Johnson',
        reporterId: 'u002',
        status: 'active'
      },
      {
        id: 'LCT-1004',
        type: 'found',
        name: 'Physics Textbook',
        category: 'Books / Notes',
        desc: 'University Physics 2nd Edition - has name inside',
        location: 'Library',
        date: '2026-04-16',
        reporter: 'Prof. David Lee',
        reporterId: 'u002',
        status: 'active'
      },
      {
        id: 'LCT-1005',
        type: 'lost',
        name: 'Gold Ring',
        category: 'Jewelry',
        desc: 'Gold engagement ring with diamond',
        location: 'Library - Locker Area',
        date: '2026-04-10',
        reporter: 'Emma Wilson',
        reporterId: 'u002',
        status: 'claimed'
      }
    ];
    save();
  }
})();

// ════════════════ NAVIGATION ════════════════════════════════════════
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'dashboard') refreshDashboard();
  if (id === 'admin') refreshAdmin();
}

function toggleAuth(mode) {
  document.getElementById('loginBox').style.display = mode === 'login' ? '' : 'none';
  document.getElementById('signupBox').style.display = mode === 'signup' ? '' : 'none';
  document.getElementById('forgotBox').style.display = mode === 'forgot' ? '' : 'none';
}

// ════════════════ PASSWORD VISIBILITY ════════════════════════════════
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const btn = event.target;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// ════════════════ AUTHENTICATION ════════════════════════════════════
function handleLogin() {
  const u = v('loginUser'), p = v('loginPass');
  if (!u || !p) { showErr('loginErr', 'Please fill in all fields!'); return; }
  const user = users.find(x => x.username === u && x.password === p);
  if (!user) { showErr('loginErr', 'Invalid username or password!'); return; }
  clearErr('loginErr');
  currentUser = user;
  updateProfileUI();
  if (user.role === 'admin') goTo('admin');
  else goTo('dashboard');
}

function handleSignup() {
  const fn = v('signupFN'), ln = v('signupLN'), un = v('signupUser'), em = v('signupEmail'), 
        p = v('signupPass'), p2 = v('signupPass2');
  if (!fn || !ln || !un || !p || !p2) { showErr('signupErr', 'All required fields must be filled!'); return; }
  if (un.length < 3) { showErr('signupErr', 'Username must be at least 3 characters!'); return; }
  if (p.length < 5) { showErr('signupErr', 'Password must be at least 5 characters!'); return; }
  if (p !== p2) { showErr('signupErr', 'Passwords do not match!'); return; }
  if (users.find(x => x.username === un)) { showErr('signupErr', 'Username already exists!'); return; }
  users.push({
    id: 'u' + Date.now(),
    fn,
    ln,
    username: un,
    email: em,
    password: p,
    role: 'user',
    joined: new Date().toISOString().slice(0, 10)
  });
  save();
  clearErr('signupErr');
  toast('✅', 'Account created! You can now login.');
  toggleAuth('login');
}

function handleReset() {
  const un = v('resetUser'), p = v('resetPass'), p2 = v('resetPass2');
  if (!un || !p || !p2) { showErr('resetErr', 'All fields are required!'); return; }
  const user = users.find(x => x.username === un);
  if (!user) { showErr('resetErr', 'Username not found!'); return; }
  if (p !== p2) { showErr('resetErr', 'Passwords do not match!'); return; }
  user.password = p;
  save();
  toast('✅', 'Password reset successfully!');
  toggleAuth('login');
}

function doLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  currentUser = null;
  closeProfile();
  goTo('auth');
  toggleAuth('login');
  toast('👋', 'Logged out successfully!');
}

function updateProfileUI() {
  if (!currentUser) return;
  const init = (currentUser.fn[0] + (currentUser.ln[0] || '')).toUpperCase();
  document.getElementById('profileBtn').textContent = init;
  document.getElementById('profAvatar').textContent = init;
  document.getElementById('profName').textContent = currentUser.fn + ' ' + currentUser.ln;
  document.getElementById('profDate').textContent = currentUser.joined || '--';
  const r = document.getElementById('profRole');
  r.textContent = currentUser.role;
  r.className = 'badge ' + (currentUser.role === 'admin' ? 'badge-admin' : 'badge-user');
  document.getElementById('settingName').value = currentUser.fn + ' ' + currentUser.ln;
  document.getElementById('settingEmail').value = currentUser.email || '';
}

function saveSettings() {
  const name = v('settingName').split(' ');
  currentUser.fn = name[0] || currentUser.fn;
  currentUser.ln = name.slice(1).join(' ') || currentUser.ln;
  currentUser.email = v('settingEmail') || currentUser.email;
  const np = v('settingPass');
  if (np) {
    if (np.length < 5) { toast('❌', 'Password must be at least 5 chars!'); return; }
    currentUser.password = np;
  }
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) users[idx] = { ...users[idx], ...currentUser };
  save();
  updateProfileUI();
  toast('✅', 'Settings saved!');
}

// ════════════════ PROFILE PANEL ════════════════════════════════════
function openProfile() {
  document.getElementById('profileOverlay').classList.add('open');
  refreshProfileData();
}

function closeProfile(e) {
  if (!e || e.target === document.getElementById('profileOverlay'))
    document.getElementById('profileOverlay').classList.remove('open');
}

function switchProfTab(tab, el) {
  document.querySelectorAll('.profile-nav .profile-nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  ['overview', 'reports', 'claimed', 'notifications', 'settings'].forEach(t => {
    const el = document.getElementById('profTab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  refreshProfileData();
}

function refreshProfileData() {
  if (!currentUser) return;
  const myItems = items.filter(i => i.reporterId === currentUser.id);
  const myClaimed = items.filter(i => i.status === 'claimed' && i.reporterId === currentUser.id);
  
  document.getElementById('myReported').textContent = myItems.length;
  document.getElementById('myClaimed').textContent = myClaimed.length;
  document.getElementById('myPending').textContent = myItems.filter(i => i.status === 'active').length;

  // Activity
  const actEl = document.getElementById('myActivity');
  if (myItems.length === 0) {
    actEl.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px;">No activity yet.</div>';
    return;
  }
  actEl.innerHTML = myItems.slice(0, 5).map(i => `
    <div class="activity-item">
      <div class="activity-dot ${i.status === 'claimed' ? 'claimed' : i.type}"></div>
      <div class="activity-text">${i.name} <span class="badge badge-${i.type}" style="font-size:10px">${i.type.toUpperCase()}</span></div>
      <div class="activity-date">${i.date}</div>
    </div>`).join('');

  // My reports table
  document.getElementById('myReportsBody').innerHTML = myItems.length ? myItems.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.name}</td>
      <td><span class="badge badge-${i.type}">${i.type.toUpperCase()}</span></td>
      <td><span class="badge badge-${i.status === 'claimed' ? 'claimed' : i.type}">${i.status.toUpperCase()}</span></td>
    </tr>`).join('') : '<tr><td colspan="4" class="empty-row">No reports yet.</td></tr>';

  // Claimed table
  document.getElementById('myClaimedBody').innerHTML = myClaimed.length ? myClaimed.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.name}</td>
      <td>${i.date}</td>
    </tr>`).join('') : '<tr><td colspan="3" class="empty-row">No claimed items yet.</td></tr>';

  // Notifications
  const notifs = myItems.filter(i => i.status === 'claimed');
  document.getElementById('notifList').innerHTML = notifs.length ? notifs.map(i => `
    <div class="activity-item">
      <div class="activity-dot claimed"></div>
      <div class="activity-text">Your report <b>${i.id}</b> (${i.name}) has been marked as claimed.</div>
    </div>`).join('') : '<div style="color:var(--muted);font-size:13px;padding:12px;">No notifications.</div>';
}

// ════════════════ DASHBOARD ════════════════════════════════════════
function setTab(tab, el) {
  activeTab = tab;
  document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTable();
}

function refreshDashboard() {
  const lost = items.filter(i => i.type === 'lost').length;
  const found = items.filter(i => i.type === 'found').length;
  document.getElementById('sTotalRep').textContent = items.length;
  document.getElementById('sLostCount').textContent = lost;
  document.getElementById('sFoundCount').textContent = found;
  renderTable();
}

function renderTable() {
  const q = (v('searchQ') || '').toLowerCase();
  const cat = v('searchCat');
  const tbody = document.getElementById('itemTableBody');
  let filtered = items.filter(i => {
    const mTab = activeTab === 'all' || i.type === activeTab;
    const mQ = !q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q);
    const mC = !cat || i.category === cat;
    return mTab && mQ && mC;
  });
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No items found.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(i => `<tr>
    <td style="font-family:monospace;font-size:12px">${i.id}</td>
    <td><b>${i.name}</b></td>
    <td>${i.category}</td>
    <td><span class="badge badge-${i.type}">${i.type.toUpperCase()}</span></td>
    <td>${i.location}</td>
    <td>${i.date}</td>
    <td><span class="badge badge-${i.status === 'claimed' ? 'claimed' : i.type}">${i.status.toUpperCase()}</span></td>
    <td><button class="view-btn" onclick="openDetail('${i.id}')">View</button></td>
  </tr>`).join('');
}

// ════════════════ REPORT MODAL ════════════════════════════════════
function openReportModal(type) {
  if (!currentUser) { toast('❌', 'Please login first!'); goTo('auth'); return; }
  document.getElementById('fType').value = type;
  document.getElementById('reportModalTitle').textContent = type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item';
  document.getElementById('reportForm').style.display = '';
  document.getElementById('reportConfirm').classList.remove('show');
  document.getElementById('fName').value = '';
  document.getElementById('fDesc').value = '';
  document.getElementById('fLoc').value = '';
  document.getElementById('fCat').value = '';
  document.getElementById('fDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('fReporter').value = currentUser ? currentUser.fn + ' ' + currentUser.ln : '';
  clearErr('reportErr');
  openModal('reportModal');
}

function submitReport() {
  const type = document.getElementById('fType').value;
  const name = v('fName'), cat = v('fCat'), desc = v('fDesc'), loc = v('fLoc'), date = v('fDate'), rep = v('fReporter');
  if (!name || !cat || !desc || !loc || !date || !rep) {
    showErr('reportErr', 'Please fill in all required fields!');
    return;
  }
  const id = 'LCT-' + Math.floor(1000 + Math.random() * 9000);
  items.unshift({
    id,
    type,
    name,
    category: cat,
    desc,
    location: loc,
    date,
    reporter: rep,
    reporterId: currentUser?.id || 'guest',
    status: 'active'
  });
  save();
  document.getElementById('reportIdDisplay').textContent = id;
  document.getElementById('reportForm').style.display = 'none';
  document.getElementById('reportConfirm').classList.add('show');
  refreshDashboard();
  if (document.getElementById('admin').classList.contains('active')) refreshAdmin();
}

// ════════════════ DETAIL MODAL ════════════════════════════════════
function openDetail(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  activeDetailId = id;
  const rows = document.getElementById('detailRows');
  rows.innerHTML = `
    <div class="drow"><span class="dk">Report ID</span><span class="dv" style="font-family:monospace">${item.id}</span></div>
    <div class="drow"><span class="dk">Item Name</span><span class="dv"><b>${item.name}</b></span></div>
    <div class="drow"><span class="dk">Type</span><span class="dv"><span class="badge badge-${item.type}">${item.type.toUpperCase()}</span></span></div>
    <div class="drow"><span class="dk">Category</span><span class="dv">${item.category}</span></div>
    <div class="drow"><span class="dk">Description</span><span class="dv">${item.desc}</span></div>
    <div class="drow"><span class="dk">Location</span><span class="dv">📍 ${item.location}</span></div>
    <div class="drow"><span class="dk">Date</span><span class="dv">📅 ${item.date}</span></div>
    <div class="drow"><span class="dk">Reported by</span><span class="dv">${item.reporter}</span></div>
    <div class="drow"><span class="dk">Status</span><span class="dv"><span class="badge badge-${item.status === 'claimed' ? 'claimed' : item.type}">${item.status.toUpperCase()}</span></span></div>`;
  const actions = document.getElementById('detailActions');
  const isAdmin = currentUser?.role === 'admin';
  actions.innerHTML = `<button class="btn btn-ghost" onclick="closeModal('detailModal')">Close</button>`;
  if (isAdmin && item.status !== 'claimed') {
    actions.innerHTML += `<button class="btn btn-primary" onclick="claimItem('${id}')">✅ Mark as Claimed</button>`;
  }
  openModal('detailModal');
}

function claimItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  if (!confirm('Mark this item as claimed?')) return;
  item.status = 'claimed';
  save();
  closeModal('detailModal');
  refreshDashboard();
  refreshAdmin();
  toast('✅', 'Item marked as claimed!');
}

// ════════════════ ADMIN PORTAL ════════════════════════════════════
function adminNav(section, el) {
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById(section).classList.add('active');
  refreshAdmin();
}

function refreshAdmin() {
  const lost = items.filter(i => i.type === 'lost').length;
  const found = items.filter(i => i.type === 'found').length;
  document.getElementById('a-total').textContent = items.length;
  document.getElementById('a-lost').textContent = lost;
  document.getElementById('a-found').textContent = found;
  document.getElementById('a-users').textContent = users.length;
  document.getElementById('userCount').textContent = users.length;
  
  // Recent items
  const rb = document.getElementById('adminRecentBody');
  const recent = items.slice(0, 10);
  rb.innerHTML = recent.map(i => `<tr>
    <td style="font-family:monospace;font-size:12px">${i.id}</td>
    <td><b>${i.name}</b></td><td>${i.category}</td>
    <td><span class="badge badge-${i.type}">${i.type.toUpperCase()}</span></td>
    <td>${i.location}</td><td>${i.date}</td>
    <td><span class="badge badge-${i.status === 'claimed' ? 'claimed' : i.type}">${i.status.toUpperCase()}</span></td>
    <td><button class="view-btn" onclick="openDetail('${i.id}')">View</button></td>
  </tr>`).join('');
  
  renderAdminItems();
  renderAdminUsers();
  renderAdminClaims();
}

function renderAdminItems() {
  const q = (document.getElementById('adminSearchQ')?.value || '').toLowerCase();
  const ft = document.getElementById('adminFilterType')?.value || '';
  const fs = document.getElementById('adminFilterStatus')?.value || '';
  const filtered = items.filter(i => {
    const mQ = !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
    const mT = !ft || i.type === ft;
    const mS = !fs || i.status === fs;
    return mQ && mT && mS;
  });
  document.getElementById('adminItemsBody').innerHTML = filtered.map(i => `<tr>
    <td style="font-family:monospace;font-size:12px">${i.id}</td>
    <td><b>${i.name}</b></td><td>${i.category}</td>
    <td><span class="badge badge-${i.type}">${i.type.toUpperCase()}</span></td>
    <td>${i.reporter}</td><td>${i.location}</td><td>${i.date}</td>
    <td><span class="badge badge-${i.status === 'claimed' ? 'claimed' : i.type}">${i.status.toUpperCase()}</span></td>
    <td style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="view-btn" onclick="openDetail('${i.id}')">View</button>
      ${i.status !== 'claimed' ? `<button class="approve-btn" onclick="claimItem('${i.id}')">Claim</button>` : ''}
      <button class="delete-btn" onclick="deleteItem('${i.id}')">Delete</button>
    </td>
  </tr>`).join('');
}

function deleteItem(id) {
  if (!confirm('Delete this item permanently?')) return;
  items = items.filter(i => i.id !== id);
  save();
  refreshAdmin();
  toast('🗑', 'Item deleted.');
}

function renderAdminUsers() {
  document.getElementById('adminUsersBody').innerHTML = users.map((u, i) => `<tr>
    <td>${i + 1}</td>
    <td><b>${u.fn} ${u.ln}</b></td>
    <td>${u.username}</td>
    <td>${u.email || '--'}</td>
    <td><span class="badge badge-${u.role}">${u.role.toUpperCase()}</span></td>
    <td>${u.joined || '--'}</td>
    <td><button class="delete-btn" onclick="deleteUser('${u.id}')">Delete</button></td>
  </tr>`).join('');
}

function deleteUser(id) {
  if (id === currentUser?.id) { toast('❌', 'Cannot delete yourself!'); return; }
  if (!confirm('Delete this user?')) return;
  users = users.filter(u => u.id !== id);
  save();
  refreshAdmin();
  toast('🗑', 'User deleted.');
}

function renderAdminClaims() {
  const claimed = items.filter(i => i.status === 'claimed');
  document.getElementById('adminClaimsBody').innerHTML = claimed.length ? claimed.map(i => `<tr>
    <td style="font-family:monospace;font-size:12px">${i.id}</td>
    <td><b>${i.name}</b></td>
    <td><span class="badge badge-${i.type}">${i.type.toUpperCase()}</span></td>
    <td>${i.reporter}</td>
    <td><span class="badge badge-claimed">CLAIMED</span></td>
    <td><button class="view-btn" onclick="openDetail('${i.id}')">View</button></td>
  </tr>`).join('') : '<tr><td colspan="6" class="empty-row">No claimed items yet.</td></tr>';
}

// ════════════════ MODAL HELPERS ════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ════════════════ TOAST NOTIFICATIONS ════════════════════════════════
let toastTimer;

function toast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ════════════════ UTILITY FUNCTIONS ════════════════════════════════
function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
  }
}

function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
