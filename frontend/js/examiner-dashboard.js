(function () {
  if (!API.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const alertEl = document.querySelector('[data-alert]');
  const welcomeName = document.getElementById('welcome-name');
  const logoutBtn = document.getElementById('logout-btn');

  function escapeHtml(value) {
    const node = document.createElement('div');
    node.textContent = value ?? '';
    return node.innerHTML;
  }

  function setField(name, value) {
    const el = document.querySelector(`[data-field="${name}"]`);
    if (el) el.textContent = value ?? '—';
  }

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return value;
    }
  }

  async function loadProfile() {
    try {
      const { user } = await API.me();
      if (user.role !== 'examiner' && user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
      }
      welcomeName.textContent = `, ${user.name}`;
      setField('name', user.name);
      setField('email', user.email);
      setField('role', user.role);
      setField('created_at', formatDate(user.created_at));
    } catch (err) {
      if (err.status === 401) {
        API.clearToken();
        window.location.href = 'index.html';
        return;
      }
      UI.showAlert(alertEl, err.message || 'Could not load your profile.', 'error');
    }
  }

  logoutBtn.addEventListener('click', () => {
    API.clearToken();
    window.location.href = 'index.html';
  });

  // --- Examiner Interactive UI Logic ---
  const toggleBtn = document.getElementById('toggle-form-btn');
  const formSection = document.getElementById('examiner-section');
  const questionForm = document.getElementById('question-form');
  const questionMsg = document.getElementById('question-msg');
  const questionsList = document.getElementById('questions-list');

  // 1. Toggle Form Visibility
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (formSection.style.display === 'none') {
        formSection.style.display = 'block';
        toggleBtn.textContent = 'Cancel / Hide Form';
        toggleBtn.style.backgroundColor = 'transparent';
        toggleBtn.style.border = '1px solid var(--color-primary)';
      } else {
        formSection.style.display = 'none';
        toggleBtn.textContent = '+ Add New Question';
        toggleBtn.style.backgroundColor = 'var(--color-primary)';
        questionForm.reset(); // Clear form if they cancel
        questionMsg.textContent = '';
      }
    });
  }

  // 2. Load Questions from Database
  async function loadQuestions() {
    try {
      questionsList.innerHTML = '<p style="color: var(--text-muted);">Loading questions...</p>';
      const data = await API.getQuestions();

      const questions = Array.isArray(data) ? data : (data.questions || []);

      questionsList.innerHTML = ''; // Clear loading text

      if (questions.length === 0) {
        questionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 2rem;">No questions added yet. Click above to create one.</p>';
        return;
      }

      // Build a card for each question
      questions.forEach((q, index) => {
        const qCard = document.createElement('div');
        qCard.className = 'auth-card';
        qCard.style.padding = '1.5rem';
        qCard.style.borderLeft = '4px solid var(--color-primary)';

        qCard.innerHTML = `
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Q${index + 1}: ${escapeHtml(q.question_text)}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; color: var(--text-muted); font-size: 0.95rem;">
            <div><strong style="color: var(--text-primary)">A:</strong> ${escapeHtml(q.option_a)}</div>
            <div><strong style="color: var(--text-primary)">B:</strong> ${escapeHtml(q.option_b)}</div>
            <div><strong style="color: var(--text-primary)">C:</strong> ${escapeHtml(q.option_c)}</div>
            <div><strong style="color: var(--text-primary)">D:</strong> ${escapeHtml(q.option_d)}</div>
          </div>
          <div style="margin-top: 1.2rem; display: inline-block; padding: 0.2rem 0.8rem; background: rgba(56, 189, 248, 0.1); color: var(--color-primary); border-radius: 4px; font-weight: 600; font-size: 0.9rem;">
            Correct Answer: ${q.correct_option}
          </div>
          <button type="button" class="btn btn-ghost question-delete" style="width: auto; margin-left: .75rem; padding: .35rem .7rem;">Delete</button>
        `;
        qCard.querySelector('.question-delete').addEventListener('click', async () => {
          if (!window.confirm('Delete this question?')) return;
          try {
            await API.deleteQuestion(q.id);
            loadQuestions();
          } catch (err) {
            UI.showAlert(alertEl, err.message || 'Could not delete the question.', 'error');
          }
        });
        questionsList.appendChild(qCard);
      });
    } catch (err) {
      questionsList.innerHTML = `<p style="color: #ef4444;">Failed to load questions: ${err.message}</p>`;
    }
  }

  // 3. Handle Form Submission & Sync
  if (questionForm) {
    questionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      questionMsg.textContent = "Saving to database...";
      questionMsg.style.color = "var(--text-main)";

      const payload = {
        question_text: document.getElementById('question_text').value,
        option_a: document.getElementById('option_a').value,
        option_b: document.getElementById('option_b').value,
        option_c: document.getElementById('option_c').value,
        option_d: document.getElementById('option_d').value,
        correct_option: document.getElementById('correct_option').value
      };

      try {
        await API.addQuestion(payload);
        questionMsg.textContent = "Question added successfully!";
        questionMsg.style.color = "#10b981"; // Success green
        questionForm.reset();

        loadQuestions();

      } catch (err) {
        questionMsg.textContent = err.message || "Failed to add question.";
        questionMsg.style.color = "#ef4444"; // Error red
      }
    });
  }

  // Initialize both profile and questions on load
  loadProfile();
  loadQuestions();
})();
