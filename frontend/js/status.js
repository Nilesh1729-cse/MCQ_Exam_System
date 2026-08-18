/**
 * Pings the backend health route and reflects real connection
 * status in the brand panel. Purely cosmetic to the user, but it's
 * a genuine, live check — not a decorative fake indicator.
 */
(function initStatusTicker() {
  const dot = document.querySelector('[data-status-dot]');
  const label = document.querySelector('[data-status-label]');
  if (!dot || !label) return;

  async function check() {
    dot.className = 'status-pulse checking';
    label.textContent = 'checking connection…';
    try {
      await API.health();
      dot.className = 'status-pulse online';
      label.textContent = 'system online · api connected';
    } catch (err) {
      dot.className = 'status-pulse offline';
      label.textContent = 'api unreachable · check backend';
    }
  }

  check();
  setInterval(check, 15000);
})();
