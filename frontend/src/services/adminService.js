import api from './api'

export const adminService = {
  logs: (params = {}) =>
    api.get('/admin/logs', { params }).then(r => r.data),

  listarModelos: () =>
    api.get('/modelos').then(r => r.data),

  crearModelo: (data) =>
    api.post('/modelos', data).then(r => r.data),

  actualizarModelo: (mid, data) =>
    api.put(`/modelos/${mid}`, data).then(r => r.data),

  listarUsuarios: () =>
    api.get('/usuarios').then(r => r.data),

  crearUsuario: (data) =>
    api.post('/usuarios', data).then(r => r.data),

  actualizarUsuario: (uid, data) =>
    api.put(`/usuarios/${uid}`, data).then(r => r.data),

  eliminarUsuario: (uid) =>
    api.delete(`/usuarios/${uid}`).then(r => r.data)
}
