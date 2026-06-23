// ============================================
// LORY — Coming Soon Auth Gate
// Client-side credential check for pre-launch
// ============================================

const LORY_AUTH = (() => {
  'use strict';

  const SESSION_KEY = 'lory_auth';
  const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Staff credentials (add more entries as needed)
  const STAFF = [
    { user: 'makrem',     pass: 'lory2026!' },
    { user: 'admin',      pass: 'lory@staff' },
    { user: 'Dev',        pass: 'Dev@lory2026' },
    { user: 'marketing',  pass: 'Marketing@lory2026' },
    { user: 'Sinequanon', pass: 'Sinequanon@lory2026' },
    { user: 'testing',    pass: 'Testing@lory2026' },
  ];

  function isAuthed() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return Date.now() - ts < SESSION_TTL;
    } catch {
      return false;
    }
  }

  function login(user, pass) {
    const ok = STAFF.some(s => s.user === user && s.pass === pass);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, ts: Date.now() }));
    }
    return ok;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // Redirect to coming soon if not authenticated
  function guard(targetPage) {
    if (!isAuthed()) {
      window.location.replace(targetPage || 'index.html');
      return false;
    }
    return true;
  }

  return { isAuthed, login, logout, guard };
})();
