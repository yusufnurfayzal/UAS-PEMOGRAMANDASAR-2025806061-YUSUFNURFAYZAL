/* =========================================================
   ClubBoard — app.js
   Semua interaksi frontend: Fetch API, DOM Manipulation,
   Event Listener, Async/Await
   ========================================================= */

const API_BASE = '/api';

// ---------- STATE ----------
const state = {
  anggota: [],
  klub: [],
  pelatih: [],
  pendaftaran: [],
  anggotaPage: 1,
  anggotaPerPage: 5,
  anggotaSearch: '',
};

// ============================================================
// UTILITAS: Loader, Toast
// ============================================================
function showLoader() { document.getElementById('loader').classList.add('active'); }
function hideLoader() { document.getElementById('loader').classList.remove('active'); }

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ============================================================
// FETCH WRAPPER (Fetch API + Async/Await)
// ============================================================
async function apiRequest(endpoint, options = {}) {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Terjadi kesalahan pada server');
    }
    return json.data;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  } finally {
    hideLoader();
  }
}

// ============================================================
// CEK STATUS SERVER
// ============================================================
async function checkServerStatus() {
  const el = document.getElementById('serverStatus');
  const dot = el.querySelector('.pulse-dot');
  try {
    const res = await fetch(`${API_BASE}`);
    if (res.ok) {
      dot.className = 'pulse-dot ok';
      el.innerHTML = '<span class="pulse-dot ok"></span> Terhubung ke API';
    } else throw new Error();
  } catch {
    dot.className = 'pulse-dot fail';
    el.innerHTML = '<span class="pulse-dot fail"></span> API tidak terhubung';
  }
}

// ============================================================
// NAVIGASI ANTAR SECTION
// ============================================================
const titles = {
  dashboard: ['Dashboard', 'Ringkasan aktivitas klub olahraga saat ini'],
  anggota: ['Anggota', 'Kelola data anggota klub olahraga'],
  klub: ['Klub', 'Kelola daftar klub olahraga yang tersedia'],
  pelatih: ['Pelatih', 'Kelola data pelatih untuk setiap klub'],
  pendaftaran: ['Pendaftaran', 'Kelola pendaftaran anggota ke klub'],
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const section = btn.dataset.section;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${section}`).classList.add('active');

    document.getElementById('pageTitle').textContent = titles[section][0];
    document.getElementById('pageSubtitle').textContent = titles[section][1];

    loadSection(section);
  });
});

function loadSection(section) {
  if (section === 'dashboard') loadDashboard();
  if (section === 'anggota') loadAnggota();
  if (section === 'klub') loadKlub();
  if (section === 'pelatih') loadPelatih();
  if (section === 'pendaftaran') loadPendaftaran();
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
  try {
    const stats = await apiRequest('/pendaftaran/statistik');
    document.getElementById('statAnggota').textContent = stats.totalAnggota;
    document.getElementById('statKlub').textContent = stats.totalKlub;
    document.getElementById('statPelatih').textContent = stats.totalPelatih;
    document.getElementById('statPendaftaran').textContent = stats.totalPendaftaran;
    document.getElementById('statAktif').textContent = stats.totalAktif;

    const klubData = await apiRequest('/klub');
    state.klub = klubData;
    const wrap = document.getElementById('dashboardKlubList');
    wrap.innerHTML = klubData.map(k => `
      <div class="klub-preview-card">
        <h4>${escapeHtml(k.nama_klub)}</h4>
        <p>Pelatih: ${escapeHtml(k.nama_pelatih || '—')}</p>
        <p>Kuota: ${k.kuota} orang</p>
        <span class="tag">${escapeHtml(k.kategori_olahraga)}</span>
      </div>
    `).join('') || '<p class="muted">Belum ada klub terdaftar.</p>';
  } catch (e) { /* toast sudah ditampilkan */ }
}

// ============================================================
// ANGGOTA (CRUD lengkap + search + pagination)
// ============================================================
async function loadAnggota() {
  try {
    const query = state.anggotaSearch ? `?search=${encodeURIComponent(state.anggotaSearch)}` : '';
    state.anggota = await apiRequest(`/anggota${query}`);
    renderAnggotaTable();
  } catch (e) {}
}

function renderAnggotaTable() {
  const { anggota, anggotaPage, anggotaPerPage } = state;
  const totalPages = Math.max(1, Math.ceil(anggota.length / anggotaPerPage));
  state.anggotaPage = Math.min(anggotaPage, totalPages);
  const start = (state.anggotaPage - 1) * anggotaPerPage;
  const pageItems = anggota.slice(start, start + anggotaPerPage);

  const tbody = document.getElementById('tblAnggota');
  tbody.innerHTML = pageItems.map(a => `
    <tr>
      <td>${escapeHtml(a.nama)}</td>
      <td>${escapeHtml(a.email)}</td>
      <td>${escapeHtml(a.no_telp)}</td>
      <td>${formatDate(a.tanggal_lahir)}</td>
      <td>${formatDate(a.tanggal_gabung)}</td>
      <td class="action-group">
        <button class="btn btn-secondary btn-sm" onclick="openAnggotaForm(${a.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAnggota(${a.id})">Hapus</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6" class="muted" style="text-align:center;padding:26px;">Belum ada data anggota.</td></tr>`;

  const pag = document.getElementById('paginationAnggota');
  pag.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    if (i === state.anggotaPage) b.classList.add('active');
    b.addEventListener('click', () => { state.anggotaPage = i; renderAnggotaTable(); });
    pag.appendChild(b);
  }
}

