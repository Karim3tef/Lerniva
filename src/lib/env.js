export function requireEnv(name) {
  const value = process.env[name];
  if (!value || value === 'placeholder' || value.includes('placeholder')) {
    console.warn(`[env] Missing or placeholder value for: ${name}`);
  }
  return value;
}
