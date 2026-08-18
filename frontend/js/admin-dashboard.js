(function () {
  if (!API.isAuthenticated()) { window.location.href = 'index.html'; return; }
  const alertEl = document.querySelector('[data-alert]');
  const logoutBtn = document.getElementById('logout-btn');
  const escapeHtml = (value) => { const node = document.createElement('div'); node.textContent = value ?? ''; return node.innerHTML; };

  logoutBtn.addEventListener('click', () => { API.clearToken(); window.location.href = 'index.html'; });

  async function loadDashboard() {
    try {
      const [{ user }, dashboard] = await Promise.all([API.me(), API.adminDashboard()]);
      if (user.role !== 'admin') { window.location.href = 'index.html'; return; }
      document.getElementById('welcome-name').textContent = `, ${user.name}`;
      ['name', 'email', 'role'].forEach((field) => { document.querySelector(`[data-field="${field}"]`).textContent = user[field]; });
      document.getElementById('metric-users').textContent = dashboard.metrics.users;
      document.getElementById('metric-questions').textContent = dashboard.metrics.questions;
      document.getElementById('metric-scores').textContent = dashboard.metrics.scores;
      document.getElementById('users-list').innerHTML = dashboard.users.map((member) => `<div class="info-card"><strong>${escapeHtml(member.name)}</strong><span style="color: var(--text-muted);"> · ${escapeHtml(member.email)} · ${escapeHtml(member.role)}</span></div>`).join('') || '<p>No users registered.</p>';
    } catch (err) {
      if (err.status === 401 || err.status === 403) { API.clearToken(); window.location.href = 'index.html'; return; }
      UI.showAlert(alertEl, err.message || 'Could not load the dashboard.', 'error');
    }
  }
  loadDashboard();
})();
