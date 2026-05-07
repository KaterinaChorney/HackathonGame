import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const formsApi = {
  saveForm: (sessionId, teamId, data) => api.post(`/forms/${sessionId}/team/${teamId}`, data),
  getTeamForms: (sessionId, teamId) => api.get(`/forms/${sessionId}/team/${teamId}`),
  getForm: (sessionId, teamId, type) => api.get(`/forms/${sessionId}/team/${teamId}/${type}`),
  updateForm: (id, data) => api.put(`/forms/${id}`, data),
  getSessionForms: (sessionId) => api.get(`/forms/${sessionId}`),
}

export default formsApi
