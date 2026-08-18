/**
 * Tiny API client shared by every page.
 * To add a new backend feature: add one function here that calls
 * request(), then call it from whichever page needs it. No page
 * should build fetch() calls or URLs by hand.
 */
const API = (() => {
  const BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';
  const TOKEN_KEY = 'exam_system_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      const err = new Error('Could not reach the server. Is the backend running?');
      err.isNetworkError = true;
      throw err;
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const err = new Error((data && (data.error || data.message)) || `Request failed (${response.status})`);
      err.status = response.status;
      err.details = data && data.errors;
      throw err;
    }

    return data;
  }

  return {
    getToken,
    setToken,
    clearToken,
    isAuthenticated: () => Boolean(getToken()),

    // --- Auth endpoints ---
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
    me: () => request('/auth/me', { auth: true }),
    addQuestion: (payload) => request('/questions', { method: 'POST', body: payload, auth: true }),
    getQuestions: () => request('/questions', { method: 'GET', auth: true }),
    deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE', auth: true }),
    submitExam: (answers) => request('/questions/submit', { method: 'POST', body: { answers }, auth: true }),
    adminDashboard: () => request('/admin/dashboard', { auth: true }),
    // --- System ---
    health: () => request('/health'),
  };
})();
