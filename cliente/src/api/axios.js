import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  validateStatus: (status) => status < 400
});

// Interceptor para manejar 401 - token expirado o inválido
let isRefreshing = false
let failedQueue = []

// Endpoints de autenticación que no deben provocar un auto-refresh
const PUBLIC_AUTH_ENDPOINTS = [
  '/login',
  '/validacionregistro',
  '/preregistro',
  '/olvido-contrasena',
  '/recuperar-contrasena'
]

const esEndpointPublico = (url) =>
  PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url?.startsWith(endpoint))

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si la que falló es la propia llamada de refresh, no reintentes: ríndete.
    if (originalRequest.url === '/refresh') {
      isRefreshing = false
      processQueue(error)
      return Promise.reject(error)
    }

    // Los endpoints públicos de auth se propagan sin intentar refresh.
    if (esEndpointPublico(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/refresh')
        isRefreshing = false
        processQueue(null)
        return api(originalRequest)
      } catch (err) {
        isRefreshing = false
        processQueue(err)
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api;