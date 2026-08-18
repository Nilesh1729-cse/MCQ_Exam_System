/**
 * Small DOM helpers reused across the login/register/dashboard pages.
 */
const UI = {
  showAlert(el, message, type = 'error') {
    el.textContent = message;
    el.className = `alert show alert-${type}`;
  },
  hideAlert(el) {
    el.className = 'alert';
    el.textContent = '';
  },
  setLoading(button, isLoading, idleText) {
    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? '<span class="spinner"></span>Please wait…'
      : idleText;
  },
  fieldError(input, hintEl, message) {
    input.classList.add('invalid');
    if (hintEl) {
      hintEl.textContent = message;
      hintEl.classList.add('error-text');
    }
  },
  clearFieldError(input, hintEl, defaultHint = '') {
    input.classList.remove('invalid');
    if (hintEl) {
      hintEl.textContent = defaultHint;
      hintEl.classList.remove('error-text');
    }
  },
};
