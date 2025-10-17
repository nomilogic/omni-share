// navigation helper to prevent redirect loops
export function navigateOnce(navigate: (to: string, opts?: any) => void, to: string, opts: any = {}) {
  try {
    const key = 'last_nav';
    const now = Date.now();
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.to === to && now - parsed.at < 1000) {
        // ignore repeated navigation to same target within 1s
        console.debug('navigateOnce: suppressed duplicate navigation to', to);
        return;
      }
    }
    sessionStorage.setItem(key, JSON.stringify({ to, at: now }));
    navigate(to, opts);
  } catch (e) {
    console.error('navigateOnce failed, falling back to navigate', e);
    navigate(to, opts);
  }
}