let searchDebounce;
document.getElementById('searchAnggota').addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.anggotaSearch = e.target.value;
    state.anggotaPage = 1;
    loadAnggota();
  }, 350);
});

document.getElementById('btnAddAnggota').addEventListener('click', () => openAnggotaForm());

function openAnggotaForm(id = null) {
  const item = id ? state.anggota.find(a => a.id === id) : null;
  openModal(item ? 'Edit Anggota' : 'Tambah Anggota', `
    <form id="formAnggota">
      <div class="form-group">
        <label>Nama Lengkap</label>
        <input class="input" name="nama" required value="${item ? escapeAttr(item.nama) : ''}">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="input" type="email" name="email" required value="${item ? escapeAttr(item.email) : ''}">
      </div>
      <div class="form-group">
        <label>No. Telepon</label>
        <input class="input" name="no_telp" required value="${item ? escapeAttr(item.no_telp) : ''}">
      </div>
      <div class="form-group">
        <label>Tanggal Lahir</label>
        <input class="input" type="date" name="tanggal_lahir" value="${item ? formatDateInput(item.tanggal_lahir) : ''}">
      </div>
      <div class="form-group">
        <label>Alamat</label>
        <textarea name="alamat">${item ? escapeHtml(item.alamat || '') : ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="modalCancel">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('formAnggota').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (item) {
        await apiRequest(`/anggota/${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Anggota berhasil diperbarui');
      } else {
        await apiRequest('/anggota', { method: 'POST', body: JSON.stringify(data) });
        showToast('Anggota berhasil ditambahkan');
      }
      closeModal();
      loadAnggota();
    } catch (e) {}
  });
}

async function deleteAnggota(id) {
  if (!confirm('Yakin ingin menghapus anggota ini?')) return;
  try {
    await apiRequest(`/anggota/${id}`, { method: 'DELETE' });
    showToast('Anggota berhasil dihapus');
    loadAnggota();
  } catch (e) {}
}

// ============================================================
// KLUB (CRUD lengkap + search + filter kategori)
// ============================================================
async function loadKlub() {
  try {
    const search = document.getElementById('searchKlub').value;
    const kategori = document.getElementById('filterKategori').value;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (kategori) params.set('kategori', kategori);
    const query = params.toString() ? `?${params.toString()}` : '';

    state.klub = await apiRequest(`/klub${query}`);
    if (!state.pelatih.length) state.pelatih = await apiRequest('/pelatih');
    populateKategoriFilter();
    renderKlubCards();
  } catch (e) {}
}

function populateKategoriFilter() {
  const select = document.getElementById('filterKategori');
  const current = select.value;
  const kategoris = [...new Set(state.klub.map(k => k.kategori_olahraga))];
  select.innerHTML = '<option value="">Semua Kategori</option>' +
    kategoris.map(k => `<option value="${escapeAttr(k)}">${escapeHtml(k)}</option>`).join('');
  select.value = current;
}

function renderKlubCards() {
  const wrap = document.getElementById('cardKlub');
  wrap.innerHTML = state.klub.map(k => `
    <div class="klub-card">
      <h3>${escapeHtml(k.nama_klub)}</h3>
      <span class="tag">${escapeHtml(k.kategori_olahraga)}</span>
      <p class="meta">Pelatih: ${escapeHtml(k.nama_pelatih || 'Belum ditentukan')}</p>
      <p class="meta">Jadwal: ${escapeHtml(k.jadwal_latihan || '-')} · Kuota: ${k.kuota}</p>
      <p class="desc">${escapeHtml(k.deskripsi || '')}</p>
      <div class="card-footer">
        <button class="btn btn-secondary btn-sm" onclick="openKlubForm(${k.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteKlub(${k.id})">Hapus</button>
      </div>
    </div>
  `).join('') || '<p class="muted">Tidak ada klub yang cocok dengan pencarian.</p>';
}

