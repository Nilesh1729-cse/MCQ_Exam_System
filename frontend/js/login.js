(function () {
  // If already logged in, fetch their profile and route them correctly
  if (API.isAuthenticated()) {
    API.me().then(data => {
      if (data.user.role === 'examiner') {
        window.location.href = 'examiner-dashboard.html';
      } else if (data.user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'student-exam.html';
      }
    }).catch(() => {
      API.clearToken();
    });
    return;
  }

  const form = document.getElementById('login-form');
  const alertEl = document.querySelector('[data-alert]');
  const submitBtn = document.getElementById('submit-btn');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailHint = document.querySelector('[data-hint-email]');
  const passwordHint = document.querySelector('[data-hint-password]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    UI.hideAlert(alertEl);
    UI.clearFieldError(emailInput, emailHint);
    UI.clearFieldError(passwordInput, passwordHint);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;
    if (!email) {
      UI.fieldError(emailInput, emailHint, 'Email is required.');
      hasError = true;
    }
    if (!password) {
      UI.fieldError(passwordInput, passwordHint, 'Password is required.');
      hasError = true;
    }
    if (hasError) return;

    UI.setLoading(submitBtn, true, 'Sign in');
    try {
      const data = await API.login({ email, password });
      API.setToken(data.token);

      // Routing based on the newly returned login data
      if (data.user.role === 'examiner') {
        window.location.href = 'examiner-dashboard.html';
      } else if (data.user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'student-exam.html';
      }
    } catch (err) {
      UI.showAlert(alertEl, err.message || 'Unable to sign in.', 'error');
    } finally {
      UI.setLoading(submitBtn, false, 'Sign in');
    }
  });
})();