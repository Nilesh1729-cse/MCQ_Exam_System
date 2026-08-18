// frontend/js/student-exam.js
(function () {
    if (!API.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const alertEl = document.querySelector('[data-alert]');
    const welcomeName = document.getElementById('welcome-name');
    const logoutBtn = document.getElementById('logout-btn');

    function setField(name, value) {
        const el = document.querySelector(`[data-field="${name}"]`);
        if (el) el.textContent = value ?? '—';
    }

    // --- Profile Loading ---
    async function loadProfile() {
        try {
            const { user } = await API.me();

            // Security check: Redirect if they aren't a student
            if (user.role !== 'student') {
                window.location.href = 'index.html';
                return;
            }

            welcomeName.textContent = `, ${user.name}`;
            setField('name', user.name);
            setField('email', user.email);
            setField('role', user.role);
        } catch (err) {
            API.clearToken();
            window.location.href = 'index.html';
        }
    }

    logoutBtn.addEventListener('click', () => {
        API.clearToken();
        window.location.href = 'index.html';
    });

    // --- Exam Logic ---
    const examQuestionsList = document.getElementById('exam-questions-list');
    const submitSection = document.getElementById('submit-section');
    const examForm = document.getElementById('exam-form');
    const examMsg = document.getElementById('exam-msg');
    const timerEl = document.getElementById('exam-timer');
    let timerId;
    let submitted = false;

    function escapeHtml(value) {
        const node = document.createElement('div');
        node.textContent = value ?? '';
        return node.innerHTML;
    }

    function startTimer() {
        const deadline = Date.now() + (10 * 60 * 1000);
        const updateTimer = () => {
            const remaining = Math.max(0, deadline - Date.now());
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerEl.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
            if (remaining === 0) {
                clearInterval(timerId);
                examMsg.textContent = 'Time is up. Submitting your completed answers.';
                submitExam(null, true);
            }
        };
        updateTimer();
        timerId = setInterval(updateTimer, 1000);
    }

    async function loadExam() {
        try {
            examQuestionsList.innerHTML = '<p style="color: var(--text-muted);">Loading assessment...</p>';
            const data = await API.getQuestions();
            const questions = Array.isArray(data) ? data : (data.questions || []);

            examQuestionsList.innerHTML = '';

            if (questions.length === 0) {
                examQuestionsList.innerHTML = '<p style="color: var(--text-muted);">No questions available right now.</p>';
                return;
            }

            // Render each question as a multiple choice card
            questions.forEach((q, index) => {
                const qCard = document.createElement('div');
                qCard.className = 'auth-card';
                qCard.style.padding = '1.5rem';

                // We use the question ID as the radio button group name so only one option can be selected per question
                qCard.innerHTML = `
          <h3 style="margin-bottom: 1.2rem; font-size: 1.1rem;">${index + 1}. ${escapeHtml(q.question_text)}</h3>
          <div style="display: flex; flex-direction: column; gap: 0.8rem; color: var(--text-primary);">
            <label style="cursor: pointer;"><input type="radio" name="q_${q.id}" value="A" required> A) ${escapeHtml(q.option_a)}</label>
            <label style="cursor: pointer;"><input type="radio" name="q_${q.id}" value="B" required> B) ${escapeHtml(q.option_b)}</label>
            <label style="cursor: pointer;"><input type="radio" name="q_${q.id}" value="C" required> C) ${escapeHtml(q.option_c)}</label>
            <label style="cursor: pointer;"><input type="radio" name="q_${q.id}" value="D" required> D) ${escapeHtml(q.option_d)}</label>
          </div>
        `;
                examQuestionsList.appendChild(qCard);
            });

            // Show the submit button now that questions have loaded
            submitSection.style.display = 'block';
            startTimer();

        } catch (err) {
            examQuestionsList.innerHTML = `<p style="color: #ef4444;">Failed to load exam: ${err.message}</p>`;
        }
    }

    // --- Submit Handling ---
    async function submitExam(event, allowIncomplete = false) {
            event?.preventDefault();
            if (submitted) return;
            if (!allowIncomplete && !examForm.reportValidity()) return;
            submitted = true;
            examMsg.textContent = "Submitting exam...";
            examMsg.style.color = "var(--text-main)";

            // Gather all the selected answers
            const formData = new FormData(examForm);
            const studentAnswers = [];

            for (let [key, value] of formData.entries()) {
                // Extract the question ID from the "q_id" name format
                const questionId = key.replace('q_', '');
                studentAnswers.push({ questionId, selectedOption: value });
            }

            try {
                const result = await API.submitExam(studentAnswers);

                examMsg.textContent = `Exam submitted successfully! Your score is ${result.score} / ${result.total}.`;
                examMsg.style.color = "#10b981";

                // Disable the form and button after submission
                examForm.querySelector('button[type="submit"]').disabled = true;
                const radios = examForm.querySelectorAll('input[type="radio"]');
                radios.forEach(r => r.disabled = true);
                clearInterval(timerId);

            } catch (err) {
                examMsg.textContent = err.message || "Failed to submit exam.";
                examMsg.style.color = "#ef4444";
                submitted = false;
            }
    }

    if (examForm) {
        examForm.addEventListener('submit', submitExam);
    }

    loadProfile();
    loadExam();
})();
