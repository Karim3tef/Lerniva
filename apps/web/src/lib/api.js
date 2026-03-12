const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

function isPublicAuthRoute(path) {
  const normalizedPath = path.split('?')[0];
  return [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/verify-email/request',
    '/auth/refresh',
  ].includes(normalizedPath);
}

async function req(method, path, data) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method, headers, credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw new Error(`تعذر الاتصال بالخادم (${BASE}). تأكد أن خدمة API تعمل.`);
  }

  if (res.status === 401 && !isPublicAuthRoute(path)) {
    const ok = await tryRefresh();
    if (ok) return req(method, path, data);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return payload;
}

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
  try {
    const r = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!r.ok) return false;
    const { accessToken: t } = await r.json();
    setAccessToken(t);
    return true;
  } catch {
    return false;
  } finally {
    refreshPromise = null;
  }
  })();
  return refreshPromise;
}

export const api = {
  get:    (p)    => req('GET',    p),
  post:   (p, d) => req('POST',   p, d),
  put:    (p, d) => req('PUT',    p, d),
  patch:  (p, d) => req('PATCH',  p, d),
  delete: (p)    => req('DELETE', p),
};
