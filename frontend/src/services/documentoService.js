import api from './api'

export const documentoService = {
  listar: () =>
    api.get('/documentos').then(r => r.data),

  obtener: (did) =>
    api.get(`/documentos/${did}`).then(r => r.data),

  subir: (archivo) => {
    const fd = new FormData()
    fd.append('archivo', archivo)
    return api.post('/documentos', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  },

  eliminar: (did) =>
    api.delete(`/documentos/${did}`).then(r => r.data)
}
