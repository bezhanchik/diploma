export function getToken() {
  return localStorage.getItem('token');
}

export function isAuth() {
  return !!localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}