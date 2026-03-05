const BASE = process.env.NEXT_PUBLIC_API_URL;
let accessToken = null;

export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

async function req(method, path, data) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) return req(method, path, data);
    if (typeof window !== 'undefined') window.location.href = '/login';
    return;
  }
  return res.json();
}

async function tryRefresh() {
  try {
    const r = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!r.ok) return false;
    const { accessToken: t } = await r.json();
    setAccessToken(t);
    return true;
  } catch { return false; }
}

export const api = {
  get:    (p)    => req('GET',    p),
  post:   (p, d) => req('POST',   p, d),
  put:    (p, d) => req('PUT',    p, d),
  patch:  (p, d) => req('PATCH',  p, d),
  delete: (p)    => req('DELETE', p),
};
