import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  validateStatus: (status) => status < 500
});

// Interceptor para manejar 401 - token expirado o inválido
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/refresh')
        const newToken = response.data.accessToken
        isRefreshing = false
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        isRefreshing = false
        processQueue(err, null)
        // Only redirect if not already on login/verification pages
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/verificar-correo') &&
            !window.location.pathname.includes('/login')) {
          window.location.href = '/'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api;