document.getElementById('searchKlub').addEventListener('input', debounce(loadKlub, 350));
document.getElementById('filterKategori').addEventListener('change', loadKlub);
document.getElementById('btnAddKlub').addEventListener('click', () => openKlubForm());

function openKlubForm(id = null) {
  const item = id ? state.klub.find(k => k.id === id) : null;
  const pelatihOptions = state.pelatih.map(p =>
    `<option value="${p.id}" ${item && item.pelatih_id === p.id ? 'selected' : ''}>${escapeHtml(p.nama)}</option>`
  ).join('');

  openModal(item ? 'Edit Klub' : 'Tambah Klub', `
    <form id="formKlub">
      <div class="form-group">
        <label>Nama Klub</label>
        <input class="input" name="nama_klub" required value="${item ? escapeAttr(item.nama_klub) : ''}">
      </div>
      <div class="form-group">
        <label>Kategori Olahraga</label>
        <input class="input" name="kategori_olahraga" required value="${item ? escapeAttr(item.kategori_olahraga) : ''}">
      </div>
      <div class="form-group">
        <label>Pelatih</label>
        <select class="input" name="pelatih_id"><option value="">-- Pilih Pelatih --</option>${pelatihOptions}</select>
      </div>
      <div class="form-group">
        <label>Kuota</label>
        <input class="input" type="number" min="1" name="kuota" value="${item ? item.kuota : 20}">
      </div>
      <div class="form-group">
        <label>Jadwal Latihan</label>
        <input class="input" name="jadwal_latihan" placeholder="cth: Senin & Rabu, 16.00" value="${item ? escapeAttr(item.jadwal_latihan || '') : ''}">
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea name="deskripsi">${item ? escapeHtml(item.deskripsi || '') : ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="modalCancel">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('formKlub').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (item) {
        await apiRequest(`/klub/${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Klub berhasil diperbarui');
      } else {
        await apiRequest('/klub', { method: 'POST', body: JSON.stringify(data) });
        showToast('Klub berhasil ditambahkan');
      }
      closeModal();
      loadKlub();
    } catch (e) {}
  });
}

async function deleteKlub(id) {
  if (!confirm('Yakin ingin menghapus klub ini?')) return;
  try {
    await apiRequest(`/klub/${id}`, { method: 'DELETE' });
    showToast('Klub berhasil dihapus');
    loadKlub();
  } catch (e) {}
}

// ============================================================
// PELATIH (CRUD)
// ============================================================
async function loadPelatih() {
  try {
    state.pelatih = await apiRequest('/pelatih');
    renderPelatihTable();
  } catch (e) {}
}

function renderPelatihTable() {
  const tbody = document.getElementById('tblPelatih');
  tbody.innerHTML = state.pelatih.map(p => `
    <tr>
      <td>${escapeHtml(p.nama)}</td>
      <td>${escapeHtml(p.spesialisasi)}</td>
      <td>${escapeHtml(p.no_telp)}</td>
      <td>${escapeHtml(p.email || '-')}</td>
      <td class="action-group">
        <button class="btn btn-secondary btn-sm" onclick="openPelatihForm(${p.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePelatih(${p.id})">Hapus</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5" class="muted" style="text-align:center;padding:26px;">Belum ada data pelatih.</td></tr>`;
}

document.getElementById('btnAddPelatih').addEventListener('click', () => openPelatihForm());

function openPelatihForm(id = null) {
  const item = id ? state.pelatih.find(p => p.id === id) : null;
  openModal(item ? 'Edit Pelatih' : 'Tambah Pelatih', `
    <form id="formPelatih">
      <div class="form-group">
        <label>Nama</label>
        <input class="input" name="nama" required value="${item ? escapeAttr(item.nama) : ''}">
      </div>
      <div class="form-group">
        <label>Spesialisasi</label>
        <input class="input" name="spesialisasi" required value="${item ? escapeAttr(item.spesialisasi) : ''}">
      </div>
      <div class="form-group">
        <label>No. Telepon</label>
        <input class="input" name="no_telp" required value="${item ? escapeAttr(item.no_telp) : ''}">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="input" type="email" name="email" value="${item ? escapeAttr(item.email || '') : ''}">
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="modalCancel">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('formPelatih').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (item) {
        await apiRequest(`/pelatih/${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Pelatih berhasil diperbarui');
      } else {
        await apiRequest('/pelatih', { method: 'POST', body: JSON.stringify(data) });
        showToast('Pelatih berhasil ditambahkan');
      }
      closeModal();
      loadPelatih();
    } catch (e) {}
  });
}

