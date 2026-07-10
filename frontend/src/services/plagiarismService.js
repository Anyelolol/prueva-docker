import api from './api'

export const plagiarismService = {
  check: (did, referencia = '', tipo_evaluacion = 'similitud_semantica', did_referencia = null) =>
    api.post('/check', { did, referencia, tipo_evaluacion, did_referencia }).then(r => r.data),

  historial: () =>
    api.get('/check').then(r => r.data),

  resultado: (eid) =>
    api.get(`/check/${eid}`).then(r => r.data),

  health: () =>
    api.get('/health').then(r => r.data)
}
