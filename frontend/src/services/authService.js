import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  register: (data) =>
    api.post('/auth/register', data).then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data)
}
