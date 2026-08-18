(function () {
  if (API.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('register-form');
  const alertEl = document.querySelector('[data-alert]');
  const submitBtn = document.getElementById('submit-btn');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const roleInput = document.getElementById('role');

  const nameHint = document.querySelector('[data-hint-name]');
  const emailHint = document.querySelector('[data-hint-email]');
  const passwordHint = document.querySelector('[data-hint-password]');
  const confirmHint = document.querySelector('[data-hint-confirm]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    UI.hideAlert(alertEl);
    UI.clearFieldError(nameInput, nameHint);
    UI.clearFieldError(emailInput, emailHint);
    UI.clearFieldError(passwordInput, passwordHint, 'Minimum 8 characters.');
    UI.clearFieldError(confirmInput, confirmHint);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const role = roleInput.value;

    let hasError = false;
    if (!name) {
      UI.fieldError(nameInput, nameHint, 'Name is required.');
      hasError = true;
    }
    if (!email) {
      UI.fieldError(emailInput, emailHint, 'Email is required.');
      hasError = true;
    }
    if (password.length < 8) {
      UI.fieldError(passwordInput, passwordHint, 'Password must be at least 8 characters.');
      hasError = true;
    }
    if (confirmPassword !== password) {
      UI.fieldError(confirmInput, confirmHint, 'Passwords do not match.');
      hasError = true;
    }
    if (hasError) return;

    UI.setLoading(submitBtn, true, 'Create account');
    try {
      // 1. Create the account
      await API.register({ name, email, password, role });

      // 2. Immediately log the user in
      const loginData = await API.login({ email, password });
      API.setToken(loginData.token);

      // 3. Route based on role
      if (loginData.user.role === 'examiner') {
        window.location.href = 'examiner-dashboard.html';
      } else if (loginData.user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'student-exam.html';
      }
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        UI.showAlert(alertEl, err.details.map((d) => d.msg).join(' '), 'error');
      } else {
        UI.showAlert(alertEl, err.message || 'Unable to create account.', 'error');
      }
    } finally {
      UI.setLoading(submitBtn, false, 'Create account');
    }
  });
})();