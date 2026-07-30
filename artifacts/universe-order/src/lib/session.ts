export function getSessionToken(): string {
  let token = localStorage.getItem('universe_session_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('universe_session_token', token);
  }
  return token;
}

export function setSessionToken(token: string) {
  localStorage.setItem('universe_session_token', token);
}

export function setActiveOrderId(id: number | null) {
  if (id === null) {
    localStorage.removeItem('universe_order_id');
  } else {
    localStorage.setItem('universe_order_id', id.toString());
  }
}

export function getActiveOrderId(): number | null {
  const id = localStorage.getItem('universe_order_id');
  return id ? parseInt(id, 10) : null;
}