async function deletePelatih(id) {
  if (!confirm('Yakin ingin menghapus pelatih ini?')) return;
  try {
    await apiRequest(`/pelatih/${id}`, { method: 'DELETE' });
    showToast('Pelatih berhasil dihapus');
    loadPelatih();
  } catch (e) {}
}

// ============================================================
// PENDAFTARAN (CRUD relasi anggota <-> klub)
// ============================================================
async function loadPendaftaran() {
  try {
    state.pendaftaran = await apiRequest('/pendaftaran');
    if (!state.anggota.length) state.anggota = await apiRequest('/anggota');
    if (!state.klub.length) state.klub = await apiRequest('/klub');
    renderPendaftaranTable();
  } catch (e) {}
}

function renderPendaftaranTable() {
  const tbody = document.getElementById('tblPendaftaran');
  tbody.innerHTML = state.pendaftaran.map(p => `
    <tr>
      <td>${escapeHtml(p.nama_anggota)}</td>
      <td>${escapeHtml(p.nama_klub)}</td>
      <td>${formatDate(p.tanggal_daftar)}</td>
      <td><span class="status-pill status-${p.status}">${p.status}</span></td>
      <td class="action-group">
        <button class="btn btn-secondary btn-sm" onclick="openPendaftaranForm(${p.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePendaftaran(${p.id})">Hapus</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5" class="muted" style="text-align:center;padding:26px;">Belum ada data pendaftaran.</td></tr>`;
}

document.getElementById('btnAddPendaftaran').addEventListener('click', () => openPendaftaranForm());

function openPendaftaranForm(id = null) {
  const item = id ? state.pendaftaran.find(p => p.id === id) : null;
  const anggotaOptions = state.anggota.map(a =>
    `<option value="${a.id}" ${item && item.anggota_id === a.id ? 'selected' : ''}>${escapeHtml(a.nama)}</option>`
  ).join('');
  const klubOptions = state.klub.map(k =>
    `<option value="${k.id}" ${item && item.klub_id === k.id ? 'selected' : ''}>${escapeHtml(k.nama_klub)}</option>`
  ).join('');

  openModal(item ? 'Edit Pendaftaran' : 'Tambah Pendaftaran', `
    <form id="formPendaftaran">
      <div class="form-group">
        <label>Anggota</label>
        <select class="input" name="anggota_id" required><option value="">-- Pilih Anggota --</option>${anggotaOptions}</select>
      </div>
      <div class="form-group">
        <label>Klub</label>
        <select class="input" name="klub_id" required><option value="">-- Pilih Klub --</option>${klubOptions}</select>
      </div>
      <div class="form-group">
        <label>Tanggal Daftar</label>
        <input class="input" type="date" name="tanggal_daftar" value="${item ? formatDateInput(item.tanggal_daftar) : ''}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="input" name="status">
          <option value="Pending" ${item && item.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Aktif" ${item && item.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
          <option value="Nonaktif" ${item && item.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="modalCancel">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('formPendaftaran').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (item) {
        await apiRequest(`/pendaftaran/${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Pendaftaran berhasil diperbarui');
      } else {
        await apiRequest('/pendaftaran', { method: 'POST', body: JSON.stringify(data) });
        showToast('Pendaftaran berhasil ditambahkan');
      }
      closeModal();
      loadPendaftaran();
    } catch (e) {}
  });
}

async function deletePendaftaran(id) {
  if (!confirm('Yakin ingin menghapus data pendaftaran ini?')) return;
  try {
    await apiRequest(`/pendaftaran/${id}`, { method: 'DELETE' });
    showToast('Pendaftaran berhasil dihapus');
    loadPendaftaran();
  } catch (e) {}
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(title, bodyHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalOverlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('modalBody').innerHTML = '';
}
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
});

// ============================================================
// DARK / LIGHT MODE TOGGLE
// ============================================================
const themeToggle = document.getElementById('themeToggle');
let currentTheme = 'dark';
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('themeIcon').textContent = currentTheme === 'dark' ? '☾' : '☀';
  document.getElementById('themeLabel').textContent = currentTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang';
});

// ============================================================
// UTIL
// ============================================================
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateInput(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

// ============================================================
// INIT
// ============================================================
(async function init() {
  await checkServerStatus();
  loadDashboard();
})();
