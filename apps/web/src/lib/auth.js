import { api } from './api';

export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token, password) {
  return api.post('/auth/reset-password', { token, password });
}
